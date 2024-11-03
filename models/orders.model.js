const {
  DataTypes
} = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  transactionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Transaction',
      key: 'id'
    }
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending'
  }
}, {
  tableName: 'orders',
  timestamps: true
});

module.exports = Order;