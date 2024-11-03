const jwt = require("jsonwebtoken");

module.exports.requireAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json("Authorization header bị thiếu");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json("Token chưa được gửi lên");
    return;
  }

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        res.status(403).json("Người dùng không được phép");
        return;
      }
      if (typeof decoded === "string" || decoded === undefined) {
        throw new Error("Dữ liệu giải mã không hợp lệ");
      }
      res.locals.userId = decoded.userId;
      next();

    })
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi trong quá trình xác thực"
    });
  }
}