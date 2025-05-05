const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  saveAsDraft,
  uploadDocument,
  getUserDocuments,
  handleFileUpload,
  getDraftDocuments,
  getDocument,
  updateDraft,
  deleteDocument,
  submitDraft,
  getDocumentCounts,
  getApprovedDocuments,
  getDocumentsByDoctorCourses,
  updateDocument,
} = require("../controllers/documentController");

// Apply authentication middleware to all routes
router.use(protect);

// Get document counts
router.get("/counts", getDocumentCounts);

// Get all documents for the authenticated user
router.get("/", getUserDocuments);

// Get draft documents
router.get("/drafts", getDraftDocuments);

// Get approved documents
router.get("/approved", getApprovedDocuments);

// Get documents by doctor's courses
router.get("/doctor-courses", getDocumentsByDoctorCourses);

// Save document as draft
router.post("/draft", handleFileUpload, saveAsDraft);

// Upload document
router.post("/", handleFileUpload, uploadDocument);

// Update a draft document
router.put("/draft/:id", handleFileUpload, updateDraft);

// Submit a draft document
router.put("/submit/:id", submitDraft);

// Update a document
router.put("/:id", handleFileUpload, updateDocument);

// Get a single document
router.get("/:id", getDocument);

// Delete a document
router.delete("/:id", deleteDocument);

module.exports = router;
