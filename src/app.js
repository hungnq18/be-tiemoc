const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const publicRoutes = require('./routes/public.routes');
const adminRoutes  = require('./routes/admin.routes');

const app = express();

// ── Security ──────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Cho phép load ảnh từ Cloudinary
}));

// ── CORS ──────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

// ── Compression — gzip responses (giảm ~70% bandwidth) ────
app.use(compression());

// ── Logging ───────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Body Parsing ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Routes ────────────────────────────────────────────────
app.use('/api/public', publicRoutes);
app.use('/api/admin',  adminRoutes);

// ── Health Check ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} không tồn tại` });
});

// ── Global Error Handler ──────────────────────────────────
app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Lỗi server';

  // Xử lý lỗi từ Multer (Upload ảnh)
  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
    message = 'Ảnh quá lớn (tối đa 5MB)';
  } else if (err.name === 'MulterError') {
    status = 400;
    message = `Lỗi tải ảnh: ${err.message}`;
  }

  if (status >= 500) {
    console.error('❌ Server error:', err.stack);
    if (process.env.NODE_ENV === 'production') message = 'Lỗi hệ thống, vui lòng thử lại sau';
  }

  res.status(status).json({ success: false, message });
});

module.exports = app;
