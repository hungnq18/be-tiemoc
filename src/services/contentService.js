const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const BuffetInfo = require('../models/BuffetInfo');
const ShopConfig = require('../models/ShopConfig');

// ── In-memory cache ───────────────────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

const getFromCache = (key) => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL) { cache.delete(key); return null; }
  return item.data;
};
const setCache = (key, data) => cache.set(key, { data, timestamp: Date.now() });

// Export để controller/admin service có thể clear khi update
const clearCache = (patterns) => {
  if (!patterns) {
    cache.clear();
    return;
  }
  const patternList = Array.isArray(patterns) ? patterns : [patterns];
  
  for (const key of cache.keys()) {
    const shouldDelete = patternList.some(p => key.startsWith(p));
    if (shouldDelete) {
      cache.delete(key);
    }
  }
};

// ── Category Service ──────────────────────────────────────────────────────────
class CategoryService {
  async getAll(options = {}) {
    const { includeInactive = false } = options;
    const cacheKey = `categories-${includeInactive}`;
    
    const cached = getFromCache(cacheKey);
    if (cached) return { data: cached, cached: true };

    const query = includeInactive ? {} : { isActive: true };
    const data = await Category.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    setCache(cacheKey, data);
    return { data, cached: false };
  }

  async create(payload) {
    try {
      const category = await Category.create(payload);
      clearCache(['categories-false', 'categories-true']);
      return category;
    } catch (err) {
      if (err.code === 11000) {
        const e = new Error('Tên danh mục hoặc slug đã tồn tại');
        e.status = 400;
        throw e;
      }
      throw err;
    }
  }

  async update(id, payload) {
    try {
      const category = await Category.findById(id);
      if (!category) { 
        const e = new Error('Danh mục không tồn tại'); 
        e.status = 404; 
        throw e; 
      }
      
      // Update fields
      if (payload.name !== undefined) category.name = payload.name;
      if (payload.order !== undefined) category.order = payload.order;
      if (payload.isActive !== undefined) category.isActive = payload.isActive;

      await category.save();
      clearCache(['categories-false', 'categories-true']);
      return category;
    } catch (err) {
      if (err.code === 11000) {
        const e = new Error('Tên danh mục hoặc slug đã tồn tại');
        e.status = 400;
        throw e;
      }
      throw err;
    }
  }

  async delete(id) {
    const inUse = await MenuItem.exists({ categoryId: id });
    if (inUse) {
      const e = new Error('Không thể xóa danh mục đang có món ăn');
      e.status = 409;
      throw e;
    }
    await Category.findByIdAndDelete(id);
    clearCache(['categories-false', 'categories-true']);
    return { success: true };
  }

  async reorder(orderedIds) {
    const ops = orderedIds.map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { order: index } },
    }));
    await Category.bulkWrite(ops);
    clearCache(['categories-false', 'categories-true']);
  }
}

