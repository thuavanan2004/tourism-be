const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/admin/auth.controller");

router.post("/login", controllers.login);

router.get("/logout", controllers.logout);

module.exports = router;