const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Size = sequelize.define('Size', {
  SizeId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  SizeName: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  SortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'Sizes',
  timestamps: false
});

module.exports = Size;
