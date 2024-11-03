const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/client/order.controller");

router.post("/book-tour", controllers.bookTour)


module.exports = router;