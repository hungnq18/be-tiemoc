const authService = require('../services/authService');

// POST /api/admin/auth/login
exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const admin = await authService.getById(req.admin.id);
    res.json({ success: true, admin });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.admin.id, currentPassword, newPassword);
    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    next(err);
  }
};
