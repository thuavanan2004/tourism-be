const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/admin/transportation.controller");
const {
  checkPermission
} = require("../../middlewares/admin/checkPermission.middleware");


router.post("/create", checkPermission("CREATE_TRANSPORTATION"), controllers.create);

router.patch("/update", checkPermission("UPDATE_TRANSPORTATION"), controllers.update);

router.patch("/delete/:transportationId", checkPermission("DELETE_TRANSPORTATION"), controllers.delete);

router.get("/get-all-transportation", checkPermission("READ_TRANSPORTATION"), controllers.getAllTransportation);

router.patch("/change-status/:transportationId", checkPermission("UPDATE_TRANSPORTATION"), controllers.changeStatus);

router.patch("/change-status-multiple", checkPermission("UPDATE_TRANSPORTATION"), controllers.changeStatusMultiple);

router.get("/get-transportation/:transportationId", checkPermission("READ_TRANSPORTATION"), controllers.getTransportation);

module.exports = router;