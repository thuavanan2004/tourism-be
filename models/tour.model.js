const {
  DataTypes
} = require("sequelize");
const sequelize = require("../config/database");


const Tour = sequelize.define("Tour", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(15),
    unique: true
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  destinationId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Destination',
      key: 'id'
    },
    allowNull: false
  },
  transportationId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Transportation',
      key: 'id'
    },
    allowNull: false
  },
  departureId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Departure',
      key: 'id'
    },
    allowNull: false
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deletedAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
  createdBy: {
    type: DataTypes.INTEGER
  },
  deletedBy: {
    type: DataTypes.INTEGER
  },
  updatedBy: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: "tours",
  timestamps: true,
})


module.exports = Tour;