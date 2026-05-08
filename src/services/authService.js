const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const JWT_SECRET  = process.env.JWT_SECRET  || 'tiemoc-jwt-secret-dev';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

class AuthService {
  /**
   * Xác thực admin và trả về JWT token
   */
  async login(email, password) {
    if (!email || !password) {
      const err = new Error('Vui lòng nhập email và mật khẩu');
      err.status = 400;
      throw err;
    }

    const admin = await Admin.findOne({ email: email.toLowerCase(), isActive: true }).select('+password');
    if (!admin) {
      const err = new Error('Email hoặc mật khẩu không đúng');
      err.status = 401;
      throw err;
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Email hoặc mật khẩu không đúng');
      err.status = 401;
      throw err;
    }

    // Ghi lại thời điểm đăng nhập
    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: admin.role, email: admin.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return { token, expiresIn: JWT_EXPIRES, admin: admin.toJSON() };
  }

  /**
   * Lấy thông tin admin hiện tại theo id
   */
  async getById(id) {
    const admin = await Admin.findById(id);
    if (!admin) {
      const err = new Error('Tài khoản không tồn tại');
      err.status = 404;
      throw err;
    }
    return admin;
  }

  /**
   * Đổi mật khẩu — xác minh mật khẩu cũ trước khi lưu mới
   */
  async changePassword(id, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      const err = new Error('Vui lòng nhập đầy đủ thông tin');
      err.status = 400;
      throw err;
    }
    if (newPassword.length < 6) {
      const err = new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
      err.status = 400;
      throw err;
    }

    const admin = await Admin.findById(id).select('+password');
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      const err = new Error('Mật khẩu hiện tại không đúng');
      err.status = 401;
      throw err;
    }

    admin.password = newPassword; // pre-save hook sẽ tự hash
    await admin.save();
  }
}

module.exports = new AuthService();
