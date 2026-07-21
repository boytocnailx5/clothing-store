const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryLog = sequelize.define('InventoryLog', {
  LogId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  VariantId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ProductId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ChangeQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  OldQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  NewQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'MANUAL_UPDATE',
    validate: {
      isIn: [['MANUAL_UPDATE', 'ORDER_DEDUCT', 'ORDER_RESTORE', 'SYSTEM']]
    }
  },
  Note: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  CreatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'InventoryLogs',
  timestamps: false
});

module.exports = InventoryLog;
