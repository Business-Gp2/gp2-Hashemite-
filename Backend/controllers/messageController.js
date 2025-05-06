const Message = require("../models/Message");
const User = require("../models/User");

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { to, content } = req.body;
    const from = req.user._id;
    if (!to || !content) {
      return res.status(400).json({
        success: false,
        message: "Recipient and content are required.",
      });
    }
    // Validate recipient exists and is a doctor
    const recipient = await User.findById(to);
    if (!recipient) {
      return res
        .status(404)
        .json({ success: false, message: "Recipient user not found." });
    }
    if (recipient.role !== "doctor") {
      return res
        .status(400)
        .json({ success: false, message: "Recipient is not a doctor." });
    }
    const message = await Message.create({ from, to, content });
    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages for doctor (grouped by student)
exports.getDoctorMessages = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const messages = await Message.find({ to: doctorId })
      .populate("from", "firstName lastName role")
      .sort({ timestamp: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages for student (grouped by doctor)
exports.getStudentMessages = async (req, res) => {
  try {
    const studentId = req.user._id;
    const messages = await Message.find({ to: studentId })
      .populate("from", "firstName lastName role")
      .sort({ timestamp: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Doctor or student replies to a message
exports.replyToMessage = async (req, res) => {
  try {
    const { to, content, replyTo } = req.body;
    const from = req.user._id;
    if (!to || !content) {
      return res.status(400).json({
        success: false,
        message: "Recipient and content are required.",
      });
    }
    const reply = await Message.create({ from, to, content, replyTo });
    res.status(201).json({ success: true, message: reply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all messages between the logged-in user and another user
exports.getConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.userId;
    const messages = await Message.find({
      $or: [
        { from: userId, to: otherUserId },
        { from: otherUserId, to: userId },
      ],
    })
      .populate("from", "firstName lastName role")
      .sort({ timestamp: 1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
