const sequelize = require('../config/database');

const User = require('./user.model');
const Category = require('./category.model');
const Product = require('./product.model');
const Order = require('./order.model');

// Thiết lập các relationships ở đây
Category.hasMany(Category, { as: 'SubCategories', foreignKey: 'ParentId' });
Category.belongsTo(Category, { as: 'ParentCategory', foreignKey: 'ParentId' });

Category.hasMany(Product, { foreignKey: 'CategoryId' });
Product.belongsTo(Category, { foreignKey: 'CategoryId' });

User.hasMany(Order, { foreignKey: 'UserId' });
Order.belongsTo(User, { foreignKey: 'UserId' });

const db = {
  sequelize,
  User,
  Category,
  Product,
  Order
};

module.exports = db;
