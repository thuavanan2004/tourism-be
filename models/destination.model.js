const {
  DataTypes
} = require('sequelize');
const sequelize = require('../config/database');

const Destination = sequelize.define('Destination', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING(255)
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  information: {
    type: DataTypes.TEXT,
  },
  deleted: {
    type: DataTypes.BOOLEAN
  }
}, {
  tableName: 'destination',
  timestamps: false
});


module.exports = Destination;