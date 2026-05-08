const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contact: { type: String, required: true }, // Số điện thoại hoặc email
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', FeedbackSchema);
