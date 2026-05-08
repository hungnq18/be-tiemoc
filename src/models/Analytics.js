const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema(
  {
    event: { type: String, required: true }, // e.g., 'click_menu', 'click_buffet', 'click_phone'
    source: { type: String, default: 'frontend' },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Index để query nhanh theo thời gian và tên event
AnalyticsSchema.index({ event: 1, timestamp: -1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
