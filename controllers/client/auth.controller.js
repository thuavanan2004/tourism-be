const User = require("../../models/users.model");
const bcrypt = require("bcrypt");
const jwtHelpers = require("../../helpers/jwt.helper");
const RefreshToken = require("../../models/refreshToken.model");
const jwt = require('jsonwebtoken');
const generateOtpHelper = require("../../helpers/generateOtp.helper");
const sendEmailOtpHelper = require("../../helpers/sendEmailOtp.helper");
const ForgotPassword = require("../../models/forgot-password.model");
const userValidate = require("../../validates/user.validate");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đăng ký tài khoản người dùng
 *     description: Đăng ký tài khoản mới
 *     operationId: register
 *     requestBody:
 *       description: Thông tin đăng ký
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Thừa Văn An
 *               email:
 *                 type: string
 *                 example: thuavanan628@gmail.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *               address:
 *                 type: string
 *                 example: Quảng Đại, Sầm Sơn, Thanh Hóa
 *               phoneNumber:
 *                 type: string
 *                 example: 0868936041
 *     responses:
 *       201:
 *         description: Tạo tài khoản thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tạo tài khoản thành công!
 *       400:
 *         description: Mật khẩu chưa được gửi lên!
 *       409:
 *         description: Email đã tồn tại
 *       500:
 *         description: Lỗi đăng ký tài khoản người dùng
 */
// [POST] /auth/register
module.exports.register = async (req, res) => {
  const {
    fullName,
    address,
    phoneNumber,
    email,
    password
  } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({
      message: "Email và password là bắt buộc!"
    });
  };

  if (!userValidate.validateEmail(email)) {
    return res.status(400).json({
      message: "Định dạng email không hợp lệ!"
    });
  }
  if (!userValidate.validatePassword(password)) {
    return res.status(400).json({
      message: "Định dạng mật khẩu không hợp lệ!"
    });
  }
  if (!userValidate.validatePhoneNumber(phoneNumber)) {
    return res.status(400).json({
      message: "Định dạng số điện thoại không hợp lệ!"
    });
  }
  try {
    const existEmail = await User.findOne({
      where: {
        email: email,
      }
    })
    if (existEmail) {
      return res.status(409).json({
        message: 'Email đã tồn tại'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      fullName: fullName,
      email: email,
      password: hashedPassword,
      address: address || "",
      phoneNumber: phoneNumber || ""
    })

    res.status(201).json({
      message: "Tạo tài khoản thành công!",
    })
  } catch (error) {
    console.error("Lỗi đăng ký tài khoản người dùng:", error);
    res.status(500).json({
      message: "Lỗi đăng ký tài khoản người dùng",
    });
  }
}

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Các API liên quan đến auth
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đăng nhập
 *     description: Đăng nhập vào hệ thống
 *     operationId: login
 *     requestBody:
 *       description: Thông tin đăng nhập
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: thuavanan628@gmail.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Đăng nhập thành công
 *                 result:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR...
 *                     refreshToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR...
 *       401:
 *         description: Mật khẩu không chính xác
 *       404:
 *         description: Email không tồn tại
 *       500:
 *         description: Đăng nhập không thành công
 */

// [POST] /auth/login
module.exports.login = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!userValidate.validateEmail(email)) {
      return res.status(400).json({
        message: "Định dạng email không hợp lệ!"
      });
    }

    if (!userValidate.validatePassword(password)) {
      return res.status(400).json({
        message: "Định dạng mật khẩu không hợp lệ!"
      });
    }
    const user = await User.findOne({
      where: {
        email: email,
        deleted: false
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    })
    if (!user) {
      return res.status(404).json({
        message: 'Email không tồn tại'
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res.status(401).json("Mật khẩu không chính xác!");
      return;
    }

    const accessToken = jwtHelpers.generateAccessToken(user.id);
    const refreshToken = jwtHelpers.generateRefreshToken(user.id);

    const existingToken = await RefreshToken.findOne({
      where: {
        userId: user.id
      }
    });

    if (existingToken) {
      existingToken.token = refreshToken;
      await existingToken.save();
    } else {
      await RefreshToken.create({
        userId: user.id,
        token: refreshToken
      });
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "strict",
    });


    res.status(200).json({
      message: "Đăng nhập thành công",
      result: {
        accessToken: accessToken,
        refreshToken: refreshToken
      }

    })
  } catch (error) {
    res.status(500).json({
      message: "Đăng nhập không thành công!"
    })
  }
};

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Cấp mới access token từ refresh token
 *     description: Tạo access token mới khi refresh token còn hiệu lực
 *     operationId: refreshToken
 *     responses:
 *       200:
 *         description: Refresh token thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Bạn chưa được xác thực!
 *       403:
 *         description: Token không hợp lệ!
 */
