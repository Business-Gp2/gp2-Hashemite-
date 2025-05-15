import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import DoctorLayout from "./DoctorLayout";
import Swal from "sweetalert2";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  User,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000";

const DoctorPendingDocuments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPendingDocuments();
  }, []);

  const fetchPendingDocuments = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/doctor/pending-documents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
      console.error("Error fetching pending documents:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
      toast.error("Failed to fetch pending documents");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (documentId, documentTitle) => {
    const result = await Swal.fire({
      title: "Approve Document?",
      html: `Are you sure you want to approve <strong>${documentTitle}</strong>?<br/><br/>This action cannot be undone.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, approve it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const token = Cookies.get("token");
        const response = await axios.put(
          `${API_URL}/api/doctor/approve-document/${documentId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          Swal.fire({
            title: "Approved!",
            text: "The document has been approved.",
            icon: "success",
            confirmButtonColor: "#10B981",
          });
          fetchPendingDocuments(); // Refresh the list
        }
      } catch (error) {
        console.error("Error approving document:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to approve document. Please try again.",
          icon: "error",
          confirmButtonColor: "#EF4444",
        });
      }
    }
  };

  const handleReject = async (documentId, documentTitle) => {
    const result = await Swal.fire({
      title: "Reject Document?",
      html: `Are you sure you want to reject <strong>${documentTitle}</strong>?<br/><br/>This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, reject it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const token = Cookies.get("token");
        const response = await axios.put(
          `${API_URL}/api/doctor/reject-document/${documentId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          Swal.fire({
            title: "Rejected!",
            text: "The document has been rejected.",
            icon: "success",
            confirmButtonColor: "#10B981",
          });
          fetchPendingDocuments(); // Refresh the list
        }
      } catch (error) {
        console.error("Error rejecting document:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to reject document. Please try again.",
          icon: "error",
          confirmButtonColor: "#EF4444",
        });
      }
    }
  };

  const handleViewDocument = (document) => {
    console.log("Viewing document:", document); // Debug log
    setSelectedDocument(document);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDocument(null);
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith("http")) return filePath;
    return `${API_URL}${filePath}`;
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.course.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "all") return matchesSearch;
    return matchesSearch && doc.type === filter;
  });

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Pending Documents
          </h1>
          <p className="mt-2 text-gray-600">
            Review and manage pending document submissions
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:col-span-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="assignment">Assignment</option>
                <option value="project">Project</option>
                <option value="report">Report</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No pending documents
            </h3>
            <p className="text-gray-500">
              There are no documents waiting for your review.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {doc.title}
                    </h3>
                    <p className="text-gray-600">{doc.description}</p>
                  </div>
                  <div className="flex items-center text-blue-600">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span className="capitalize">Pending</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <User className="w-5 h-5 mr-2" />
                    <span>
                      {doc.user.firstName} {doc.user.lastName}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FileText className="w-5 h-5 mr-2" />
                    <span>{doc.type}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => handleViewDocument(doc)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Document
                  </button>
                  <button
                    onClick={() => handleApprove(doc._id, doc.title)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(doc._id, doc.title)}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Document View Modal */}
        {showModal && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-11/12 max-w-6xl h-5/6 flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedDocument.title}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {selectedDocument.course} • {selectedDocument.type} •
                    <span className="ml-1">
                      {new Date(
                        selectedDocument.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex-1 flex overflow-hidden">
                <div className="w-1/3 p-5 border-r bg-gray-50 overflow-y-auto">
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                        Document Details
                      </h3>
                      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Title
                            </p>
                            <p className="text-gray-900">
                              {selectedDocument.title}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Type
                            </p>
                            <p className="text-gray-900">
                              {selectedDocument.type}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Course
                            </p>
                            <p className="text-gray-900">
                              {selectedDocument.course}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Description
                            </p>
                            <p className="text-gray-900">
                              {selectedDocument.description}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Status
                            </p>
                            <span className="inline-block px-2 py-1 text-xs rounded-full font-medium text-blue-600 bg-blue-100">
                              Pending
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-2/3 p-2 bg-gray-100 flex flex-col overflow-hidden">
                  <div className="flex-1 p-5 overflow-y-auto">
                    {selectedDocument.file ? (
                      <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="text-center">
                          {selectedDocument.file
                            .toLowerCase()
                            .endsWith(".pdf") ? (
                            <div className="w-full h-[600px]">
                              <iframe
                                src={getFileUrl(selectedDocument.file)}
                                className="w-full h-full border-0"
                                title="PDF Preview"
                                onError={(e) => {
                                  console.error("Error loading PDF:", e);
                                  toast.error("Error loading PDF preview");
                                }}
                              />
                            </div>
                          ) : (
                            <img
                              src={getFileUrl(selectedDocument.file)}
                              alt={selectedDocument.title}
                              className="max-w-full max-h-[600px] object-contain"
                              onError={(e) => {
                                console.error("Error loading image:", e);
                                toast.error("Error loading image preview");
                              }}
                            />
                          )}
                          <div className="mt-4 flex space-x-4 justify-center">
                            <a
                              href={getFileUrl(selectedDocument.file)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              View
                            </a>
                            <a
                              href={getFileUrl(selectedDocument.file)}
                              download
                              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                              </svg>
                              Download
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <svg
                          className="w-12 h-12 mx-auto text-gray-400 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="text-gray-600 mb-2">
                          No document file available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default DoctorPendingDocuments;
