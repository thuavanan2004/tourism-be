const Admin = require("../../models/admin.model");
const Role = require("../../models/role.model");

const bcrypt = require("bcrypt");

/**
 * @swagger
 * /account/get-all-account:
 *   get:
 *     tags:
 *       - Accounts
 *     summary: Lấy danh sách tất cả tài khoản admin
 *     description: API này lấy danh sách tất cả tài khoản admin đã được xác thực, không bao gồm mật khẩu và token.
 *     responses:
 *       200:
 *         description: Lấy danh sách tài khoản admin thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accounts:
 *                   type: array
 *                   description: Danh sách các tài khoản admin.
 *                   items:
 *                     type: object
 *                     properties:
 *                       fullName:
 *                         type: string
 *                         description: Họ và tên của admin.
 *                       email:
 *                         type: string
 *                         description: Email của admin.
 *                       avatar:
 *                         type: string
 *                         description: Đường dẫn tới avatar của admin.
 *                       status:
 *                         type: string
 *                         description: Trạng thái của tài khoản admin (hoạt động hoặc không).
 *                       role:
 *                         type: string
 *                         description: Vai trò của admin .
 *                       createdAt:
 *                         type: string
 *                         description: Ngày tạo tài khoản.
 *       500:
 *         description: Lỗi hệ thống khi lấy danh sách tài khoản admin.
 */

// [GET] /account/get-all-account
module.exports.getAll = async (req, res) => {
  try {
    const accounts = await Admin.findAll({
      where: {
        deleted: false
      },
      attributes: {
        exclude: ['password', 'token']
      }
    })

    const data = await Promise.all(
      accounts.map(async (item) => {
        const role = await Role.findByPk(item.roleId);

        if (role) {
          return {
            id: item.id,
            fullName: item.fullName,
            email: item.email,
            avatar: item.avatar,
            status: item.status,
            role: role.dataValues.name,
            createdAt: item.createdAt
          }
        }
      })
    )

    res.status(200).json({
      accounts: data
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi lấy danh sách tài khoản admin"
    })
  }
}

/**
 * @swagger
 * /account/create:
 *   post:
 *     tags:
 *       - Accounts
 *     summary: Tạo mới tài khoản admin
 *     description: API này tạo mới tài khoản admin với thông tin như tên đầy đủ, email, mật khẩu, avatar và vai trò.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - roleId
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Họ và tên của admin.
 *               email:
 *                 type: string
 *                 description: Địa chỉ email của admin.
 *               password:
 *                 type: string
 *                 description: Mật khẩu của admin.
 *               avatar:
 *                 type: string
 *                 description: Đường dẫn tới avatar của admin (tùy chọn).
 *               roleId:
 *                 type: integer
 *                 description: ID của vai trò của admin.
 *     responses:
 *       200:
 *         description: Tạo mới tài khoản admin thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo thành công.
 *       400:
 *         description: Lỗi khi gửi thiếu thông tin hoặc email đã tồn tại.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Chi tiết lỗi.
 *       500:
 *         description: Lỗi hệ thống khi tạo tài khoản admin.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo lỗi.
 */

// [POST] /account/create
module.exports.create = async (req, res) => {
  const {
    fullName,
    email,
    password,
    avatar,
    roleId
  } = req.body;
  if (!fullName || !email || !password || !roleId) {
    return res.status(400).status({
      message: "Vui lòng gửi đủ thông tin"
    })
  }
  try {
    const adminExist = await Admin.findOne({
      where: {
        email: email
      }
    });
    if (adminExist) {
      return res.status(400).json({
        message: "Email đã tồn tại!"
      })
    }
    const role = await Role.findOne({
      where: {
        id: roleId,
        deleted: false
      }
    })
    if (!role) {
      return res.status(400).json({
        message: "Role không tồn tại!"
      })
    }
    const amdinId = res.locals.adminId;

    const passwordHashed = await bcrypt.hash(password, 10);
    await Admin.create({
      fullName: fullName,
      email: email,
      avatar: avatar,
      password: passwordHashed,
      roleId: roleId,
      createdBy: amdinId
    })
    res.status(200).json({
      message: "Tạo mới tài khoản admin thành công!"
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi tạo mới tài khoản admin"
    })
  }
}

/**
 * @swagger
 * /account/update:
 *   patch:
 *     tags:
 *       - Accounts
 *     summary: Cập nhật thông tin tài khoản admin
 *     description: API này cập nhật thông tin tài khoản admin, bao gồm tên đầy đủ, email, mật khẩu, avatar và vai trò.
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         description: ID của admin cần cập nhật thông tin.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Họ và tên của admin.
 *               email:
 *                 type: string
 *                 description: Địa chỉ email của admin.
 *               password:
 *                 type: string
 *                 description: Mật khẩu mới của admin (tùy chọn).
 *               avatar:
 *                 type: string
 *                 description: Đường dẫn tới avatar của admin (tùy chọn).
 *               roleId:
 *                 type: integer
 *                 description: ID của vai trò của admin (tùy chọn).
 *     responses:
 *       200:
 *         description: Cập nhật tài khoản admin thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo thành công.
 *       400:
 *         description: Lỗi khi thiếu thông tin hoặc ID admin không hợp lệ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Chi tiết lỗi.
 *       500:
 *         description: Lỗi hệ thống khi cập nhật tài khoản admin.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo lỗi.
 */

