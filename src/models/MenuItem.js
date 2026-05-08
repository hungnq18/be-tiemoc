const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' }, // Cloudinary public_id
  },
  { _id: false }
);

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    images: { type: [ImageSchema], default: [] },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    // Flags cho sections khác nhau trên homepage
    tags: {
      isSignature: { type: Boolean, default: false },  // SignatureDishes section
      isMustTry:   { type: Boolean, default: false },  // MustTrySection
      isBestSeller:{ type: Boolean, default: false },
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Helper to generate slug from name (Vietnamese friendly)
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

MenuItemSchema.pre('validate', function() {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
});

// Middleware để di chuyển dữ liệu từ 'image' cũ sang 'images' mới và xóa trường cũ
MenuItemSchema.pre('save', function() {
  if (this.get('image') && (!this.images || this.images.length === 0)) {
    this.images = [this.get('image')];
  }
  this.set('image', undefined);
});

// Đối với findOneAndUpdate (khi update từ Admin)
MenuItemSchema.pre('findOneAndUpdate', function() {
  const update = this.getUpdate();
  if (update && update.images) {
    // Nếu đang update images, ta đảm bảo unset image cũ
    if (!update.$unset) update.$unset = {};
    update.$unset.image = "";
  }
});

// Compound indexes để query homepage sections nhanh
MenuItemSchema.index({ 'tags.isSignature': 1, isActive: 1, order: 1 });
MenuItemSchema.index({ 'tags.isMustTry': 1, isActive: 1, order: 1 });
MenuItemSchema.index({ categoryId: 1, isActive: 1, order: 1 });

module.exports = mongoose.model('MenuItem', MenuItemSchema);
