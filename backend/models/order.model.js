const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  OrderId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  UserId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  OrderCode: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  OrderStatus: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'PENDING',
    validate: {
      isIn: [['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED']]
    }
  },
  PaymentMethod: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'COD',
    validate: {
      isIn: [['COD', 'BANKING', 'VNPAY']]
    }
  },
  PaymentStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'UNPAID',
    validate: {
      isIn: [['UNPAID', 'PAID', 'REFUNDED']]
    }
  },
  Subtotal: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  },
  DiscountAmount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0
  },
  ShippingFee: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0
  },
  TotalAmount: {
    type: DataTypes.DECIMAL(18, 2),
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
  ShippingAddress: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  CustomerNote: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  CancelReason: {
    type: DataTypes.STRING(500),
    allowNull: true
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
  tableName: 'Orders',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt'
});

module.exports = Order;
