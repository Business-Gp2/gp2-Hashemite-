const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createStudent,
  getStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

// Apply authentication middleware to all routes
router.use(protect);

// Student routes
router.post("/", createStudent);
router.get("/:id", getStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;
