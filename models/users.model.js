const {
  DataTypes
} = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING(15)
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING(255)
  },
  deleted: {
    type: DataTypes.BOOLEAN
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  tableName: 'users',
});

module.exports = User;