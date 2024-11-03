const {
  DataTypes
} = require('sequelize');
const sequelize = require('../config/database');

const Image = sequelize.define('Image', {
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
  name: {
    type: DataTypes.STRING(255),
  },
  source: {
    type: DataTypes.STRING(255),
    allowNull: false,
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
  tableName: 'images',
});

module.exports = Image;