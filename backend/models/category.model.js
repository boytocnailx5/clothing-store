const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  CategoryId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ParentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Categories',
      key: 'CategoryId'
    }
  },
  CategoryName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Slug: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true
  },
  Description: {
    type: DataTypes.STRING(500),
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
  tableName: 'Categories',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: false // Bảng này không có UpdatedAt trong schema
});

module.exports = Category;
