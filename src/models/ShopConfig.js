const mongoose = require('mongoose');

// Singleton document — 1 bản ghi duy nhất chứa toàn bộ cấu hình quán
const ShopConfigSchema = new mongoose.Schema(
  {
    shopName: { type: String, default: 'Tiệm Ốc Ngon Cô Hạnh' },
    logo: {
      url:      { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    tagline: { type: String, default: 'Ăn ngon, ngồi đẹp, giá vỉa hè' },
    address: { type: String, default: 'Số 44, đường 23, Đông Ngạc, Hà Nội' },
    phone: { type: String, default: '033 375 2829' },
    email: { type: String, default: '' },
    openTime: { type: String, default: '10:00' },
    closeTime: { type: String, default: '22:00' },
    morningOpenTime: { type: String, default: '10:00' },
    morningCloseTime: { type: String, default: '14:00' },
    afternoonOpenTime: { type: String, default: '16:00' },
    afternoonCloseTime: { type: String, default: '22:00' },
    socialLinks: {
      facebook:  { type: String, default: '' },
      tiktok:    { type: String, default: 'https://www.tiktok.com/@tiemoccohanh' },
      instagram: { type: String, default: '' },
      zalo:      { type: String, default: '' },
      youtube:   { type: String, default: '' },
    },
    founder: {
      name: { type: String, default: 'Cô Hạnh' },
      bio:  { type: String, default: 'Với kinh nghiệm hơn 10 năm trong nghề, tôi luôn cố gắng lan tỏa những giá trị tích cực đến với khách hàng qua từng món ăn' },
      image: {
        url:      { type: String, default: '' },
        publicId: { type: String, default: '' },
      },
    },
    seo: {
      title:       { type: String, default: 'Tiệm Ốc Cô Hạnh | Ốc Ngon Hà Nội' },
      description: { type: String, default: 'Quán ốc ngon nổi tiếng tại Hà Nội với công thức sốt độc quyền.' },
      keywords:    { type: String, default: 'tiệm ốc cô hạnh, quán ốc hà nội, ốc ngon' },
      ogImage: {
        url:      { type: String, default: '' },
        publicId: { type: String, default: '' },
      },
    },
    cta: [
      {
        label: { type: String, default: 'Gọi Hotline' },
        link:  { type: String, default: 'tel:0333752829' },
        icon:  { type: String, default: 'Phone' },
        iconImage: {
          url: { type: String, default: '' },
          publicId: { type: String, default: '' },
        },
        color: { type: String, default: 'primary' },
      },
      {
        label: { type: String, default: 'Đặt bàn ngay' },
        link:  { type: String, default: 'https://zalo.me/0333752829' },
        icon:  { type: String, default: 'MessageCircle' },
        iconImage: {
          url: { type: String, default: '' },
          publicId: { type: String, default: '' },
        },
        color: { type: String, default: 'secondary' },
      }
    ],
    footerAboutLinks: [
      { label: { type: String, default: 'Thực đơn' }, link: { type: String, default: '/menu' } },
      { label: { type: String, default: 'Khuyến mãi' }, link: { type: String, default: '#buffet-section' } },
      { label: { type: String, default: 'Món ăn đặc sắc' }, link: { type: String, default: '#signature-dishes' } },
    ],
    footerSocialLinks: [
      { label: { type: String, default: 'Tiệm ốc ngon cô Hạnh' }, link: { type: String, default: '#' } },
      { label: { type: String, default: 'TikTok Cô Hạnh' }, link: { type: String, default: 'https://www.tiktok.com/@tiemoccohanh' } },
      { label: { type: String, default: 'YouTube Channel' }, link: { type: String, default: '#' } },
    ],
    footerCopyright: { type: String, default: '© 2026 TIỆM ỐC CÔ HẠNH. DESIGNED WITH PASSION.' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShopConfig', ShopConfigSchema);
