const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductImage = sequelize.define('ProductImage', {
  ImageId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  ProductId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  ImageUrl: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  IsPrimary: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  SortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  ColorName: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  ColorId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  CreatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ProductImages',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: false
});

module.exports = ProductImage;
