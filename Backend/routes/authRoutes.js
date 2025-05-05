const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { register, login, logout, getCurrentUser } = require("../controllers/authController");

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Logout route
router.post("/logout", protect, logout);

// Get current user route
router.get("/me", protect, getCurrentUser);

module.exports = router;