// [POST] /auth/refresh-token 
module.exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    res.status(401).json({
      message: "Bạn chưa được xác thực!"
    });
    return;
  }

  try {
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        res.status(403).json("User not authorized");
        return;
      }
      if (typeof decoded === "string" || decoded === undefined) {
        throw new Error("Invalid decoded data");
      }

      const storedToken = await RefreshToken.findOne({
        where: {
          userId: decoded.userId,
          token: token
        }
      });

      if (!storedToken) {
        res.status(403).json({
          message: "Token không hợp lệ!"
        })
      }
      const newAccessToken = jwtHelpers.generateAccessToken(storedToken.dataValues.userId);
      const newRefreshToken = jwtHelpers.generateRefreshToken(storedToken.dataValues.userId);

      storedToken.token = newRefreshToken;
      await storedToken.save();

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        path: "/",
        secure: false,
        sameSite: "strict",
      })

      res.status(200).json({
        accessToken: newAccessToken
      });
    });
  } catch (error) {
    console.error("Error refreshing access token:", error);
    res.status(403).json({
      message: "Refresh token không hợp lệ"
    });
  }
}

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Đăng xuất
 *     description: Đăng xuất khỏi hệ thống và xóa refresh token
 *     operationId: logout
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Logout success"
 *       403:
 *         description: Token không hợp lệ hoặc không tồn tại
 */
// [GET] /auth/logout
module.exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(403).json("Token not required");
    return;
  }
  await RefreshToken.destroy({
    where: {
      token: refreshToken,
    }
  });
  res.clearCookie("refreshToken");
  res.status(200).json("Logout success");
}

/**
 * @swagger
 * /auth/forgot-password/request:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Yêu cầu khôi phục mật khẩu
 *     description: API cho phép người dùng yêu cầu khôi phục mật khẩu qua email bằng cách gửi OTP đến email đã đăng ký.
 *     operationId: forgotPasswordRequest
 *     requestBody:
 *       description: Email người dùng để gửi mã khôi phục
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: thuavanan628@gmail.com
 *     responses:
 *       200:
 *         description: Mã khôi phục đã được gửi đến email của bạn!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mã khôi phục đã được gửi đến email của bạn!
 *       400:
 *         description: Thiếu email trong yêu cầu.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email là bắt buộc!
 *       404:
 *         description: Không tìm thấy người dùng với email đã cung cấp.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Người dùng không tồn tại!
 *       500:
 *         description: Có lỗi xảy ra khi gửi yêu cầu khôi phục mật khẩu.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Có lỗi xảy ra khi gửi yêu cầu khôi phục mật khẩu!
 */

// [POST] /auth/forgot-password/request
module.exports.forgotPasswordRequest = async (req, res) => {
  const {
    email
  } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email là bắt buộc!"
    });
  }
  if (!userValidate.validateEmail(email)) {
    return res.status(400).json({
      message: "Định dạng email không hợp lệ!"
    });
  }

  try {
    const userExist = await User.findOne({
      where: {
        email: email,
        deleted: false
      }
    });

    if (!userExist) {
      return res.status(404).json({
        message: "Người dùng không tồn tại!"
      });
    }
    const otp = generateOtpHelper.generateRandomOtp();
    const expiresAt = new Date(Date.now() + 180000);

    const forgotPassword = await ForgotPassword.create({
      userId: userExist.id,
      otp: otp,
      expiresAt: expiresAt
    });

    const subject = "Lấy lại mật khẩu";
    const text = `Mã OTP xác thực tài khoản của bạn là: ${forgotPassword.otp}. Mã OTP có hiệu lực trong vòng 3 phút. Vui lòng không cung cấp mã OTP này với bất kỳ ai.`;

    sendEmailOtpHelper.sendEmail(email, subject, text);

    res.status(200).json({
      message: "Mã khôi phục đã được gửi đến email của bạn!"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Có lỗi xảy ra khi gửi yêu cầu khôi phục mật khẩu!"
    });
  }
};

