const {
  DataTypes
} = require('sequelize');
const sequelize = require('../config/database');

const Departure = sequelize.define('Departure', {
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
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
  },
  updatedBy: {
    type: DataTypes.INTEGER,
  },
  deletedBy: {
    type: DataTypes.INTEGER,
  }
}, {
  tableName: 'departure',
  timestamps: true
});


module.exports = Departure;