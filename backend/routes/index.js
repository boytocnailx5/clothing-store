const express = require('express');
const router = express.Router();

// Import routes
const userRoute = require('./user.route');
const categoryRoute = require('./category.route');
const productRoute = require('./product.route');
const orderRoute = require('./order.route');

// API Routes
router.use('/users', userRoute);
router.use('/categories', categoryRoute);
router.use('/products', productRoute);
router.use('/orders', orderRoute);

module.exports = router;
