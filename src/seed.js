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
const Admin = require('./models/Admin');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
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
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tiemoc.vn';
  const adminPassword = process.env.ADMIN_PASSWORD || 'TiemOc@2026!';
  const adminName = process.env.ADMIN_NAME || 'Admin';

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
    { name: 'Món must try', order: 1 },
    { name: 'Ốc mít', order: 2 },
    { name: 'Ốc hương', order: 3 },
    { name: 'Ốc', order: 4 },
    { name: 'Tôm', order: 5 },
    { name: 'Ngao & Sò', order: 6 },
    { name: 'Hàu', order: 7 },
    { name: 'Gà', order: 8 },
    { name: 'Món khác', order: 9 },
    { name: 'Món ăn vặt', order: 10 },
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
    // NHÓM ỐC HƯƠNG & ỐC KHÁC
    { name: 'Ốc hương hấp sả', categoryName: 'Ốc hương', price: 150000, isSignature: false },
    { name: 'Ốc hương sốt me', categoryName: 'Ốc hương', price: 150000, isSignature: false },
    { name: 'Ốc hương trứng muối', categoryName: 'Ốc hương', price: 160000, isSignature: true, isMustTry: true },
    { name: 'Ốc len sữa dừa', categoryName: 'Ốc', price: 120000, isSignature: false },
    { name: 'Ốc mít hấp sả', categoryName: 'Ốc', price: 100000, isSignature: false },
    { name: 'Ốc mít rang sả', categoryName: 'Ốc', price: 100000, isSignature: false },
    { name: 'Ốc mắm tắc', categoryName: 'Ốc', price: 110000, isSignature: false },

    // NHÓM NGAO & SÒ
    { name: 'Ngao trắng hấp Thái', categoryName: 'Ngao & Sò', price: 80000, isMustTry: true },
    { name: 'Ngao trắng sốt me', categoryName: 'Ngao & Sò', price: 85000, isSignature: false },
    { name: 'Ngao trắng sốt trứng muối', categoryName: 'Ngao & Sò', price: 95000, isSignature: false },
    { name: 'Ngao trắng sữa dừa', categoryName: 'Ngao & Sò', price: 90000, isSignature: false },
    { name: 'Ngao sần xào ngô hành', categoryName: 'Ngao & Sò', price: 85000, isSignature: false },
    { name: 'Sò huyết cháy tỏi', categoryName: 'Ngao & Sò', price: 90000, isMustTry: true },
    { name: 'Sò huyết sả ớt', categoryName: 'Ngao & Sò', price: 90000, isSignature: false },
    { name: 'Móng tay sốt cháy tỏi', categoryName: 'Ngao & Sò', price: 110000, isSignature: false },

    // NHÓM TÔM & HÀU
    { name: 'Tôm bỏ lò phô mai', categoryName: 'Tôm', price: 150000, isSignature: true, isMustTry: true },
    { name: 'Tôm nướng sa tế', categoryName: 'Tôm', price: 150000, isSignature: false },
    { name: 'Miến tôm tay cầm', categoryName: 'Tôm', price: 165000, isSignature: true },
    { name: 'Hàu nướng mỡ hành', categoryName: 'Hàu', price: 120000, isMustTry: true },
    { name: 'Hàu nướng phô mai', categoryName: 'Hàu', price: 130000, isSignature: false },
    { name: 'Cháo hàu', categoryName: 'Hàu', price: 65000, isSignature: false },

    // NHÓM GÀ & MÓN ĂN KÈM
    { name: 'Gà ủ muối hoa tiêu', categoryName: 'Gà', price: 180000, isSignature: false },
    { name: 'Gà ủ xì dầu', categoryName: 'Gà', price: 185000, isSignature: false },
    { name: 'Chân gà sả tắc', categoryName: 'Gà', price: 85000, isSignature: false },
    { name: 'Cút lộn xào me', categoryName: 'Món khác', price: 50000, isBestSeller: true, isMustTry: true },
    { name: 'Cơm rang hải sản', categoryName: 'Món khác', price: 70000, isMustTry: true },
    { name: 'Gỏi tôm sốt Thái', categoryName: 'Món khác', price: 125000, isSignature: true },
    { name: 'Nộm nõn đu đủ', categoryName: 'Món khác', price: 65000, isSignature: false },
    { name: 'Nem chua rán', categoryName: 'Món ăn vặt', price: 55000, isSignature: false },
    { name: 'Khoai tây chiên', categoryName: 'Món ăn vặt', price: 45000, isSignature: false },
    { name: 'Bánh mì bơ phô mai', categoryName: 'Món ăn vặt', price: 35000, isSignature: false }
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
      description: item.description || '',
      price: item.price,
      images: item.imageUrl ? [{ url: item.imageUrl, publicId: '' }] : [],
      categoryId: categoryMap[item.categoryName],
      tags: {
        isSignature: !!item.isSignature,
        isMustTry: !!item.isMustTry,
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
