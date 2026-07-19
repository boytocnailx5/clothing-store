const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);

// Admin only routes
router.post('/', authMiddleware, adminMiddleware, categoryController.create);
router.put('/:id', authMiddleware, adminMiddleware, categoryController.update);
router.delete('/:id', authMiddleware, adminMiddleware, categoryController.delete);

module.exports = router;
