import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const API_URL = "http://localhost:5000";

const DraftDocument = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/api/documents/drafts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDrafts(response.data.documents);
    } catch (error) {
      console.error("Error fetching drafts:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
      toast.error("Failed to fetch draft documents");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (document) => {
    if (!document.file) {
      toast.error("No file available for this document");
      return;
    }
    setSelectedDocument(document);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDocument(null);
  };

  const handleEdit = (document) => {
    navigate("/dashboard/upload-document", { state: { document } });
  };

  const handleDelete = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this draft?")) {
      try {
        const token = Cookies.get("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.delete(
          `${API_URL}/api/documents/${documentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          toast.success("Draft deleted successfully");
          setDrafts(drafts.filter((doc) => doc._id !== documentId));
        } else {
          toast.error(response.data.message || "Failed to delete draft");
        }
      } catch (error) {
        console.error("Error deleting draft:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to delete draft";
        toast.error(errorMessage);
      }
    }
  };

  const handleSubmit = async (documentId) => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.put(
        `${API_URL}/api/documents/submit/${documentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Document submitted successfully");
      fetchDrafts();
    } catch (error) {
      console.error("Error submitting draft:", error);
      toast.error("Failed to submit document");
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-amber-100 text-amber-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderActionButton = (label, onClick, colorClass, iconPath) => (
    <button
      onClick={onClick}
      className={`group flex items-center px-3 py-1 rounded-md transition-all ${colorClass}`}
    >
      <svg
        className="w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d={iconPath}
        />
      </svg>
      <span>{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Draft Documents</h1>
          <button
            onClick={() => navigate("/dashboard/upload-document")}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Document
          </button>
        </div>

        {drafts.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-16 text-center border border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
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
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No draft documents
            </h3>
            <p className="text-gray-500 mb-6">
              You don't have any draft documents yet.
            </p>
            <button
              onClick={() => navigate("/dashboard/upload-document")}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Document
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {drafts.map((doc) => (
              <div
                key={doc._id}
                className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden transition-all hover:shadow-md"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h2 className="text-xl font-semibold text-gray-900 mr-3">
                          {doc.title}
                        </h2>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium uppercase ${getStatusBadgeColor(
                            doc.status
                          )}`}
                        >
                          {doc.status || "Draft"}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{doc.description}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <span>{doc.type}</span>
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                          <span>{doc.course}</span>
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
                  {renderActionButton(
                    "View",
                    () => handleView(doc),
                    "text-blue-700 hover:bg-blue-50",
                    "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  )}
                  {renderActionButton(
                    "Edit",
                    () => handleEdit(doc),
                    "text-green-700 hover:bg-green-50",
                    "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  )}
                  {renderActionButton(
                    "Delete",
                    () => handleDelete(doc._id),
                    "text-red-700 hover:bg-red-50",
                    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  )}
                  {renderActionButton(
                    "Submit",
                    () => handleSubmit(doc._id),
                    "text-purple-700 hover:bg-purple-50",
                    "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
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
                    {new Date(selectedDocument.createdAt).toLocaleDateString()}
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
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${getStatusBadgeColor(
                              selectedDocument.status
                            )}`}
                          >
                            {selectedDocument.status || "Draft"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Created
                          </p>
                          <p className="text-gray-900">
                            {new Date(
                              selectedDocument.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(selectedDocument)}
                      className="flex-1 flex justify-center items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleSubmit(selectedDocument._id)}
                      className="flex-1 flex justify-center items-center px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
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
                      Submit
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-2/3 p-2 bg-gray-100 flex flex-col overflow-hidden">
                {/* Document Preview */}
                <div className="flex-1 p-5 overflow-y-auto">
                  {selectedDocument.file ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                      <div className="text-center">
                        {selectedDocument.file.toLowerCase().endsWith('.pdf') ? (
                          <div className="w-full h-[600px]">
                            <iframe
                              src={`${API_URL}${selectedDocument.file}`}
                              className="w-full h-full border-0"
                              title="PDF Preview"
                              onError={(e) => {
                                console.error('Error loading PDF:', e);
                                toast.error('Error loading PDF preview. Please try downloading the file instead.');
                              }}
                            />
                          </div>
                        ) : (
                          <img
                            src={`${API_URL}${selectedDocument.file}`}
                            alt={selectedDocument.title}
                            className="max-w-full max-h-[600px] object-contain"
                            onError={(e) => {
                              console.error('Error loading image:', e);
                              toast.error('Error loading image preview');
                            }}
                          />
                        )}
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {selectedDocument.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          {selectedDocument.file.toLowerCase().endsWith('.pdf')
                            ? "PDF Document"
                            : "Image File"}
                        </p>
                        <div className="flex space-x-4 justify-center">
                          <a
                            href={`${API_URL}${selectedDocument.file}`}
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
                            href={`${API_URL}${selectedDocument.file}`}
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
  );
};

export default DraftDocument;
