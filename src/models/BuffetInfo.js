const mongoose = require('mongoose');

const BuffetItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, default: '' },
    },
    position: { type: String, enum: ['main', 'left', 'right'], default: 'main' },
  },
  { _id: false }
);

// Singleton document — chỉ có 1 bản ghi
const BuffetInfoSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'BUFFET TRÁNG MIỆNG' },
    subtitle: { type: String, default: 'MIỄN PHÍ' },
    description: { type: String, default: 'Chỉ cần vào gọi đồ tại quán, bạn sẽ được sử dụng quầy line buffet tráng miệng miễn phí không giới hạn' },
    timeStart: { type: String, default: '17:00' },
    timeEnd: { type: String, default: '19:00' },
    items: { type: [BuffetItemSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BuffetInfo', BuffetInfoSchema);
