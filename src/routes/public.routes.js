const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const analyticsController = require('../controllers/analyticsController');
const feedbackController = require('../controllers/feedbackController');

// Public endpoints (không cache cho các hành động gửi data)
router.post('/feedback', feedbackController.submitFeedback);
router.post('/analytics/track', analyticsController.trackEvent);

// Cache-Control headers để browser/CDN cache public API responses
const withCache = (seconds) => (req, res, next) => {
  res.set('Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=60`);
  next();
};

// GET /api/public/categories
router.get('/categories', withCache(600), publicController.getCategories);

// GET /api/public/menu-items
router.get('/menu-items', withCache(300), publicController.getMenuItems);

// GET /api/public/buffet
router.get('/buffet', withCache(600), publicController.getBuffet);

// GET /api/public/shop-config
router.get('/shop-config', withCache(1800), publicController.getShopConfig);

module.exports = router;
