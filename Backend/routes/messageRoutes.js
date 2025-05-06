const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getDoctorMessages,
  getStudentMessages,
  replyToMessage,
  getConversation,
} = require("../controllers/messageController");

router.use(protect);

// Send a new message
router.post("/", sendMessage);
// Get messages for doctor
router.get("/doctor", getDoctorMessages);
// Get messages for student
router.get("/student", getStudentMessages);
// Reply to a message
router.post("/reply", replyToMessage);
// Get all messages in a conversation
router.get("/conversation/:userId", getConversation);

module.exports = router;
