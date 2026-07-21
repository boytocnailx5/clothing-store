const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  OrderItemId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  OrderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  VariantId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ProductId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ProductName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  ColorName: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  SizeName: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  SKU: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Price: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  },
  Quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  TotalPrice: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  }
}, {
  tableName: 'OrderItems',
  timestamps: false
});

module.exports = OrderItem;
