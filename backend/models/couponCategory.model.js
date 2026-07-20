const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CouponCategory = sequelize.define('CouponCategory', {
  CouponId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    references: {
      model: 'Coupons',
      key: 'CouponId'
    }
  },
  CategoryId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Categories',
      key: 'CategoryId'
    }
  }
}, {
  tableName: 'CouponCategories',
  timestamps: false
});

module.exports = CouponCategory;
