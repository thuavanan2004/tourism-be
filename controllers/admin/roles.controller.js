const {
  QueryTypes
} = require("sequelize");
const sequelize = require("../../config/database");
const Permissions = require("../../models/permissions.model");
const RolePermissions = require("../../models/role-permissions.model");
const Role = require("../../models/role.model");
const Admin = require("../../models/admin.model");

/**
 * @swagger
 * /roles/get-all:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Lấy tất cả nhóm quyền
 *     description: API này cho phép lấy danh sách tất cả các nhóm quyền hiện có, chỉ trả về các nhóm quyền không bị xóa.
 *     responses:
 *       200:
 *         description: Thành công, trả về danh sách các nhóm quyền.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Admin"
 *                       description:
 *                         type: string
 *                         example: "Quyền quản trị viên"
 *                       deleted:
 *                         type: boolean
 *                         example: false
 *       400:
 *         description: Không có nhóm quyền nào trong hệ thống hoặc nhóm quyền bị xóa.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Danh sách nhóm quyền rỗng"
 *       500:
 *         description: Lỗi khi lấy danh sách nhóm quyền.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi lấy danh sách nhóm quyền"
 */

// [GET] /roles/get-all
module.exports.getAll = async (req, res) => {
  try {
    const roles = await Role.findAll({
      where: {
        deleted: false
      }
    });

    if (roles.length == 0) {
      return res.status(400).json({
        message: "Danh sách nhóm quyền rỗng"
      })
    }
    res.status(200).json({
      roles: roles
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách nhóm quyền"
    })
  }
}

/**
 * @swagger
 * /roles/detail/{adminId}:
 *   get:
 *     summary: Lấy thông tin quyền của admin
 *     description: Lấy thông tin quyền của admin theo `adminId` và trả về thông tin quyền của admin đó.
 *     tags:
 *       - Roles
 *     parameters:
 *       - name: adminId
 *         in: path
 *         required: true
 *         description: ID của admin cần lấy thông tin quyền
 *         schema:
 *           type: string
 *           example: "1"
 *     responses:
 *       200:
 *         description: Thành công, trả về thông tin quyền của admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID của quyền
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: Tên quyền
 *                   example: "Admin"
 *                 description:
 *                   type: string
 *                   description: Mô tả quyền
 *                   example: "Quyền quản trị viên"
 *       400:
 *         description: Admin không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Admin không tồn tại!"
 *       500:
 *         description: Lỗi hệ thống
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi quyền"
 */
// [GET] /roles/detail
module.exports.detail = async (req, res) => {

  try {

    const adminId = req.params.adminId;

    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      return res.status(400).json("Admin không tồn tại!");
    }
    const role = await Role.findOne({
      where: {
        id: admin.roleId
      }
    });


    res.status(200).json(role)
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi quyền"
    })
  }
}

/**
 * @swagger
 * /roles/create:
 *   post:
 *     tags:
 *       - Roles
 *     summary: Tạo mới một nhóm quyền
 *     description: API này cho phép tạo một nhóm quyền mới với tên và mô tả được cung cấp.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên của nhóm quyền.
 *                 example: "Admin"
 *               description:
 *                 type: string
 *                 description: Mô tả về nhóm quyền.
 *                 example: "Quyền quản trị viên"
 *     responses:
 *       200:
 *         description: Tạo nhóm quyền thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 role:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Admin"
 *                     description:
 *                       type: string
 *                       example: "Quyền quản trị viên"
 *                     createdBy:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Thiếu thông tin hoặc không tạo được nhóm quyền.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vui lòng gửi lên name và description"
 *       500:
 *         description: Lỗi khi tạo nhóm quyền.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi tạo nhóm quyền"
 */

// [POST] /roles/create
module.exports.create = async (req, res) => {
  const {
    name,
    description
  } = req.body;

  if (!name || !description) {
    return res.status(400).json({
      message: "Vui lòng gửi lên name và descriptioin"
    })
  }
  try {
    const adminId = res.locals.adminId;
    const role = await Role.create({
      name: name,
      description: description,
      createdBy: adminId
    })

    if (!role) {
      return res.status(400).json({
        message: "Tạo mới quyền không thành công"
      })
    }
    res.status(200).json({
      role: role
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách nhóm quyền"
    })
  }
}

/**
 * @swagger
 * /roles/update/{roleId}:
 *   patch:
 *     tags:
 *       - Roles
 *     summary: Cập nhật thông tin nhóm quyền
 *     description: API này cho phép cập nhật thông tin của một nhóm quyền đã tồn tại bằng cách cung cấp `roleId`, tên và mô tả mới.
 *     parameters:
 *       - name: roleId
 *         in: path
 *         required: true
 *         description: ID của nhóm quyền cần cập nhật.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên mới của nhóm quyền.
 *                 example: "Editor"
 *               description:
 *                 type: string
 *                 description: Mô tả mới về nhóm quyền.
 *                 example: "Quyền biên tập nội dung"
 *     responses:
 *       200:
 *         description: Cập nhật nhóm quyền thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật quyền thành công"
 *       400:
 *         description: Không tìm thấy nhóm quyền hoặc thiếu thông tin.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quyền không tồn tại"
 *       500:
 *         description: Lỗi khi cập nhật nhóm quyền.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi cập nhật quyền"
 */

