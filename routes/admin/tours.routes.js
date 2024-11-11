const express = require("express");
const router = express.Router();
const multer = require('multer');
const uploadCloudinaryMiddleware = require("../../middlewares/admin/uploadCloud.middleware");
const {
  checkPermission
} = require("../../middlewares/admin/checkPermission.middleware");

const upload = multer();

const controllers = require("../../controllers/admin/tours.controller");

router.get("/search", checkPermission('READ_TOUR'), controllers.search);

router.post("/create", checkPermission('CREATE_TOUR'), upload.array('images'), uploadCloudinaryMiddleware.uploadFields, controllers.create);

router.patch("/edit/:tourId", checkPermission('UPDATE_TOUR'), upload.array('images'), uploadCloudinaryMiddleware.uploadFields, controllers.edit);

router.get("/detail/:tourId", checkPermission('READ_TOUR'), controllers.getTour);

router.patch("/remove/:tourId", checkPermission('DELETE_TOUR'), controllers.removeTour);

router.get("/get-all-tour", checkPermission('READ_TOUR'), controllers.getAllTour);

router.get("/expired", checkPermission('READ_TOUR'), controllers.getExpiredTours);

router.get("/expired-soon", checkPermission('READ_TOUR'), controllers.getExpiredSoonTours);

router.patch("/status/:tourId", checkPermission('UPDATE_TOUR'), controllers.updateTourStatus);

router.patch("/featured/:tourId", checkPermission('UPDATE_TOUR'), controllers.updateTourFeatured);

router.patch("/update-multiple", checkPermission('UPDATE_TOUR'), controllers.updateMultiple);

router.get("/statistics/:tourId", checkPermission('READ_TOUR'), controllers.statistics);





module.exports = router;