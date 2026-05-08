/**
 * Seed Script — Tạo dữ liệu ban đầu cho database
 * Chạy: npm run seed
 *
 * Script này sẽ:
 * 1. Tạo tài khoản admin từ .env (hoặc default)
 * 2. Tạo categories từ hardcoded data hiện tại
 * 3. Tạo menu items mẫu
 * 4. Tạo buffet info
 * 5. Tạo shop config
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin      = require('./models/Admin');
const Category   = require('./models/Category');
const MenuItem   = require('./models/MenuItem');
const BuffetInfo = require('./models/BuffetInfo');
const ShopConfig = require('./models/ShopConfig');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tiemoc';

// Slug helper
const slugify = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB:', MONGODB_URI);

  // ── 1. Admin Account ────────────────────────────────────
  const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@tiemoc.vn';
  const adminPassword = process.env.ADMIN_PASSWORD || 'TiemOc@2026!';
  const adminName     = process.env.ADMIN_NAME     || 'Admin';

  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log('⚠️  Admin đã tồn tại:', adminEmail);
  } else {
    await Admin.create({ email: adminEmail, password: adminPassword, name: adminName, role: 'superadmin' });
    console.log('✅ Tạo admin:', adminEmail);
  }

  // ── 2. Categories ────────────────────────────────────────
  const categoryData = [
    { name: 'Món best seller', order: 0 },
    { name: 'Ốc mít',          order: 1 },
    { name: 'Ốc hương',        order: 2 },
    { name: 'Tôm',             order: 3 },
    { name: 'Ngao & Sò',       order: 4 },
    { name: 'Món khác',        order: 5 },
  ];

  const categoryMap = {};
  for (const cat of categoryData) {
    const slug = slugify(cat.name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      categoryMap[cat.name] = existing._id;
      console.log('⚠️  Category đã tồn tại:', cat.name);
    } else {
      const created = await Category.create({ ...cat, slug });
      categoryMap[cat.name] = created._id;
      console.log('✅ Tạo category:', cat.name);
    }
  }

  // ── 3. Menu Items (từ hardcoded data hiện tại) ──────────
  const menuItems = [
    {
      name: 'Tôm chanh leo',
      description: 'Món có vị chua nhẹ của chanh leo',
      price: 150000,
      categoryName: 'Tôm',
      isSignature: true, isMustTry: false,
      imageUrl: '/placeholder-tom-chanh-leo.jpg',
    },
    {
      name: 'Ốc hương trứng muối',
      description: 'Sốt trứng muối đậm đà rất hợp với bánh mì',
      price: 160000,
      categoryName: 'Ốc hương',
      isSignature: true, isMustTry: true,
      imageUrl: '/placeholder-oc-huong-trung-muoi.jpg',
    },
    {
      name: 'Tôm bỏ lò phô mai',
      description: 'Sự hòa quyện của tôm và phô mai béo ngậy',
      price: 150000,
      categoryName: 'Tôm',
      isSignature: true, isMustTry: true,
      imageUrl: '/placeholder-tom-pho-mai.jpg',
    },
    {
      name: 'Cút lộn xào me',
      description: 'Sự kết hợp hoàn hảo của sốt me, dừa và trứng cút',
      price: 50000,
      categoryName: 'Món best seller',
      isSignature: true, isMustTry: true, isBestSeller: true,
      imageUrl: '/placeholder-cut-lon-xao-me.jpg',
    },
    {
      name: 'Hàu nướng mỡ hành',
      description: 'Hàu sữa tươi béo ngậy nướng mỡ hành thơm nức',
      price: 120000,
      categoryName: 'Ngao & Sò',
      isSignature: false, isMustTry: true,
      imageUrl: '/placeholder-hau-nuong.jpg',
    },
    {
      name: 'Ngao hấp sả',
      description: 'Ngao hai vòi tươi ngon hấp sả ớt cay nồng',
      price: 80000,
      categoryName: 'Ngao & Sò',
      isSignature: false, isMustTry: true,
      imageUrl: '/placeholder-ngao-hap-sa.jpg',
    },
    {
      name: 'Sò huyết rang me',
      description: 'Sò huyết tươi rang me chua ngọt đậm đà',
      price: 90000,
      categoryName: 'Ngao & Sò',
      isSignature: false, isMustTry: true,
      imageUrl: '/placeholder-so-huyet-rang-me.jpg',
    },
    {
      name: 'Cơm rang hải sản',
      description: 'Cơm rang với hải sản tươi ngon',
      price: 70000,
      categoryName: 'Món khác',
      isSignature: false, isMustTry: true,
      imageUrl: '/placeholder-com-rang-hai-san.jpg',
    },
    {
      name: 'Gỏi đu đủ tôm nõn',
      description: 'Gỏi đu đủ xanh chua ngọt kết hợp tôm nõn',
      price: 65000,
      categoryName: 'Món khác',
      isSignature: false, isMustTry: true,
      imageUrl: '/placeholder-goi-du-du.jpg',
    },
  ];

  for (const [i, item] of menuItems.entries()) {
    const slug = slugify(item.name);
    const existing = await MenuItem.findOne({ slug });
    if (existing) {
      console.log('⚠️  MenuItem đã tồn tại:', item.name);
      continue;
    }
    await MenuItem.create({
      name: item.name,
      slug,
      description: item.description,
      price: item.price,
      image: { url: item.imageUrl, publicId: '' },
      categoryId: categoryMap[item.categoryName],
      tags: {
        isSignature:  !!item.isSignature,
        isMustTry:    !!item.isMustTry,
        isBestSeller: !!item.isBestSeller,
      },
      order: i,
      isActive: true,
    });
    console.log('✅ Tạo menu item:', item.name);
  }

  // ── 4. Buffet Info ───────────────────────────────────────
  const existingBuffet = await BuffetInfo.findOne();
  if (existingBuffet) {
    console.log('⚠️  Buffet info đã tồn tại');
  } else {
    await BuffetInfo.create({
      title: 'BUFFET TRÁNG MIỆNG',
      subtitle: 'MIỄN PHÍ',
      description: 'Chỉ cần vào gọi đồ tại quán, bạn sẽ được sử dụng quầy line buffet tráng miệng miễn phí không giới hạn',
      timeStart: '17:00',
      timeEnd: '19:00',
      items: [
        { name: 'Chè bắp', image: { url: '/placeholder-che-bap.jpg' } },
        { name: 'Chè sen', image: { url: '/placeholder-che-sen.jpg' } },
        { name: 'Xôi xoài', image: { url: '/placeholder-xoi-xoai.jpg' } },
      ],
    });
    console.log('✅ Tạo buffet info');
  }

  // ── 5. Shop Config ───────────────────────────────────────
  const existingConfig = await ShopConfig.findOne();
  if (existingConfig) {
    console.log('⚠️  Shop config đã tồn tại');
  } else {
    await ShopConfig.create({
      shopName: 'Tiệm Ốc Ngon Cô Hạnh',
      tagline: 'Ăn ngon, ngồi đẹp, giá vỉa hè',
      address: 'Số 44, đường 23, Đông Ngạc, Hà Nội',
      phone: '033 375 2829',
      openTime: '10:00',
      closeTime: '22:00',
      socialLinks: {
        tiktok: 'https://www.tiktok.com/@tiemoccohanh',
      },
      founder: {
        name: 'Cô Hạnh',
        bio: 'Với kinh nghiệm hơn 10 năm trong nghề, tôi luôn cố gắng lan tỏa những giá trị tích cực đến với khách hàng qua từng món ăn',
      },
    });
    console.log('✅ Tạo shop config');
  }

  console.log('\n🎉 Seed hoàn tất!');
  console.log('─────────────────────────────────────────');
  console.log(`📧 Admin email   : ${adminEmail}`);
  console.log(`🔑 Admin password: ${adminPassword}`);
  console.log('─────────────────────────────────────────');
  console.log('⚠️  Hãy đổi mật khẩu ngay sau khi login lần đầu!');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
