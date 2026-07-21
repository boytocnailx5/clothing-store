const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// Admin only routes
router.post('/', authMiddleware, adminMiddleware, productController.create);
router.put('/:id', authMiddleware, adminMiddleware, productController.update);
router.delete('/:id', authMiddleware, adminMiddleware, productController.delete);

// Variant routes
router.get('/:id/variants', productController.getVariants);
router.put('/:id/variants/:variantId', authMiddleware, adminMiddleware, productController.updateVariant);
router.patch('/:id/variants/:variantId/status', authMiddleware, adminMiddleware, productController.toggleVariantStatus);
router.delete('/:id/variants/:variantId', authMiddleware, adminMiddleware, productController.deleteVariant);

module.exports = router;
