const express = require("express");
const router = express.Router();

const {
  checkPermission
} = require("../../middlewares/admin/checkPermission.middleware");

const controllers = require("../../controllers/admin/category.controller");

router.post("/create", checkPermission("CREATE_CATEGORY"), controllers.create);

router.patch("/update", checkPermission("UPDATE_CATEGORY"), controllers.update);

router.patch("/delete/:categoryId", checkPermission("DELETE_CATEGORY"), controllers.delete);

router.get("/get-all-category", checkPermission("READ_CATEGORY"), controllers.getAllCategory);

router.patch("/change-status/:categoryId", checkPermission("UPDATE_CATEGORY"), controllers.changeStatus);

router.patch("/change-status-multiple", checkPermission("UPDATE_CATEGORY"), controllers.changeStatusMultiple);

router.get("/get-category/:categoryId", checkPermission("READ_CATEGORY"), controllers.getCategory);

module.exports = router;