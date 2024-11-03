const {
  DataTypes
} = require("sequelize");
const sequelize = require("../config/database");

const Favorite = sequelize.define("Favorite", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  tourId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "tours",
      key: "id"
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id"
    }
  }
}, {
  tableName: "favorites",
  timestamps: true
});

module.exports = Favorite;