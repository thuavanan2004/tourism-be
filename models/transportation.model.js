const {
  DataTypes
} = require('sequelize');
const sequelize = require('../config/database');

const Transportation = sequelize.define('Transportation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    unique: true
  },
  information: {
    type: DataTypes.TEXT,
  }
}, {
  tableName: 'transportation',
  timestamps: false
});


module.exports = Transportation;