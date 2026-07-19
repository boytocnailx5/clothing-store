const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  ProductId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  CategoryId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ProductName: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  Slug: {
    type: DataTypes.STRING(250),
    allowNull: false,
    unique: true
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  BasePrice: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  },
  SalePrice: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true
  },
  Gender: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'UNISEX',
    validate: {
      isIn: [['MALE', 'FEMALE', 'UNISEX', 'KIDS']]
    }
  },
  Status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'ACTIVE',
    validate: {
      isIn: [['ACTIVE', 'HIDDEN']]
    }
  },
  CreatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  UpdatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Products',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt'
});

module.exports = Product;
