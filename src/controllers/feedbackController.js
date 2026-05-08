const Feedback = require('../models/Feedback');

// Public: POST /api/public/feedback
exports.submitFeedback = async (req, res, next) => {
  try {
    const { name, contact, message } = req.body;
    if (!name || !contact || !message) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đủ thông tin' });
    }

    const feedback = await Feedback.create({ name, contact, message });
    res.json({ success: true, data: feedback });
  } catch (err) {
    next(err);
  }
};

// Admin: GET /api/admin/feedback
exports.getAllFeedback = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status === 'read') query.isRead = true;
    if (status === 'unread') query.isRead = false;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const [items, total] = await Promise.all([
      Feedback.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Feedback.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// Admin: PUT /api/admin/feedback/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json({ success: true, data: feedback });
  } catch (err) {
    next(err);
  }
};

// Admin: PUT /api/admin/feedback/mark-all-read
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Feedback.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc' });
  } catch (err) {
    next(err);
  }
};

// Admin: DELETE /api/admin/feedback/:id
exports.deleteFeedback = async (req, res, next) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
