const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

const adminController = require('../controllers/adminController');

// Auth — không cần middleware
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.getMe);
router.put('/auth/change-password', auth, authController.changePassword);

// ── Categories CRUD ─────────────────────────────────────────
router.get('/categories', auth, adminController.getCategories);
router.post('/categories', auth, adminController.createCategory);
router.put('/categories/:id', auth, adminController.updateCategory);
router.delete('/categories/:id', auth, adminController.deleteCategory);
router.post('/categories/reorder', auth, adminController.reorderCategories);

// ── Menu Items CRUD ─────────────────────────────────────────
router.post('/menu-items', auth, adminController.createMenuItem);
router.put('/menu-items/:id', auth, adminController.updateMenuItem);
router.delete('/menu-items/:id', auth, adminController.deleteMenuItem);
router.post('/menu-items/reorder', auth, adminController.reorderMenuItems);

// ── Buffet & Config ─────────────────────────────────────────
router.put('/buffet', auth, adminController.updateBuffet);
router.put('/shop-config', auth, adminController.updateShopConfig);

// ── Analytics ───────────────────────────────────────────────
const analyticsController = require('../controllers/analyticsController');
router.get('/analytics/stats', auth, analyticsController.getStats);

// ── Uploads ─────────────────────────────────────────────────
const { upload } = require('../middleware/upload');
router.post('/upload', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Không có file nào được tải lên' });
  res.json({
    success: true,
    data: {
      url: req.file.path,
      publicId: req.file.filename
    }
  });
});

// ── Feedback ────────────────────────────────────────────────
const feedbackController = require('../controllers/feedbackController');
router.get('/feedback', auth, feedbackController.getAllFeedback);
router.put('/feedback/read-all', auth, feedbackController.markAllAsRead);
router.put('/feedback/:id/read', auth, feedbackController.markAsRead);
router.delete('/feedback/:id', auth, feedbackController.deleteFeedback);

module.exports = router;
