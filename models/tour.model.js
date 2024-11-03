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
    type: DataTypes.STRING(10),
    unique: true
  },
  image: {
    type: DataTypes.STRING(255)
  },
  price: {
    type: DataTypes.INTEGER
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
  deletedBy: {
    type: DataTypes.STRING(255)
  },
  updatedBy: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: "tours",
  timestamps: true,
})


module.exports = Tour;