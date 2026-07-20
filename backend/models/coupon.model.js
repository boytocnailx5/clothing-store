const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  CouponId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  Code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  Name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Description: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  DiscountType: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'FIXED_AMOUNT',
    validate: {
      isIn: [['FIXED_AMOUNT', 'PERCENTAGE']]
    }
  },
  DiscountValue: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  },
  MinOrderValue: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0
  },
  MaxDiscountAmount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true
  },
  UsageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  UsedCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  UsageLimitPerUser: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ApplyTo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'ALL',
    validate: {
      isIn: [['ALL', 'CATEGORY', 'PRODUCT']]
    }
  },
  StartDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  EndDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  IsActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  CreatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Coupons',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: false // We don't have UpdatedAt in the schema
});

module.exports = Coupon;
