const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// Login and Registation and LogoutRoutes
router.post("/auth/register", authController.registerUser);
router.post("/auth/login", authController.login);
router.get("/auth/logout", authController.logout);

module.exports = router;
