const {
  DataTypes
} = require("sequelize");
const sequelize = require("../config/database");

const ForgotPassword = sequelize.define("ForgotPassword", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "User",
      key: 'id'
    }
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'forgot_password',
  timestamps: false
});


module.exports = ForgotPassword;