const {
  DataTypes
} = require('sequelize');
const sequelize = require('../config/database');


const Permissions = sequelize.define('Permissions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(255),
  }
}, {
  tableName: 'permissions',
  timestamps: true
});



module.exports = Permissions;