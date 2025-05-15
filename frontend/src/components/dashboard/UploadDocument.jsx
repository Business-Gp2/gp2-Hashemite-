import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { PDFDocument } from "pdf-lib";
import { useDropzone } from "react-dropzone";
import Cookies from "js-cookie";

// Backend API URL configuration
const API_URL = "http://localhost:5000";

const UploadDocument = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    type: "homework",
    description: "",
    course: "",
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [documentId, setDocumentId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    noClick: false,
    noKeyboard: true,
    preventDropOnDocument: true,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        console.log("File type:", file.type); // Debug log
        // Validate file type
        if (file.type === "application/pdf" || file.type.startsWith("image/")) {
          setSelectedFile(file);
          setFormData((prev) => ({
            ...prev,
            file: file,
          }));
          toast.success("File selected successfully");
        } else {
          toast.error("Only PDF and image files are allowed!");
        }
      }
    },
    onDropRejected: (rejectedFiles) => {
      console.log("Rejected files:", rejectedFiles); // Debug log
      const error = rejectedFiles[0].errors[0];
      if (error.code === "file-too-large") {
        toast.error("File is too large. Maximum size is 5MB");
      } else if (error.code === "file-invalid-type") {
        toast.error("Only PDF and image files are allowed!");
      } else {
        toast.error("Error uploading file: " + error.message);
      }
    },
  });

  useEffect(() => {
    if (location.state?.document) {
      const { document } = location.state;
      setIsEditing(true);
      setDocumentId(document._id);
      setFormData({
        title: document.title,
        type: document.type,
        description: document.description,
        course: document.course,
        file: null,
      });
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setLoading(true);
    setSubmitting(true);
    setError(null);

    try {
      const token = Cookies.get("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("course", formData.course);
      if (selectedFile) {
        formDataToSend.append("file", selectedFile);
      }

      const response = await axios.post(
        `${API_URL}/api/documents`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Document uploaded successfully");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      setError(error.response?.data?.message || "Failed to upload document");
      toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to save as draft");
      return;
    }

    try {
      setSubmitting(true);
      const token = Cookies.get("token");
      if (!token) {
        navigate("/login");
        return;
      }

      console.log("Selected file:", selectedFile);
      console.log("Form data:", formData);

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("course", formData.course);
      formDataToSend.append("file", selectedFile);
      formDataToSend.append("status", "draft");

      console.log("Sending request to:", `${API_URL}/api/documents/draft`);
      console.log("Request headers:", {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      });

      const response = await axios.post(
        `${API_URL}/api/documents/draft`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Response:", response.data);

      if (response.data.success) {
        toast.success("Document saved as draft successfully");
        navigate("/dashboard/draft-document");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      console.error("Error response:", error.response?.data);
      setError(error.response?.data?.message || "Failed to save draft");
      toast.error(error.response?.data?.message || "Failed to save draft");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            {isEditing ? "Edit Document" : "Upload Document"}
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            {isEditing
              ? "Update your document information below"
              : "Share your work with a beautiful PDF conversion"}
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
            <h2 className="text-xl font-medium text-gray-800">
              Document Information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-10 space-y-8">
            <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label
                  htmlFor="title"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base border-gray-300 rounded-lg py-3 px-4"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="type"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Document Type
                </label>
                <div className="mt-1">
                  <select
                    name="type"
                    id="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base border-gray-300 rounded-lg py-3 px-4"
                    required
                  >
                    <option value="homework">Homework</option>
                    <option value="excuse_of_absence">Excuse of Absence</option>
                    <option value="grade_review">Grade Review</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="course"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Course
                </label>
                <div className="mt-1">
                  <select
                    name="course"
                    id="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base border-gray-300 rounded-lg py-3 px-4"
                    required
                  >
                    <option value="">Select a course</option>
                    <option value="CS101">
                      CS101 - Introduction to Computer Science
                    </option>
                    <option value="MATH201">
                      MATH201 - Advanced Mathematics
                    </option>
                    <option value="ENG105">ENG105 - English Composition</option>
                    <option value="WEB ADVANCE">
                      WEB ADVANCE - Advanced Web Development
                    </option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="description"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    name="description"
                    id="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base border-gray-300 rounded-lg py-3 px-4"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <div className="mt-1">
                  <div
                    {...getRootProps()}
                    className={`mt-1 flex justify-center px-8 pt-8 pb-8 border-2 border-dashed rounded-lg transition-all duration-300 ${
                      isDragActive
                        ? "border-blue-500 bg-blue-50"
                        : selectedFile
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={(e) => {
                      // Prevent event bubbling
                      e.stopPropagation();
                      getRootProps().onClick(e);
                    }}
                  >
                    <div className="space-y-3 text-center">
                      {selectedFile ? (
                        <div className="flex flex-col items-center">
                          <svg
                            className="h-16 w-16 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="mt-2 text-sm text-green-600 font-medium">
                            File uploaded successfully!
                          </span>
                        </div>
                      ) : (
                        <svg
                          className={`mx-auto h-16 w-16 ${
                            isDragActive ? "text-blue-500" : "text-gray-400"
                          }`}
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      <div
                        className={`flex text-base ${
                          selectedFile ? "text-green-600" : "text-gray-600"
                        }`}
                      >
                        <label
                          className={`relative cursor-pointer rounded-md font-medium focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 ${
                            selectedFile
                              ? "text-green-600 hover:text-green-500"
                              : "text-blue-600 hover:text-blue-500"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>
                            {selectedFile ? "Change file" : "Upload a file"}
                          </span>
                          <input
                            {...getInputProps()}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </label>
                        <p className="pl-1">
                          {selectedFile
                            ? "or drag and drop a new one"
                            : "or drag and drop"}
                        </p>
                      </div>
                      <p
                        className={`text-sm ${
                          selectedFile ? "text-green-500" : "text-gray-500"
                        }`}
                      >
                        PDF, PNG, JPG, JPEG up to 5MB
                      </p>
                      {selectedFile && (
                        <div className="mt-4 p-4 bg-green-100 rounded-lg">
                          <p className="text-sm font-medium text-green-800">
                            Selected file: {selectedFile.name}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Type: {selectedFile.type}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save as Draft"}
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={submitting}
              >
                {submitting ? "Uploading..." : "Upload Document"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadDocument;
