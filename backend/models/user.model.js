const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  UserId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  FullName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true
  },
  Phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  PasswordHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  Role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'CUSTOMER',
    validate: {
      isIn: [['CUSTOMER', 'ADMIN']]
    }
  },
  Status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'ACTIVE',
    validate: {
      isIn: [['ACTIVE', 'BLOCKED']]
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
  tableName: 'Users',
  timestamps: true, // Use Sequelize's timestamps but map them to custom columns
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt'
});

module.exports = User;
