const express = require("express");
const router = express.Router();

const {
  checkPermission
} = require("../../middlewares/admin/checkPermission.middleware");

const controllers = require("../../controllers/admin/account.controller");

router.get("/get-all-account", checkPermission("READ_ADMIN"), controllers.getAll);

router.post("/create", checkPermission("CREATE_ADMIN"), controllers.create);

router.patch("/update/:adminId", checkPermission("UPDATE_ADMIN"), controllers.update);

router.patch("/remove/:adminId", checkPermission("DELETE_ADMIN"), controllers.remove);

router.patch("/change-status/:adminId", checkPermission("UPDATE_ADMIN"), controllers.changeStatus)

module.exports = router;