const {
  DataTypes
} = require('sequelize');
const sequelize = require('../config/database');

const TourDetail = sequelize.define('TourDetail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tourId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Tour',
      key: 'id'
    }
  },
  childrenPrice: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  childPrice: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  babyPrice: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  singleRoomSupplementPrice: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  dayStart: {
    type: DataTypes.DATE,
    allowNull: false
  },
  dayReturn: {
    type: DataTypes.DATE,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'tour_detail',
});

module.exports = TourDetail;