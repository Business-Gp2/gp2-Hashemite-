const Doctor = require("../models/Doctor");
const User = require("../models/User");

// Create Doctor Profile
exports.createDoctor = async (req, res) => {
  try {
    const { userId, doctorId, department, specialization, officeHours } =
      req.body;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ doctorId });
    if (existingDoctor) {
      return res.status(400).json({ message: "Doctor ID already exists" });
    }

    const doctor = await Doctor.create({
      user: userId,
      doctorId,
      department,
      specialization,
      officeHours,
    });

    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Doctor Profile
exports.getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.params.id })
      .populate("user", "firstName lastName email")
      .populate("courses");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Doctor Profile
exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.params.id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(doctor._id, req.body, {
      new: true,
    }).populate("user", "firstName lastName email");

    res.json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Doctor Profile
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.params.id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    await Doctor.findByIdAndDelete(doctor._id);
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