// [PATCH] /account/update
module.exports.update = async (req, res) => {
  const adminId = req.params.adminId;
  const {
    fullName,
    email,
    password,
    avatar,
    roleId
  } = req.body;
  if (!adminId) {
    return res.status(400).json({
      message: "Vui lòng gửi lên id cần update"
    })
  }
  try {
    const admin = await Admin.findOne({
      where: {
        id: adminId,
        deleted: false
      }
    })

    if (!admin) {
      return res.status(400).json({
        message: "Admin không tồn tại!"
      })
    }

    if (roleId) {
      const role = await Role.findOne({
        where: {
          id: roleId,
          deleted: false
        }
      })
      if (!role) {
        return res.status(400).json({
          message: "Role không tồn tại!"
        })
      }
    }

    if (password) {
      var newPasswordHashed = await bcrypt.hash(password, 10);
    }
    const adminIdUpdated = res.locals.adminId;

    await admin.update({
      fullName: fullName || admin.fullName,
      email: email || admin.email,
      password: newPasswordHashed || admin.password,
      avatar: avatar || admin.avatar,
      roleId: roleId || admin.roleId,
      updatedy: adminIdUpdated
    })

    res.status(200).json({
      message: "Cập nhật tài khoản thành công"
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi cập nhật tài khoản admin"
    })
  }
}

/**
 * @swagger
 * /account/remove/{adminId}:
 *   patch:
 *     tags:
 *       - Accounts
 *     summary: Xóa tài khoản admin
 *     description: API này sẽ đánh dấu tài khoản admin là đã xóa (soft delete) và ghi nhận ai là người xóa tài khoản.
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         description: ID của admin cần xóa.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa tài khoản admin thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo thành công.
 *       400:
 *         description: Lỗi khi thiếu thông tin hoặc admin không tồn tại.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Chi tiết lỗi.
 *       500:
 *         description: Lỗi hệ thống khi xóa tài khoản admin.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo lỗi.
 */

// [PATCH] /account/remove/:adminId
module.exports.remove = async (req, res) => {
  const adminId = req.params.adminId;
  if (!adminId) {
    return res.status(400).json({
      message: "Vui lòng gửi lên id admin cần xóa"
    })
  }
  try {
    const admin = await Admin.findOne({
      where: {
        id: adminId,
        deleted: false
      }
    })

    if (!admin) {
      return res.status(400).json({
        message: "Admin không tồn tại!"
      })
    }

    const adminIdDeleted = res.locals.adminId;

    await admin.update({
      deleted: true,
      deletedBy: adminIdDeleted
    })

    res.status(200).json({
      message: "Xóa tài khoản thành công"
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi xóa tài khoản admin"
    })
  }
}

/**
 * @swagger
 * /account/change-status/{adminId}:
 *   patch:
 *     tags:
 *       - Accounts
 *     summary: Cập nhật trạng thái tài khoản admin
 *     description: API này dùng để thay đổi trạng thái của tài khoản admin (chẳng hạn như kích hoạt hoặc vô hiệu hóa tài khoản).
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         description: ID của admin cần thay đổi trạng thái.
 *         schema:
 *           type: integer
 *       - in: body
 *         name: status
 *         required: true
 *         description: Trạng thái mới của tài khoản admin (true = kích hoạt, false = vô hiệu hóa).
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái tài khoản admin thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo thành công.
 *       400:
 *         description: Lỗi khi thiếu thông tin hoặc admin không tồn tại hoặc không gửi trạng thái.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Chi tiết lỗi.
 *       500:
 *         description: Lỗi hệ thống khi cập nhật trạng thái tài khoản admin.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo lỗi.
 */

// [PATCH] /account/change-status/:adminId
module.exports.changeStatus = async (req, res) => {
  const adminId = req.params.adminId;
  const {
    status
  } = req.body;
  if (!adminId) {
    return res.status(400).json({
      message: "Vui lòng gửi lên id admin cần xóa"
    })
  }
  if (!status) {
    return res.status(400).json({
      message: "Vui lòng gửi lên status"
    })
  }
  try {
    const admin = await Admin.findOne({
      where: {
        id: adminId,
        deleted: false
      }
    })

    if (!admin) {
      return res.status(400).json({
        message: "Admin không tồn tại!"
      })
    }

    const adminIdUpdatedBy = res.locals.adminId;

    await admin.update({
      status: status === "true",
      updatedBy: adminIdUpdatedBy
    })

    res.status(200).json({
      message: "Cập nhật trạng thái tài khoản thành công"
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi cập nhật trạng thái tài khoản admin"
    })
  }
}