// [PATCH] /roles/update/:roleId
module.exports.update = async (req, res) => {
  const {
    name,
    description
  } = req.body;
  const roleId = req.params.roleId;
  if (!roleId) {
    return res.status(400).json({
      message: "Vui lòng gửi lên roleId"
    })
  }
  try {
    const role = await Role.findOne({
      where: {
        deleted: false,
        id: roleId
      }
    });
    if (!role) {
      return res.status(400).json({
        message: "Quyền không tồn tại"
      })
    }

    await role.update({
      name: name,
      description: description
    })

    res.status(200).json({
      message: "Cập nhật quyền thành công"
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi cập nhật quyền"
    })
  }
}

/**
 * @swagger
 * /roles/delete/{roleId}:
 *   delete:
 *     tags:
 *       - Roles
 *     summary: Xóa nhóm quyền
 *     description: API này cho phép xóa một nhóm quyền bằng cách cung cấp `roleId`. Nếu quyền không tồn tại hoặc đã bị xóa, API sẽ trả về lỗi.
 *     parameters:
 *       - name: roleId
 *         in: path
 *         required: true
 *         description: ID của nhóm quyền cần xóa.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Xóa nhóm quyền thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Xóa quyền thành công"
 *       400:
 *         description: Không tìm thấy nhóm quyền hoặc quyền đã bị xóa.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quyền không tồn tại"
 *       500:
 *         description: Lỗi khi xóa nhóm quyền.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi xóa quyền"
 */

// [DELETE] /roles/delete/:roleId
module.exports.delete = async (req, res) => {
  const roleId = req.params.roleId;
  if (!roleId) {
    return res.status(400).json({
      message: "Vui lòng gửi lên roleId"
    })
  }
  try {
    const role = await Role.findOne({
      where: {
        deleted: false,
        id: roleId
      }
    });
    if (!role) {
      return res.status(400).json({
        message: "Quyền không tồn tại"
      })
    }

    await role.destroy();

    res.status(200).json({
      message: "Xóa quyền thành công"
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi xóa quyền"
    })
  }
}

/**
 * @swagger
 * /{roleId}/permissions:
 *   post:
 *     tags:
 *       - Roles
 *     summary: Cập nhật quyền cho nhóm quyền
 *     description: API này cho phép gán một danh sách quyền cho một nhóm quyền (role) bằng cách cung cấp `roleId` và danh sách `permissionIds`. Nếu nhóm quyền không tồn tại hoặc quyền đã được gán trước đó, API sẽ trả về lỗi.
 *     parameters:
 *       - name: roleId
 *         in: path
 *         required: true
 *         description: ID của nhóm quyền cần cập nhật quyền.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Gán quyền cho nhóm quyền thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Gán quyền cho role thành công"
 *                 rolePermissions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       roleId:
 *                         type: integer
 *                         example: 1
 *                       permissionId:
 *                         type: integer
 *                         example: 3
 *       400:
 *         description: Lỗi khi gửi dữ liệu không hợp lệ hoặc không tìm thấy quyền.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không tồn tại role cần cập nhật quyền!"
 *       500:
 *         description: Lỗi khi gán quyền cho nhóm quyền.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi gán quyền cho một role"
 */

//[POST] /:roleId/permissions
module.exports.updatePermission = async (req, res) => {
  const roleId = req.params.roleId;
  const {
    permissionIds
  } = req.body;
  if (!roleId) {
    return res.status(400).json({
      message: "Yêu cầu gửi lên roleId"
    })
  }

  if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
    return res.status(400).json({
      message: "Yêu cầu gửi lên permissionIds phải là một mảng và không được trống"
    });
  }
  try {
    const role = await Role.findOne({
      where: {
        id: roleId,
        deleted: false
      }
    });
    if (!role) {
      return res.status(400).json({
        message: "Không tồn tại role cần cập nhật quyền!"
      })
    }
    const permissions = await Permissions.findAll({
      where: {
        id: permissionIds
      }
    });
    if (permissions.length === 0) {
      return res.status(400).json({
        message: "Không tìm thấy bất kỳ quyền nào trùng với danh sách permissionIds cung cấp"
      });
    }

    const rolePermissionsData = await Promise.all(
      permissionIds.map(async (permissionId) => {
        const rolePermissionExist = await RolePermissions.findOne({
          where: {
            roleId: role.id,
            permissionId: permissionId
          }
        });
        if (!rolePermissionExist) {
          return {
            roleId: role.id,
            permissionId: permissionId
          };
        } else {
          throw new Error(`Quyền đã được gán sẵn cho role: ${permissionId}`);
        }
      })
    );

    const rolePermissions = await RolePermissions.bulkCreate(rolePermissionsData);


    res.status(200).json({
      message: "Gán quyền cho role thành công",
      rolePermissions: rolePermissions
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi gán quyền cho một role"
    })
  }
}

