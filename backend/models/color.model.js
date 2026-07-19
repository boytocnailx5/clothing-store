const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Color = sequelize.define('Color', {
  ColorId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ColorName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  HexCode: {
    type: DataTypes.STRING(10),
    allowNull: true
  }
}, {
  tableName: 'Colors',
  timestamps: false
});

module.exports = Color;
