const express = require("express");
const router = express.Router();
const multer = require("multer");
const uploadCloudinaryMiddleware = require("../../middlewares/admin/uploadCloud.middleware");

const upload = multer();

const controllers = require("../../controllers/admin/destination.controller");
const {
  checkPermission
} = require("../../middlewares/admin/checkPermission.middleware");


router.post("/create", upload.single("image"), uploadCloudinaryMiddleware.uploadSingle, checkPermission("CREATE_DESTINATION"), controllers.create);

router.patch("/update", upload.single("image"), uploadCloudinaryMiddleware.uploadSingle, checkPermission("UPDATE_DESTINATION"), controllers.update);

router.patch("/delete/:destinationId", checkPermission("DELETE_DESTINATION"), controllers.delete);

router.get("/get-all-destination", checkPermission("READ_DESTINATION"), controllers.getAllDestination);

router.patch("/change-status/:destinationId", checkPermission("UPDATE_DESTINATION"), controllers.changeStatus);

router.patch("/change-status-multiple", checkPermission("UPDATE_DESTINATION"), controllers.changeStatusMultiple);

router.get("/get-destination/:destinationId", checkPermission("READ_DESTINATION"), controllers.getDestination);

router.get("/get-tree", checkPermission("READ_DESTINATION"), controllers.getTree);

router.get("/get-by-parent/:parentId", checkPermission("READ_DESTINATION"), controllers.getByParentId);


module.exports = router;