const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/admin/departure.controller");
const {
  checkPermission
} = require("../../middlewares/admin/checkPermission.middleware");


router.post("/create", checkPermission("CREATE_DEPARTURE"), controllers.create);

router.patch("/update", checkPermission("UPDATE_DEPARTURE"), controllers.update);

router.patch("/delete/:departureId", checkPermission("DELETE_DEPARTURE"), controllers.delete);

router.get("/get-all-departure", checkPermission("READ_DEPARTURE"), controllers.getAllDeparture);

router.patch("/change-status/:departureId", checkPermission("UPDATE_DEPARTURE"), controllers.changeStatus);

router.patch("/change-status-multiple", checkPermission("UPDATE_DEPARTURE"), controllers.changeStatusMultiple);

router.get("/get-departure/:departureId", checkPermission("READ_DEPARTURE"), controllers.getDeparture);

module.exports = router;