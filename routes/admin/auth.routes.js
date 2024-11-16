const express = require("express");
const router = express.Router();
const {
  requireAuth
} = require("../../middlewares/admin/auth.middleware");

const controllers = require("../../controllers/admin/auth.controller");

router.post("/login", controllers.login);

router.get("/logout", controllers.logout);

router.post("/verify-token", controllers.verifyToken);

module.exports = router;