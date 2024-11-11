const express = require("express");
const router = express.Router();

const {
  checkPermission
} = require("../../middlewares/admin/checkPermission.middleware");

const controllers = require("../../controllers/admin/tour_detail.controller");

router.post("/create", checkPermission('CREATE_TOUR'), controllers.create);

router.patch("/edit", checkPermission('UPDATE_TOUR'), controllers.edit);

router.delete("/delete", checkPermission('DELETE_TOUR'), controllers.delete);


module.exports = router;