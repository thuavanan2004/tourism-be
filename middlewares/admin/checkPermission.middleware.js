const Admin = require("../../models/admin.model");
const Permissions = require("../../models/permissions.model");
const RolePermissions = require("../../models/role-permissions.model");

module.exports.checkPermission = (permissionName) => async (req, res, next) => {
  const adminId = res.locals.adminId;

  try {
    // Kiểm tra quyền có tồn tại không
    const permission = await Permissions.findOne({
      where: {
        name: permissionName,
      },
    });

    if (!permission) {
      return res.status(403).json({
        message: "Người dùng không đủ thẩm quyền!",
      });
    }

    // Lấy thông tin admin
    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      return res.status(403).json({
        message: "Admin không tồn tại!",
      });
    }

    // Kiểm tra quyền của admin
    const accessRolePermission = await RolePermissions.findOne({
      where: {
        roleId: admin.roleId,
        permissionId: permission.id,
      },
    });

    if (!accessRolePermission) {
      return res.status(403).json({
        message: "Không có quyền truy cập!",
      });
    }

    next();
  } catch (error) {
    console.error("Lỗi trong middleware kiểm tra quyền:", error);
    res.status(500).json({
      message: "Lỗi trong quá trình kiểm tra quyền.",
    });
  }
};