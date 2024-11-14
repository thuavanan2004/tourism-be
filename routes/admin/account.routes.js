const express = require("express");
const router = express.Router();
const multer = require("multer");
const uploadCloudinaryMiddleware = require("../../middlewares/admin/uploadCloud.middleware");


const upload = multer();

const {
  checkPermission
} = require("../../middlewares/admin/checkPermission.middleware");

const controllers = require("../../controllers/admin/account.controller");

router.get("/get-all-account", checkPermission("READ_ADMIN"), controllers.getAll);

router.post("/create", upload.single("avatar"), uploadCloudinaryMiddleware.uploadSingle, checkPermission("CREATE_ADMIN"), controllers.create);

router.patch("/update/:adminId", upload.single("avatar"), uploadCloudinaryMiddleware.uploadSingle, checkPermission("UPDATE_ADMIN"), controllers.update);

router.delete("/delete/:adminId", checkPermission("DELETE_ADMIN"), controllers.delete);

router.patch("/change-status/:adminId", checkPermission("UPDATE_ADMIN"), controllers.changeStatus);

module.exports = router;