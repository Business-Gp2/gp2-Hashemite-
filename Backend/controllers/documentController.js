const Document = require("../models/Document");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/documents";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF and image files
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed!'), false);
    }
  }
}).single("file");

// Save document as draft
exports.saveAsDraft = async (req, res) => {
  try {
    console.log("Saving draft document");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    const { title, type, description, course } = req.body;
    const userId = req.user._id;

    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    const document = new Document({
      title,
      type,
      description,
      course,
      file: `/uploads/documents/${req.file.filename}`,
      status: "draft",
      user: userId,
    });

    console.log("Created document object:", document);

    await document.save();
    console.log("Document saved successfully");

    res.status(201).json({
      success: true,
      message: "Document saved as draft successfully",
      document,
    });
  } catch (error) {
    console.error("Error saving draft:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    const { title, type, description, course } = req.body;
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    const document = new Document({
      title,
      type,
      description,
      course,
      file: `/uploads/documents/${req.file.filename}`,
      status: "submitted",
      user: userId,
    });

    await document.save();

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all documents for a user
exports.getUserDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    const documents = await Document.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Middleware to handle file upload
exports.handleFileUpload = (req, res, next) => {
  console.log("File upload request received");
  console.log("Request body:", req.body);
  console.log("Request file:", req.file);

  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    } else if (err) {
      console.error("File upload error:", err);
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    console.log("File uploaded successfully:", req.file);
    next();
  });
};

// Get draft documents for a user
exports.getDraftDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    const documents = await Document.find({
      user: userId,
      status: "draft",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single document
exports.getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    console.log("Retrieved document file path:", document.file);
    console.log(
      "File exists:",
      document.file ? fs.existsSync(document.file) : false
    );

    res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Error getting document:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a document
exports.updateDocument = async (req, res) => {
  try {
    const { title, type, description, course } = req.body;
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Update document fields
    document.title = title || document.title;
    document.type = type || document.type;
    document.description = description || document.description;
    document.course = course || document.course;

    // If a new file is uploaded
    if (req.file) {
      // Delete old file if it exists
      const oldFilePath = path.join(__dirname, '..', document.file);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      document.file = `/uploads/documents/${req.file.filename}`;
    }

    await document.save();

    res.status(200).json({
      success: true,
      message: "Document updated successfully",
      document,
    });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found or you do not have permission to delete it",
      });
    }

    // Delete the file from the filesystem
    const filePath = path.join(__dirname, '..', document.file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete the document from the database
    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting document",
    });
  }
};

// Submit a draft document
exports.submitDraft = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "draft",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Draft document not found",
      });
    }

    document.status = "submitted";
    await document.save();

    res.status(200).json({
      success: true,
      message: "Document submitted successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get document counts by status for a user
exports.getDocumentCounts = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalCount = await Document.countDocuments({ user: userId });
    const draftCount = await Document.countDocuments({
      user: userId,
      status: "draft",
    });
    const approvedCount = await Document.countDocuments({
      user: userId,
      status: "approved",
    });
    const pendingCount = await Document.countDocuments({
      user: userId,
      status: "submitted",
    });

    res.status(200).json({
      success: true,
      counts: {
        total: totalCount,
        draft: draftCount,
        approved: approvedCount,
        pending: pendingCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get approved documents for a user
exports.getApprovedDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    const documents = await Document.find({
      user: userId,
      status: "approved",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Error getting approved documents:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get documents by doctor's courses
exports.getDocumentsByDoctorCourses = async (req, res) => {
  try {
    const doctorCourses = req.user.courses || [];

    console.log("Getting documents for doctor courses:", doctorCourses);

    if (!doctorCourses.length) {
      return res.status(200).json({
        success: true,
        documents: [],
        message: "No courses assigned to doctor",
      });
    }

    // Find all documents that match the doctor's courses
    const documents = await Document.find({
      course: { $in: doctorCourses },
    })
      .populate({
        path: "user",
        select: "firstName lastName userId role",
        model: "User",
      })
      .sort({ createdAt: -1 });

    console.log(`Found ${documents.length} documents for doctor's courses`);

    // Group documents by course
    const documentsByCourse = doctorCourses.reduce((acc, course) => {
      acc[course] = documents.filter((doc) => doc.course === course);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      documents,
      documentsByCourse,
    });
  } catch (error) {
    console.error("Error getting documents by doctor courses:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching documents",
    });
  }
};

// Update a draft document
exports.updateDraft = async (req, res) => {
  try {
    const { title, type, description, course } = req.body;
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "draft",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Draft document not found",
      });
    }

    // Update document fields
    document.title = title || document.title;
    document.type = type || document.type;
    document.description = description || document.description;
    document.course = course || document.course;

    // If a new file is uploaded
    if (req.file) {
      // Delete old file if it exists
      const oldFilePath = path.join(__dirname, '..', document.file);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      document.file = `/uploads/documents/${req.file.filename}`;
    }

    await document.save();

    res.status(200).json({
      success: true,
      message: "Draft updated successfully",
      document,
    });
  } catch (error) {
    console.error("Error updating draft:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all documents by status for admin
exports.getDocumentsByStatus = async (req, res) => {
  try {
    const { status } = req.query; // e.g., ?status=approved
    const query = status ? { status } : {};
    const documents = await Document.find(query)
      .populate("user", "firstName lastName")
      .populate("course");
    res.status(200).json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
