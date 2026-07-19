const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductVariant = sequelize.define('ProductVariant', {
  VariantId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  ProductId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  SizeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ColorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  SKU: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  StockQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  AdditionalPrice: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0
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
  },
  UpdatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ProductVariants',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt'
});

module.exports = ProductVariant;
