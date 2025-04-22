const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createDoctor,
  getDoctor,
  updateDoctor,
  deleteDoctor,
} = require("../controllers/doctorController");

// Apply authentication middleware to all routes
router.use(protect);

// Doctor routes
router.post("/", createDoctor);
router.get("/:id", getDoctor);
router.put("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);

module.exports = router;
