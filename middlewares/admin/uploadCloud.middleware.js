const uploadToCloudinaryHelper = require("../../helpers/uploadCloud.helper");
const multer = require('multer');

const upload = multer();

module.exports.uploadSingle = async (req, res, next) => {
  if (req["file"]) {
    const link = await uploadToCloudinaryHelper.uploadToCloudinary(req["file"].buffer);
    req.body[req["file"].fieldname] = link;
    next();
  } else {
    next();
  }
}

module.exports.uploadFields = async (req, res, next) => {
  let urls = [];

  if (!req.files || req.files.length === 0) {
    // Không có ảnh nào được gửi, đi tiếp tới controller
    return next();
  }

  for (const file of req.files) {
    try {
      const url = await uploadToCloudinaryHelper.uploadToCloudinary(file.buffer);
      urls.push(url);
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({
        message: 'Error uploading files'
      });
    }
  }

  req.body[req.files[0].fieldname] = urls;
  next();
}