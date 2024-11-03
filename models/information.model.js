const {
  DataTypes
} = require("sequelize");
const sequelize = require("../config/database");

const Information = sequelize.define("Information", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tourId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Tour',
      key: 'id',
    },
  },
  attractions: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cuisine: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  suitableObject: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  idealTime: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  vehicle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  promotion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'information',
  timestamps: true,
})


module.exports = Information;