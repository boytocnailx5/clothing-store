const express = require('express');
const router = express.Router();
const attributeController = require('../controllers/attribute.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

// Colors routes
router.get('/colors', attributeController.getColors);
router.post('/colors', authMiddleware, adminMiddleware, attributeController.createColor);
router.put('/colors/:id', authMiddleware, adminMiddleware, attributeController.updateColor);
router.delete('/colors/:id', authMiddleware, adminMiddleware, attributeController.deleteColor);

// Sizes routes
router.get('/sizes', attributeController.getSizes);
router.post('/sizes', authMiddleware, adminMiddleware, attributeController.createSize);
router.put('/sizes/:id', authMiddleware, adminMiddleware, attributeController.updateSize);
router.delete('/sizes/:id', authMiddleware, adminMiddleware, attributeController.deleteSize);

module.exports = router;
