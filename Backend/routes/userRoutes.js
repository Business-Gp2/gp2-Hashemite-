const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const {
  getProfile,
  updateProfilePic,
  changePassword,
  getUserStats,
} = require("../controllers/userController");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: fileFilter,
});

// Apply authentication middleware to all routes
router.use(protect);

// Profile picture upload route
router.post("/profile-pic", upload.single("profilePic"), updateProfilePic);

// Change password route
router.post("/change-password", changePassword);

// Get user profile
router.get("/profile", getProfile);

// Get user stats
router.get("/stats", getUserStats);

module.exports = router;
