const express = require("express");
const router = express.Router();

const {
  checkPermission
} = require("../../middlewares/admin/checkPermission.middleware");

const controllers = require("../../controllers/admin/roles.controller");

router.get("/get-all", checkPermission("READ_ROLES"), controllers.getAll);

router.get("/detail/:adminId", controllers.detail);

router.post("/create", checkPermission("CREATE_ROLES"), controllers.create);

router.patch("/update/:roleId", checkPermission("UPDATE_ROLES"), controllers.update);

router.delete("/delete/:roleId", checkPermission("DELETE_ROLES"), controllers.delete);

router.post("/:roleId/permissions", checkPermission("UPDATE_PERMISSIONS"), controllers.updatePermission);

router.get("/permissions", checkPermission("READ_PERMISSIONS"), controllers.permissions);

router.get("/:roleId/permissions", controllers.rolePermissions);

router.delete("/:roleId/permissions", checkPermission("UPDATE_PERMISSIONS"), controllers.deletePermission)


module.exports = router;