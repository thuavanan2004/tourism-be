const {
  DataTypes
} = require("sequelize");
const sequelize = require("../config/database");

const Transaction = sequelize.define("Transaction", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'zalo_pay', 'momo', 'bank_transfer'),
    allowNull: false,
    defaultValue: 'cash'
  }
}, {
  tableName: 'transactions',
  timestamps: true
});

module.exports = Transaction;