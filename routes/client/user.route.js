const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/client/user.controller");

router.get("/profile", controllers.profile);

router.patch("/change-password", controllers.changePassword);

router.patch("/update", controllers.update);

router.patch("/delete", controllers.delete)

module.exports = router;