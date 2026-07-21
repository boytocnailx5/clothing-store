const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

// POST /api/upload
// Requires token and ADMIN role
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Chưa có file nào được tải lên' });
    }

    // Since index.js will serve public/uploads at /uploads, construct URL relative to root domain
    const port = process.env.PORT || 5000;
    const APP_URL = process.env.APP_URL || `http://localhost:${port}`;
    const imageUrl = `${APP_URL}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Upload thành công',
      data: {
        url: imageUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/upload/multiple
// Requires token and ADMIN role
router.post('/multiple', authMiddleware, adminMiddleware, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Chưa có file nào được tải lên' });
    }

    const port = process.env.PORT || 5000;
    const APP_URL = process.env.APP_URL || `http://localhost:${port}`;
    const fileData = req.files.map(file => ({
      url: `${APP_URL}/uploads/${file.filename}`,
      filename: file.filename
    }));

    res.status(200).json({
      success: true,
      message: 'Upload nhiều file thành công',
      data: fileData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
