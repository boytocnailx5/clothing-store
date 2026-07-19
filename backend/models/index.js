const sequelize = require('../config/database');

const User = require('./user.model');
const Category = require('./category.model');
const Product = require('./product.model');
const Order = require('./order.model');
const Size = require('./size.model');
const Color = require('./color.model');
const ProductImage = require('./productImage.model');
const ProductVariant = require('./productVariant.model');

// Thiết lập các relationships ở đây
Category.hasMany(Category, { as: 'SubCategories', foreignKey: 'ParentId' });
Category.belongsTo(Category, { as: 'ParentCategory', foreignKey: 'ParentId' });

Category.hasMany(Product, { foreignKey: 'CategoryId', as: 'Products' });
Product.belongsTo(Category, { foreignKey: 'CategoryId', as: 'Category' });

User.hasMany(Order, { foreignKey: 'UserId' });
Order.belongsTo(User, { foreignKey: 'UserId' });

// Product - ProductImage
Product.hasMany(ProductImage, { foreignKey: 'ProductId', as: 'Images', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'ProductId' });

// Product - ProductVariant
Product.hasMany(ProductVariant, { foreignKey: 'ProductId', as: 'Variants', onDelete: 'CASCADE' });
ProductVariant.belongsTo(Product, { foreignKey: 'ProductId' });

// ProductVariant - Size & Color
Size.hasMany(ProductVariant, { foreignKey: 'SizeId', as: 'Variants' });
ProductVariant.belongsTo(Size, { foreignKey: 'SizeId', as: 'Size' });

Color.hasMany(ProductVariant, { foreignKey: 'ColorId', as: 'Variants' });
ProductVariant.belongsTo(Color, { foreignKey: 'ColorId', as: 'Color' });

const db = {
  sequelize,
  User,
  Category,
  Product,
  Order,
  Size,
  Color,
  ProductImage,
  ProductVariant
};

module.exports = db;
