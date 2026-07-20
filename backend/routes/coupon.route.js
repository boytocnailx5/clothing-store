const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

// Public or User routes (validation)
// We need authMiddleware if we want to track UsageLimitPerUser.
// We can use a custom optional auth middleware, but for now we'll require login for checkout.
router.post('/validate', authMiddleware, couponController.validate);

// Admin only routes for managing coupons
router.get('/', authMiddleware, adminMiddleware, couponController.getAll);
router.get('/:id', authMiddleware, adminMiddleware, couponController.getById);
router.post('/', authMiddleware, adminMiddleware, couponController.create);
router.put('/:id', authMiddleware, adminMiddleware, couponController.update);
router.delete('/:id', authMiddleware, adminMiddleware, couponController.delete);
router.patch('/:id/toggle', authMiddleware, adminMiddleware, couponController.toggleActive);

module.exports = router;
