const {
  DataTypes
} = require('sequelize');
const sequelize = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tourId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'tours',
      key: 'id'
    },
    allowNull: false
  },
  day: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  information: {
    type: DataTypes.TEXT,
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
  tableName: 'schedule',
});

module.exports = Schedule;