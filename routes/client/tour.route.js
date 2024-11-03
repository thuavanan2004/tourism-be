const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/client/auth.middlware");

const controllers = require("../../controllers/client/tour.controller");

// router.get("/", controllers.index);

router.get("/detail/:slug", controllers.detail);

router.get("/feature", controllers.feature);

router.get("/flash-sale", controllers.flashSale);

router.get("/favorites", authMiddleware.requireAuth, controllers.getTourFavorites);

router.get("/search", controllers.search);

router.get("/:slug", controllers.getTour);

router.post("/favorites", authMiddleware.requireAuth, controllers.addTourfavorites);

router.delete("/favorites", authMiddleware.requireAuth, controllers.deleteTourFavorites);



module.exports = router;