const Document = require("../models/Document");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dtn8nedbg",
  api_key: "764718657862329",
  api_secret: "QbKxrc4mYfoqjbVrUkyySbOyZIc",
});

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/temp";
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
}).single("file");

// Save document as draft
exports.saveAsDraft = async (req, res) => {
  try {
    const { title, type, description, course } = req.body;
    const userId = req.user._id;

    let cloudinaryResult = null;
    if (req.file) {
      try {
        // Upload to Cloudinary
        cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "documents",
          resource_type: "auto",
        });

        // Delete temporary file
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        // Delete temporary file even if upload fails
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        throw new Error("Failed to upload file to Cloudinary");
      }
    }

    const document = new Document({
      title,
      type,
      description,
      course,
      file: cloudinaryResult ? cloudinaryResult.secure_url : null,
      cloudinaryId: cloudinaryResult ? cloudinaryResult.public_id : null,
      status: "draft",
      user: userId,
    });

    await document.save();

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

    let cloudinaryResult;
    try {
      // Upload to Cloudinary
      cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "documents",
        resource_type: "auto",
      });

      // Delete temporary file
      fs.unlinkSync(req.file.path);
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      // Delete temporary file even if upload fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      throw new Error("Failed to upload file to Cloudinary");
    }

    const document = new Document({
      title,
      type,
      description,
      course,
      file: cloudinaryResult.secure_url,
      cloudinaryId: cloudinaryResult.public_id,
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
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
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
      try {
        // Delete old file from Cloudinary if it exists
        if (document.cloudinaryId) {
          await cloudinary.uploader.destroy(document.cloudinaryId);
        }

        // Upload new file to Cloudinary
        const cloudinaryResult = await cloudinary.uploader.upload(
          req.file.path,
          {
            folder: "documents",
            resource_type: "auto",
          }
        );

        // Delete temporary file
        fs.unlinkSync(req.file.path);

        document.file = cloudinaryResult.secure_url;
        document.cloudinaryId = cloudinaryResult.public_id;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        // Delete temporary file even if upload fails
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        throw new Error("Failed to upload file to Cloudinary");
      }
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
    // Find the document and verify ownership
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message:
          "Document not found or you do not have permission to delete it",
      });
    }

    // Delete from Cloudinary if document has a cloudinaryId
    if (document.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(document.cloudinaryId);
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
        // Continue with document deletion even if Cloudinary deletion fails
      }
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
      try {
        // Delete old file from Cloudinary if it exists
        if (document.cloudinaryId) {
          await cloudinary.uploader.destroy(document.cloudinaryId);
        }

        // Upload new file to Cloudinary
        const cloudinaryResult = await cloudinary.uploader.upload(
          req.file.path,
          {
            folder: "documents",
            resource_type: "auto",
          }
        );

        // Delete temporary file
        fs.unlinkSync(req.file.path);

        document.file = cloudinaryResult.secure_url;
        document.cloudinaryId = cloudinaryResult.public_id;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        // Delete temporary file even if upload fails
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        throw new Error("Failed to upload file to Cloudinary");
      }
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
