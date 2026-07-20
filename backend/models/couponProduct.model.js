const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CouponProduct = sequelize.define('CouponProduct', {
  CouponId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    references: {
      model: 'Coupons',
      key: 'CouponId'
    }
  },
  ProductId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    references: {
      model: 'Products',
      key: 'ProductId'
    }
  }
}, {
  tableName: 'CouponProducts',
  timestamps: false
});

module.exports = CouponProduct;
