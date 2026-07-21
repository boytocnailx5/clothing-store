const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

// All inventory routes are Admin only
router.use(authMiddleware, adminMiddleware);

router.get('/overview', inventoryController.getOverview);
router.get('/logs', inventoryController.getLogs);
router.put('/variants/:variantId/stock', inventoryController.adjustStock);

module.exports = router;
