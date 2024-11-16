const Admin = require("../../models/admin.model");
const bcrypt = require("bcrypt");
const jwtHelpers = require("../../helpers/jwt.helper");
const {
  where
} = require("sequelize");

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đăng nhập vào hệ thống
 *     description: API này dùng để đăng nhập vào hệ thống quản lý admin, kiểm tra tài khoản và mật khẩu, trả về token xác thực.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email của admin.
 *               password:
 *                 type: string
 *                 description: Mật khẩu của admin.
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về token để xác thực.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo đăng nhập thành công.
 *                 token:
 *                   type: string
 *                   description: Token JWT dùng để xác thực trong các yêu cầu tiếp theo.
 *       400:
 *         description: Lỗi đăng nhập khi thiếu thông tin hoặc tài khoản không tồn tại hoặc mật khẩu sai.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Chi tiết lỗi.
 *       500:
 *         description: Lỗi hệ thống khi đăng nhập.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo lỗi hệ thống.
 */

//[POST] /auth/login
module.exports.login = async (req, res) => {
  const {
    email,
    password
  } = req.body;
  if (!email || !password) {
    return res.status(400).json("Yêu cầu gửi đủ thông tin đăng nhập!");
  }

  try {
    const admin = await Admin.findOne({
      where: {
        email: email,
        status: true
      }
    });

    if (!admin) {
      return res.status(400).json({
        message: "Tài khoản không tồn tại!"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Mật khẩu không chính xác!"
      });
    }

    const token = jwtHelpers.generateToken(admin.id);
    admin.token = token;

    await admin.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Đăng nhập thành công",
      token: token
    })
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi đăng nhập trang admin.");
  }
}

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Đăng xuất khỏi hệ thống
 *     description: API này dùng để đăng xuất, xóa cookie token đã lưu trong trình duyệt.
 *     responses:
 *       200:
 *         description: Đăng xuất thành công, xóa cookie token.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Logout success"
 *       500:
 *         description: Lỗi hệ thống khi thực hiện đăng xuất.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo lỗi hệ thống.
 */

//[GET] /auth/logout
module.exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json("Logout success");
}

/**
 * @swagger
 * /auth/verify-token:
 *   post:
 *     summary: Xác thực và kiểm tra người dùng admin
 *     description: Kiểm tra xem token có hợp lệ hay không và trả về thông tin của admin nếu hợp lệ.
 *     tags:
 *       - Auth
 *     requestBody:
 *       description: Token xác thực của người dùng admin
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token của người dùng admin
 *                 example: "your-jwt-token"
 *     responses:
 *       200:
 *         description: Thành công, trả về ID của admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 adminId:
 *                   type: string
 *                   description: ID của admin
 *                   example: "12345"
 *       400:
 *         description: Admin không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Admin không tồn tại"
 *       500:
 *         description: Lỗi hệ thống
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi xác thực"
 */
// [POST] /auth/verify-token
module.exports.verifyToken = async (req, res) => {
  try {
    const {
      token
    } = req.body;

    const admin = await Admin.findOne({
      where: {
        token: token
      }
    });
    if (!admin) {
      return res.status(400).json({
        message: "Admin không tồn tại"
      })
    };

    res.status(200).json({
      id: admin.id,
      fullName: admin.fullName,
      avatar: admin.avatar
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi xác thực");
  }
}