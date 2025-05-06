const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Document = require("../models/Document");
const Student = require("../models/Student");

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

// Get all documents for doctor's courses
exports.getAllDocuments = async (req, res) => {
  try {
    const doctorCourses = req.user.courses || [];

    if (!doctorCourses.length) {
      return res.status(200).json({
        success: true,
        documents: [],
        message: "No courses assigned to doctor",
      });
    }

    const documents = await Document.find({
      course: { $in: doctorCourses },
    })
      .populate("user", "firstName lastName userId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Error getting all documents:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get pending documents for doctor's courses
exports.getPendingDocuments = async (req, res) => {
  try {
    // Get doctor's courses from the user document
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const doctorCourses = user.courses || [];

    if (!doctorCourses.length) {
      return res.status(200).json({
        success: true,
        documents: [],
        message: "No courses assigned to doctor",
      });
    }

    const documents = await Document.find({
      course: { $in: doctorCourses },
      status: "submitted",
    })
      .populate({
        path: "user",
        select: "firstName lastName userId",
        model: "User",
      })
      .sort({ createdAt: -1 });

    // Transform the documents to include student name
    const transformedDocuments = documents.map((doc) => ({
      ...doc.toObject(),
      studentName: `${doc.user.firstName} ${doc.user.lastName}`,
      studentId: doc.user.userId,
    }));

    res.status(200).json({
      success: true,
      documents: transformedDocuments,
    });
  } catch (error) {
    console.error("Error getting pending documents:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get doctor's messages
exports.getMessages = async (req, res) => {
  try {
    // For now, return empty array as messages feature is not implemented
    res.status(200).json({
      success: true,
      messages: [],
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get doctor's stats
exports.getStats = async (req, res) => {
  try {
    // Get doctor's courses from the Doctor model (as codes)
    const doctor = await Doctor.findOne({ user: req.user._id }); // No populate
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const doctorCourses = doctor.courses || [];

    let stats = {
      totalDocuments: 0,
      pendingDocuments: 0,
      approvedDocuments: 0,
      rejectedDocuments: 0,
      totalStudents: 0,
      totalCourses: doctorCourses.length,
      unreadMessages: 0,
      courseDetails: [],
      studentDetails: [],
    };

    if (doctorCourses.length > 0) {
      // Get total documents
      stats.totalDocuments = await Document.countDocuments({
        course: { $in: doctorCourses },
      });

      // Get pending documents
      stats.pendingDocuments = await Document.countDocuments({
        course: { $in: doctorCourses },
        status: "submitted",
      });

      // Get approved documents
      stats.approvedDocuments = await Document.countDocuments({
        course: { $in: doctorCourses },
        status: "approved",
      });

      // Get rejected documents
      stats.rejectedDocuments = await Document.countDocuments({
        course: { $in: doctorCourses },
        status: "rejected",
      });

      // Get students enrolled in these courses with their details
      const students = await Student.find({
        courses: { $in: doctorCourses },
      }).populate("user", "firstName lastName");

      stats.totalStudents = students.length;
      stats.studentDetails = students.map((student) => ({
        id: student._id,
        name: student.user
          ? `${student.user.firstName} ${student.user.lastName}`
          : "Unknown",
        studentId: student.studentId,
        department: student.department,
      }));

      // Provide courseDetails as just the code (and name as code)
      stats.courseDetails = doctorCourses.map((code) => ({
        id: code,
        code,
        name: code,
      }));
    }

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error getting doctor stats:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reject document
exports.rejectDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    const doctorId = req.user._id;

    // Find the document
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check if the document's course matches any of the doctor's courses
    const user = await User.findById(doctorId);
    if (!user || !user.courses.includes(document.course)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reject this document",
      });
    }

    // Update document status to rejected
    document.status = "rejected";
    document.reviewedBy = doctorId;
    document.reviewedAt = Date.now();
    await document.save();

    res.status(200).json({
      success: true,
      message: "Document rejected successfully",
      document,
    });
  } catch (error) {
    console.error("Error rejecting document:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error rejecting document",
    });
  }
};

// Approve document
exports.approveDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    const doctorId = req.user._id;

    // Find the document
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check if the document's course matches any of the doctor's courses
    const user = await User.findById(doctorId);
    if (!user || !user.courses.includes(document.course)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to approve this document",
      });
    }

    // Update document status to approved
    document.status = "approved";
    document.reviewedBy = doctorId;
    document.reviewedAt = Date.now();
    await document.save();

    res.status(200).json({
      success: true,
      message: "Document approved successfully",
      document,
    });
  } catch (error) {
    console.error("Error approving document:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error approving document",
    });
  }
};

// Get all doctors (for student message dropdown)
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("user", "firstName lastName");
    const doctorList = doctors.map((doc) => ({
      userId: doc.user._id,
      firstName: doc.user.firstName,
      lastName: doc.user.lastName,
    }));
    res.status(200).json({ success: true, doctors: doctorList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