/**
 * @swagger
 * /roles/permissions:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Lấy danh sách quyền
 *     description: API này trả về tất cả các quyền có sẵn trong hệ thống. Nếu không có quyền nào, API sẽ trả về thông báo lỗi.
 *     responses:
 *       200:
 *         description: Danh sách quyền thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Quyền xem báo cáo"
 *                       description:
 *                         type: string
 *                         example: "Quyền để xem báo cáo"
 *       400:
 *         description: Danh sách quyền rỗng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Danh sách quyền rỗng"
 *       500:
 *         description: Lỗi khi lấy danh sách quyền.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi lấy danh sách quyền"
 */

// [GET] /roles/permissions
module.exports.permissions = async (req, res) => {
  try {
    const permissions = await Permissions.findAll();
    if (permissions.length === 0 || !Array.isArray(permissions)) {
      return res.status(400).json({
        message: "Danh sách quyền rỗng"
      })
    }

    res.status(200).json({
      permissions: permissions
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi lấy danh sách quyền"
    })
  }
}

/**
 * @swagger
 * /roles/{roleId}/permissions:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Lấy danh sách quyền của một role
 *     description: API này trả về danh sách quyền đã được gán cho một role cụ thể. Nếu không có quyền nào gán cho role, API sẽ trả về thông báo lỗi.
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         description: ID của role cần lấy quyền.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Danh sách quyền của role thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Quyền xem báo cáo"
 *                       description:
 *                         type: string
 *                         example: "Quyền để xem báo cáo"
 *       400:
 *         description: Không tồn tại role hoặc không có quyền gán cho role.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không tồn tại role cần cập nhật quyền!"
 *       500:
 *         description: Lỗi khi lấy danh sách quyền của role.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi lấy danh sách quyền"
 */

// [GET] /roles/:roleId/permissions
module.exports.rolePermissions = async (req, res) => {
  const roleId = req.params.roleId;
  if (!roleId) {
    return res.status(400).json({
      message: "Yêu cầu gửi lên roleId"
    })
  }
  try {
    const role = await Role.findOne({
      where: {
        id: roleId,
        deleted: false
      }
    });
    if (!role) {
      return res.status(400).json({
        message: "Không tồn tại role cần cập nhật quyền!"
      })
    }

    const permissions = await sequelize.query(`
    SELECT permissions.*
    FROM role
    JOIN role_permissions ON role.id = role_permissions.roleId
    JOIN permissions ON permissions.id = role_permissions.permissionId
    WHERE
      role.id = :roleId
      `, {
      type: QueryTypes.SELECT,
      replacements: {
        roleId: role.id
      }
    })

    res.status(200).json({
      permissions: permissions
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi lấy danh sách quyền"
    })
  }
}

/**
 * @swagger
 * /roles/{roleId}/permissions:
 *   delete:
 *     tags:
 *       - Roles
 *     summary: Xóa quyền khỏi role
 *     description: API này sẽ xóa quyền khỏi một role cụ thể. Nếu quyền không tồn tại trong role hoặc role/permission không hợp lệ, API sẽ trả về lỗi tương ứng.
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         description: ID của role cần xóa quyền.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [2, 3, 4]
 *                 description: Danh sách các quyền cần xóa khỏi role.
 *     responses:
 *       200:
 *         description: Xóa quyền khỏi role thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Xóa quyền cho Role thành công!"
 *       400:
 *         description: Role hoặc Permission không tồn tại, hoặc quyền không tồn tại trong role.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Permission không tồn tại trong Role!"
 *       500:
 *         description: Lỗi khi xóa quyền cho role.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi xóa quyền cho role"
 */


// [DELETE] /:roleId/permissions
module.exports.deletePermission = async (req, res) => {
  const roleId = req.params.roleId;
  const {
    permissionIds
  } = req.body;
  if (!roleId) {
    return res.status(400).json({
      message: "Yêu cầu gửi lên roleId"
    })
  }

  if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
    return res.status(400).json({
      message: "Yêu cầu gửi lên permissionIds phải là một mảng và không được trống"
    });
  }
  try {
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json("Role không tồn tại!")
    }

    const permissions = await Permissions.findAll({
      where: {
        id: permissionIds
      }
    });
    if (permissions.length === 0) {
      return res.status(400).json({
        message: "Không tìm thấy bất kỳ quyền nào trùng với danh sách permissionIds cung cấp"
      });
    }
    const existingRolePermissions = await RolePermissions.findAll({
      where: {
        roleId: roleId,
        permissionId: permissionIds
      }
    });

    if (existingRolePermissions.length === 0) {
      return res.status(400).json({
        message: "Không có quyền nào được gán cho role này trong danh sách permissionIds"
      });
    }

    await RolePermissions.destroy({
      where: {
        roleId: roleId,
        permissionId: permissionIds
      }
    });

    res.status(200).json({
      message: "Xóa danh sách quyền cho Role thành công!"
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi xóa danh sách quyền một quyền cho role"
    })
  }
}