/**
 * @swagger
 * /auth/forgot-password/verify:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Xác thực mã khôi phục mật khẩu
 *     description: API này kiểm tra mã OTP do người dùng cung cấp có hợp lệ hay không.
 *     operationId: forgotPasswordVerify
 *     requestBody:
 *       description: Mã OTP để xác thực
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Mã xác thực hợp lệ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mã xác thực hợp lệ!
 *                 userId:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Mã OTP không hợp lệ hoặc đã hết hạn.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mã xác thực không hợp lệ hoặc đã được sử dụng!
 *       500:
 *         description: Có lỗi xảy ra khi xác thực mã OTP.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Có lỗi xảy ra khi xác thực mã!
 */

// [POST] /auth/forgot-password/verify
module.exports.forgotPasswordVerify = async (req, res) => {
  const {
    otp
  } = req.body;

  if (!otp) {
    return res.status(400).json({
      message: "Mã xác thực là bắt buộc!"
    });
  }
  try {
    const resetRequest = await ForgotPassword.findOne({
      where: {
        otp: otp,
        isUsed: false
      },
    });

    if (!resetRequest) {
      return res.status(400).json({
        message: "Mã xác thực không hợp lệ hoặc đã được sử dụng!"
      });
    }

    const currentTime = new Date();
    if (currentTime > resetRequest.expiresAt) {
      return res.status(400).json({
        message: "Mã xác thực đã hết hạn!"
      });
    }

    res.status(200).json({
      message: "Mã xác thực hợp lệ!",
      userId: resetRequest.userId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Có lỗi xảy ra khi xác thực mã!"
    });
  }
}

/**
 * @swagger
 * /auth/forgot-password/reset:
 *   patch:
 *     tags:
 *       - Auth
 *     summary: Đặt lại mật khẩu mới
 *     description: API này cho phép người dùng đặt lại mật khẩu mới bằng cách cung cấp mã OTP hợp lệ và mật khẩu mới.
 *     operationId: forgotPasswordReset
 *     requestBody:
 *       description: Mã OTP và mật khẩu mới
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - newPassword
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: "NewPassword@123"
 *     responses:
 *       200:
 *         description: Đặt mật khẩu mới thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Đặt mật khẩu mới thành công!
 *       400:
 *         description: Mã OTP không hợp lệ hoặc mật khẩu không hợp lệ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mã xác thực không hợp lệ hoặc đã được sử dụng!
 *       404:
 *         description: Người dùng không tồn tại.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Người dùng không tồn tại!
 *       500:
 *         description: Có lỗi xảy ra khi đặt mật khẩu mới.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Có lỗi xảy ra khi đặt mật khẩu mới!
 */

// [PATCH] /auth/forgot-password/reset
module.exports.forgotPasswordReset = async (req, res) => {
  const {
    otp,
    newPassword
  } = req.body;
  if (!otp || !newPassword) {
    return res.status(400).json({
      message: "Cần phải cung cấp mã xác thực và mật khẩu mới!"
    });
  }
  try {
    const resetRequest = await ForgotPassword.findOne({
      where: {
        otp: otp,
        isUsed: false
      }
    });

    if (!resetRequest) {
      return res.status(400).json({
        message: "Mã xác thực không hợp lệ hoặc đã được sử dụng!"
      });
    };

    const user = await User.findOne({
      where: {
        id: resetRequest.userId,
        deleted: false
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "Người dùng không tồn tại!"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    resetRequest.isUsed = true;
    await resetRequest.save();

    res.status(200).json({
      message: "Đặt mật khẩu mới thành công!"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Có lỗi xảy ra khi đặt mật khẩu mới!"
    });
  }
}