const User = require("../../models/users.model")
const bcrypt = require("bcrypt");

/**
 * @swagger
 * /user/profile:
 *   get:
 *     tags:
 *       - User
 *     summary: Lấy thông tin người dùng
 *     description: Truy xuất thông tin người dùng dựa trên ID người dùng hiện tại.
 *     operationId: getUserProfile
 *     responses:
 *       200:
 *         description: Thông tin người dùng đã được lấy thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     fullName:
 *                       type: string
 *                       example: Thừa Văn An
 *                     email:
 *                       type: string
 *                       example: thuavanan628@gmail.com
 *                     phoneNumber:
 *                       type: string
 *                       example: 0868936041
 *                     address:
 *                       type: string
 *                       example: Quảng Đại, Sầm Sơn, Thanh Hóa
 *       404:
 *         description: Người dùng không tồn tại.
 *       500:
 *         description: Có lỗi xảy ra khi lấy thông tin người dùng.
 */

// [GET] /user/profile
module.exports.profile = async (req, res) => {
  try {
    const userId = res.locals.userId;

    const user = await User.findOne({
      where: {
        id: userId,
        deleted: false
      }
    });

    if (!user) {
      res.status(404).json({
        message: "Nguời dùng không tồn tại!"
      });
      return;
    }
    const {
      password,
      ...userProfile
    } = user.dataValues;

    res.status(200).json({
      user: userProfile
    });
  } catch (error) {
    res.json(500).json({
      message: "Đã xảy ra lỗi khi lấy thông tin người dùng!"
    })
  }
}

/**
 * @swagger
 * /user/change-password:
 *   patch:
 *     tags:
 *       - User
 *     summary: Thay đổi mật khẩu người dùng
 *     description: Cho phép người dùng thay đổi mật khẩu của mình bằng cách cung cấp mật khẩu cũ và mật khẩu mới.
 *     operationId: changeUserPassword
 *     requestBody:
 *       description: Thông tin thay đổi mật khẩu
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: mật khẩu_cũ
 *               newPassword:
 *                 type: string
 *                 example: mật khẩu_mới
 *               confirmNewPassword:
 *                 type: string
 *                 example: mật khẩu_mới
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Đổi mật khẩu thành công!
 *       400:
 *         description: Thiếu thông tin cần thiết.
 *       401:
 *         description: Mật khẩu cũ không đúng hoặc xác nhận mật khẩu không khớp.
 *       404:
 *         description: Người dùng không tồn tại.
 *       500:
 *         description: Có lỗi xảy ra khi thay đổi mật khẩu.
 */

// [PATCH] /user/change-password
module.exports.changePassword = async (req, res) => {
  try {
    const userId = res.locals.userId;
    const {
      oldPassword,
      newPassword,
      confirmNewPassword
    } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      res.status(400).json("Vui lòng gửi đủ thông tin!")
      return;
    }

    const user = await User.findOne({
      where: {
        id: userId,
        deleted: false
      }
    });

    if (!user) {
      res.status(404).json({
        message: "Nguời dùng không tồn tại!"
      });
      return;
    }
    const password = user.dataValues.password;
    const validPassword = await bcrypt.compare(oldPassword, password);

    if (!validPassword) {
      res.status(401).json("Mật khẩu cũ không đúng!")
      return;
    }
    if (newPassword !== confirmNewPassword) {
      res.status(401).json("Xác nhận mật khẩu không khớp!")
      return;
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json("Đổi mật khẩu thành công!")
  } catch (error) {
    res.status(500).json("Đã xảy ra lỗi khi thay đổi mật khẩu!")
  }
}

/**
 * @swagger
 * /user/update:
 *   patch:
 *     tags:
 *       - User
 *     summary: Cập nhật thông tin người dùng
 *     description: Cho phép người dùng cập nhật thông tin cá nhân như họ tên, số điện thoại và địa chỉ.
 *     operationId: updateUser
 *     requestBody:
 *       description: Thông tin cần cập nhật
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Thừa Văn An
 *               phoneNumber:
 *                 type: string
 *                 example: 0868936041
 *               address:
 *                 type: string
 *                 example: Quảng Đại, Sầm Sơn, Thanh Hóa
 *     responses:
 *       200:
 *         description: Cập nhật thông tin thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Cập nhật thông tin thành công!
 *       400:
 *         description: Vui lòng cung cấp thông tin cần cập nhật.
 *       404:
 *         description: Người dùng không tồn tại.
 *       500:
 *         description: Có lỗi xảy ra khi cập nhật thông tin.
 */

// [PATCH] /user/update
module.exports.update = async (req, res) => {
  const userId = res.locals.userId;
  const {
    fullName,
    phoneNumber,
    address
  } = req.body;

  if (!fullName && !phoneNumber && !address) {
    return res.status(400).json("Vui lòng cung cấp thông tin cần cập nhật!");
  }

  try {
    const user = await User.findOne({
      where: {
        id: userId,
        deleted: false
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "Người dùng không tồn tại!"
      });
    }

    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;

    // Lưu thay đổi vào cơ sở dữ liệu
    await user.save();

    return res.status(200).json("Cập nhật thông tin thành công!");
  } catch (error) {
    console.error("Error updating user info:", error);
    return res.status(500).json("Đã xảy ra lỗi khi cập nhật thông tin!");
  }
}

/**
 * @swagger
 * /user/delete:
 *   patch:
 *     tags:
 *       - User
 *     summary: Xóa tài khoản người dùng
 *     description: Đánh dấu tài khoản người dùng là đã xóa bằng cách cập nhật trường 'deleted' thành true.
 *     operationId: deleteUser
 *     responses:
 *       200:
 *         description: Xóa tài khoản thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Xóa tài khoản thành công!
 *       404:
 *         description: Người dùng không tồn tại.
 *       500:
 *         description: Có lỗi xảy ra khi xóa tài khoản.
 */

// [PATCH] /user/delete
module.exports.delete = async (req, res) => {
  const userId = res.locals.userId;

  try {
    const user = await User.findOne({
      where: {
        id: userId,
        deleted: false
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "Người dùng không tồn tại!"
      });
    }

    user.deleted = true;
    await user.save();

    return res.status(200).json("Xóa tài khoản thành công!");
  } catch (error) {
    console.error("Error updating user info:", error);
    return res.status(500).json("Đã xảy ra lỗi khi xóa tài khoản!");
  }
}