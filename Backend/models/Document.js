const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["homework", "excuse_of_absence", "grade_review", "other"],
    default: "other",
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  course: {
    type: String,
    required: true,
    enum: ["CS101", "MATH201", "ENG105", "WEB ADVANCE"],
    trim: true,
  },
  file: {
    type: String, // This will store the file path
    required: true,
  },
  status: {
    type: String,
    enum: ["draft", "submitted", "approved", "rejected"],
    default: "draft",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
documentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Document", documentSchema);
