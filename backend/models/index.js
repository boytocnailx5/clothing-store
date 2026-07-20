const sequelize = require('../config/database');

const User = require('./user.model');
const Category = require('./category.model');
const Product = require('./product.model');
const Order = require('./order.model');
const Size = require('./size.model');
const Color = require('./color.model');
const ProductImage = require('./productImage.model');
const ProductVariant = require('./productVariant.model');

const Address = require('./address.model');
const Coupon = require('./coupon.model');
const CouponCategory = require('./couponCategory.model');
const CouponProduct = require('./couponProduct.model');
// Thiết lập các relationships ở đây
Category.hasMany(Category, { as: 'SubCategories', foreignKey: 'ParentId' });
Category.belongsTo(Category, { as: 'ParentCategory', foreignKey: 'ParentId' });

Category.hasMany(Product, { foreignKey: 'CategoryId', as: 'Products' });
Product.belongsTo(Category, { foreignKey: 'CategoryId', as: 'Category' });

User.hasMany(Order, { foreignKey: 'UserId', as: 'Orders' });
Order.belongsTo(User, { foreignKey: 'UserId', as: 'User' });

User.hasMany(Address, { foreignKey: 'UserId', as: 'Addresses' });
Address.belongsTo(User, { foreignKey: 'UserId', as: 'User' });

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

// Coupons
Coupon.hasMany(Order, { foreignKey: 'CouponId', as: 'Orders' });
Order.belongsTo(Coupon, { foreignKey: 'CouponId', as: 'Coupon' });

Coupon.belongsToMany(Category, { through: CouponCategory, foreignKey: 'CouponId', as: 'Categories' });
Category.belongsToMany(Coupon, { through: CouponCategory, foreignKey: 'CategoryId', as: 'Coupons' });

Coupon.belongsToMany(Product, { through: CouponProduct, foreignKey: 'CouponId', as: 'Products' });
Product.belongsToMany(Coupon, { through: CouponProduct, foreignKey: 'ProductId', as: 'Coupons' });

const db = {
  sequelize,
  User,
  Category,
  Product,
  Order,
  Address,
  Size,
  Color,
  ProductImage,
  ProductVariant,
  Coupon,
  CouponCategory,
  CouponProduct
};

module.exports = db;
