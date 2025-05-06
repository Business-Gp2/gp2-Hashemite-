const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createDoctor,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  getAllDocuments,
  getPendingDocuments,
  getMessages,
  getStats,
  rejectDocument,
  approveDocument,
  getAllDoctors,
} = require("../controllers/doctorController");

// Apply authentication middleware to all routes
router.use(protect);

// Get all documents for doctor's courses
router.get("/all-documents", getAllDocuments);

// Get pending documents for doctor's courses
router.get("/pending-documents", getPendingDocuments);

// Get doctor's messages
router.get("/messages", getMessages);

// Get doctor's stats
router.get("/stats", getStats);

// Reject document
router.put("/reject-document/:id", rejectDocument);

// Approve document
router.put("/approve-document/:id", approveDocument);

// Get all doctors (for student message dropdown)
router.get("/all", getAllDoctors);

// Doctor profile routes
router.post("/", createDoctor);
router.get("/:id", getDoctor);
router.put("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);

module.exports = router;
