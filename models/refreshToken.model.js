const {
  DataTypes
} = require("sequelize");
const sequelize = require("../config/database");


const RefreshToken = sequelize.define("RefreshToken", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: "User",
      key: "id"
    }
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: "refreshtokens",
  timestamps: false
});


module.exports = RefreshToken;