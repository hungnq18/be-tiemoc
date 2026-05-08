const { categoryService, menuItemService, buffetService, shopConfigService } = require('../services/contentService');

// GET /api/public/categories
exports.getCategories = async (req, res, next) => {
  try {
    const result = await categoryService.getAll({
      includeInactive: req.query.admin === 'true'
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

// GET /api/public/menu-items?category=<slug>&tag=<tag>&page=<page>&limit=<limit>&admin=<boolean>
exports.getMenuItems = async (req, res, next) => {
  try {
    const result = await menuItemService.getAll({
      categorySlug: req.query.category,
      tag: req.query.tag,
      page: req.query.page,
      limit: req.query.limit,
      includeInactive: req.query.admin === 'true' // Hỗ trợ xem ẩn trong admin
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

// GET /api/public/buffet
exports.getBuffet = async (req, res, next) => {
  try {
    const result = await buffetService.get();
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

// GET /api/public/shop-config
exports.getShopConfig = async (req, res, next) => {
  try {
    const result = await shopConfigService.get();
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
