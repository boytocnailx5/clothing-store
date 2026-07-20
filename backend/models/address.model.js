const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define('Address', {
  AddressId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  UserId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  ReceiverName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  ReceiverPhone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  Province: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  District: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Ward: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  AddressDetail: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  IsDefault: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  CreatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Addresses',
  timestamps: false
});

module.exports = Address;
