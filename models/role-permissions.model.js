const {
  DataTypes
} = require('sequelize');
const sequelize = require('../config/database');

const RolePermissions = sequelize.define('RolePermissions', {
  roleId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: "Role",
      key: "id"
    }
  },
  permissionId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: "Permissions",
      key: "id"
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'role_permissions',
  timestamps: false,
});


module.exports = RolePermissions;