// ── MenuItem Service ──────────────────────────────────────────────────────────
class MenuItemService {
  async getAll({ categorySlug, tag, page = 1, limit = 10, includeInactive = false } = {}) {
    const cacheKey = `menu-${categorySlug || ''}-${tag || ''}-${page}-${limit}-${includeInactive}`;
    
    // Nếu là admin (includeInactive = true), bỏ qua cache để luôn lấy dữ liệu mới nhất
    if (!includeInactive) {
      const cached = getFromCache(cacheKey);
      if (cached) return { data: cached, cached: true };
    }

    const filter = {};
    if (!includeInactive) filter.isActive = true;

    if (categorySlug) {
      const cat = await Category.findOne({ slug: categorySlug }).lean();
      if (cat) filter.categoryId = cat._id;
    }
    if (tag === 'signature')   filter['tags.isSignature']  = true;
    if (tag === 'must-try')    filter['tags.isMustTry']    = true;
    if (tag === 'best-seller') filter['tags.isBestSeller'] = true;

    const skip = (page - 1) * limit;

    // Sử dụng aggregation để có thể sort theo trường của model được populate (category.order)
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'categories', // Tên collection trong MongoDB
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $sort: {
          'categoryInfo.order': 1,
          'order': 1,
          'createdAt': -1
        }
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
              $project: {
                // Giả lập cấu trúc giống .populate('categoryId') để frontend không bị lỗi
                _id: 1,
                name: 1,
                slug: 1,
                description: 1,
                price: 1,
                images: 1,
                tags: 1,
                order: 1,
                isActive: 1,
                createdAt: 1,
                updatedAt: 1,
                categoryId: {
                  _id: '$categoryInfo._id',
                  name: '$categoryInfo.name',
                  slug: '$categoryInfo.slug',
                  order: '$categoryInfo.order'
                }
              }
            }
          ]
        }
      }
    ];

    const [aggregateResult] = await MenuItem.aggregate(pipeline);
    const data = aggregateResult.data;
    const total = aggregateResult.metadata[0]?.total || 0;

    const result = {
      items: data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };

    setCache(cacheKey, result);
    return { data: result, cached: false };
  }

  async getById(id) {
    const item = await MenuItem.findById(id).populate('categoryId', 'name slug').lean();
    if (!item) { const e = new Error('Món ăn không tồn tại'); e.status = 404; throw e; }
    return item;
  }

  async create(payload) {
    try {
      const item = await MenuItem.create(payload);
      clearCache('menu'); // Chỉ xóa cache liên quan đến menu
      return item;
    } catch (err) {
      if (err.code === 11000) {
        const e = new Error('Tên món ăn hoặc slug đã tồn tại');
        e.status = 400;
        throw e;
      }
      throw err;
    }
  }

  async update(id, payload) {
    try {
      const item = await MenuItem.findById(id);
      if (!item) { const e = new Error('Món ăn không tồn tại'); e.status = 404; throw e; }
      
      // Update fields
      Object.assign(item, payload);

      await item.save();
      clearCache('menu');
      return item;
    } catch (err) {
      if (err.code === 11000) {
        const e = new Error('Tên món ăn hoặc slug đã tồn tại');
        e.status = 400;
        throw e;
      }
      throw err;
    }
  }

  async delete(id) {
    const item = await MenuItem.findByIdAndDelete(id);
    if (!item) { const e = new Error('Món ăn không tồn tại'); e.status = 404; throw e; }
    clearCache('menu');
  }

  async reorder(orderedIds) {
    const ops = orderedIds.map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { order: index } },
    }));
    await MenuItem.bulkWrite(ops);
    clearCache();
  }
}

// ── Buffet Service ────────────────────────────────────────────────────────────
class BuffetService {
  async get() {
    let data = await BuffetInfo.findOne().lean();
    if (!data) {
      data = (await BuffetInfo.create({})).toObject();
    }
    return { data, cached: false };
  }

  async update(payload) {
    const { _id, __v, items, ...rest } = payload;
    
    // Đảm bảo chỉ lưu các trường cần thiết cho từng món
    const sanitizedItems = (items || []).map(item => ({
      name: item.name,
      image: {
        url: item.image?.url || '',
        publicId: item.image?.publicId || ''
      },
      position: item.position || 'main'
    }));
    
    const buffet = await BuffetInfo.findOneAndUpdate(
      {}, 
      { ...rest, items: sanitizedItems, isActive: true },
      { new: true, upsert: true, runValidators: true }
    );
    
    clearCache('buffet');
    return buffet;
  }
}

// ── ShopConfig Service ────────────────────────────────────────────────────────
class ShopConfigService {
  async get() {
    let data = await ShopConfig.findOne().lean();
    if (!data) {
      data = (await ShopConfig.create({})).toObject();
    }
    
    // Đảm bảo luôn có footerAboutLinks mặc định nếu bị trống
    if (!data.footerAboutLinks || data.footerAboutLinks.length === 0) {
      data.footerAboutLinks = [
        { label: 'Thực đơn', link: '/menu' },
        { label: 'Khuyến mãi', link: '#buffet-section' },
        { label: 'Món ăn đặc sắc', link: '#signature-dishes' },
      ];
    }
    // Đảm bảo luôn có footerSocialLinks mặc định nếu bị trống
    if (!data.footerSocialLinks || data.footerSocialLinks.length === 0) {
      data.footerSocialLinks = [
        { label: 'Facebook', link: '#' },
        { label: 'TikTok', link: 'https://www.tiktok.com/@tiemoccohanh' },
        { label: 'YouTube', link: '#' },
      ];
    }
    if (!data.footerCopyright) {
      data.footerCopyright = '© 2026 TIỆM ỐC CÔ HẠNH. DESIGNED WITH PASSION.';
    }

    return { data, cached: false };
  }

  async update(payload) {
    const { _id, __v, ...updateData } = payload;
    const config = await ShopConfig.findOneAndUpdate(
      {}, 
      updateData, 
      { new: true, upsert: true, runValidators: true }
    );
    clearCache('shop-config');
    return config;
  }
}

module.exports = {
  categoryService:  new CategoryService(),
  menuItemService:  new MenuItemService(),
  buffetService:    new BuffetService(),
  shopConfigService:new ShopConfigService(),
  clearCache,
};
