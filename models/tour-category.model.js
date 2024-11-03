const {
  DataTypes
} = require('sequelize');
const sequelize = require('../config/database');

const TourCategory = sequelize.define('TourCategory', {
  tourId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  categoryId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  }
}, {
  tableName: 'tours_categories',
  timestamps: false
});


module.exports = TourCategory;