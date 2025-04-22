const Student = require("../models/Student");
const User = require("../models/User");

// Create Student Profile
exports.createStudent = async (req, res) => {
  try {
    const { userId, studentId, department, year, semester } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ message: "Student ID already exists" });
    }

    const student = await Student.create({
      user: userId,
      studentId,
      department,
      year,
      semester,
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Student Profile
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.params.id })
      .populate("user", "firstName lastName email")
      .populate("courses");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Student Profile
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.params.id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      student._id,
      req.body,
      { new: true }
    ).populate("user", "firstName lastName email");

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Student Profile
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.params.id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await Student.findByIdAndDelete(student._id);
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
