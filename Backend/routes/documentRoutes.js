const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  saveAsDraft,
  uploadDocument,
  getUserDocuments,
  handleFileUpload,
  getDraftDocuments,
  getDocument,
  updateDraft,
  deleteDocument,
  submitDraft
} = require('../controllers/documentController');

// Apply authentication middleware to all routes
router.use(protect);

// Get all documents for the authenticated user
router.get('/', getUserDocuments);

// Get draft documents
router.get('/drafts', getDraftDocuments);

// Get a single document
router.get('/:id', getDocument);

// Save document as draft
router.post('/draft', handleFileUpload, saveAsDraft);

// Update a draft document
router.put('/draft/:id', handleFileUpload, updateDraft);

// Delete a document
router.delete('/:id', deleteDocument);

// Submit a draft document
router.put('/submit/:id', submitDraft);

// Upload document
router.post('/upload', handleFileUpload, uploadDocument);

module.exports = router; 