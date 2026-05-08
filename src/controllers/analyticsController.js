const Analytics = require('../models/Analytics');

// Public: POST /api/public/analytics/track
exports.trackEvent = async (req, res) => {
  try {
    const { event, metadata } = req.body;
    if (!event) return res.status(400).json({ success: false });

    await Analytics.create({ event, metadata });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// Admin: GET /api/admin/analytics/stats
exports.getStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // 1. Đếm tổng số click theo từng loại event (Total)
    const totalStats = await Analytics.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: '$event', count: { $sum: 1 } } }
    ]);

    // 2. Thống kê chi tiết theo ngày (Daily breakdown cho biểu đồ)
    const dailyStats = await Analytics.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            event: '$event'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.day': 1 } }
    ]);

    // 3. Lấy danh sách 50 sự kiện gần nhất (Recent logs)
    const recentEvents = await Analytics.find({ timestamp: { $gte: startDate } })
      .sort({ timestamp: -1 })
      .limit(50);

    // Format lại data
    const formattedTotals = totalStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.json({ 
      success: true, 
      data: {
        totals: formattedTotals,
        daily: dailyStats,
        recent: recentEvents
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
