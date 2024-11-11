const express = require("express");
const router = express.Router();


const controllers = require("../../controllers/admin/statistics.controller");

router.get("/tours", controllers.tours);

router.get("/categories", controllers.categories);

router.get("/destinations", controllers.destinations);

router.get("/departures", controllers.departures);

router.get("/transportations", controllers.transportations);

router.get("/orders", controllers.orders);

module.exports = router;