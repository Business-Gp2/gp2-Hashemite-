import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  CheckCircle,
  Clock,
  FileText,
  ExternalLink,
  CalendarDays,
  Search,
  Bookmark,
  BookOpen,
  X,
} from "lucide-react";

const API_URL = "http://localhost:5000";

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/api/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Include rejected documents in the filtered list
      const filteredDocuments = response.data.documents.filter(
        (doc) =>
          doc.status === "approved" ||
          doc.status === "submitted" ||
          doc.status === "rejected"
      );

      setDocuments(filteredDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
      toast.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  // Filter documents based on filter and search
  const filteredDocuments = documents
    .filter((doc) => filter === "all" || doc.status === filter)
    .filter(
      (doc) =>
        searchQuery === "" ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.course.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading your documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
              <p className="text-gray-500 mt-1">
                View and manage your academic submissions
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Controls */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px space-x-8">
              <button
                onClick={() => setFilter("all")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === "all"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Documents
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === "approved"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilter("submitted")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === "submitted"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Pending Review
              </button>
              <button
                onClick={() => setFilter("rejected")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === "rejected"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Rejected
              </button>
            </nav>
          </div>
        </div>

        {/* Results summary */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            {filteredDocuments.length}{" "}
            {filteredDocuments.length === 1 ? "document" : "documents"} found
            {filter !== "all" && ` with status: ${filter}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Empty state */}
        {filteredDocuments.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-10 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No documents found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchQuery
                ? "No documents match your search criteria. Try adjusting your filters or search terms."
                : filter !== "all"
                ? `You don't have any ${filter} documents yet.`
                : "You don't have any documents yet. Once you submit documents, they'll appear here."}
            </p>
          </div>
        )}

        {/* Documents list */}
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc._id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="px-6 py-5">
                {/* Top row with status and date */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    {doc.status === "approved" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved
                      </span>
                    ) : doc.status === "rejected" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <X className="w-3 h-3 mr-1" />
                        Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        In Review
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    {new Date(doc.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>

                {/* Content area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 truncate">
                      {doc.title}
                    </h2>
                    <p className="mt-1 text-gray-600 line-clamp-2">
                      {doc.description}
                    </p>

                    <div className="mt-3 flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Bookmark className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span>{doc.type}</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span>{doc.course}</span>
                      </div>
                    </div>
                  </div>

                  {doc.file && (
                    <div className="mt-4 md:mt-0 md:ml-4">
                      {doc.file.toLowerCase().endsWith(".pdf") ? (
                        <a
                          href={`${API_URL}${doc.file}`}
                          download
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Download PDF
                        </a>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedDocument(doc);
                            setShowModal(true);
                          }}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View Image
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Document Preview */}
        <div className="flex-1 p-5 overflow-y-auto">
          {selectedDocument && selectedDocument.file ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedDocument.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {selectedDocument.file.toLowerCase().endsWith(".pdf")
                    ? "PDF Document"
                    : "Image File"}
                </p>
                <a
                  href={`${API_URL}${selectedDocument.file}`}
                  download
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download File
                </a>
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
              <p className="text-gray-600 mb-2">No document file available</p>
            </div>
          )}
        </div>
      </main>

      {/* Image Preview Modal */}
      {showModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 max-w-4xl h-5/6 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedDocument.title}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedDocument(null);
                }}
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
            <div className="flex-1 p-4 overflow-auto">
              <img
                src={`${API_URL}${selectedDocument.file}`}
                alt={selectedDocument.title}
                className="max-w-full max-h-full object-contain mx-auto"
                onError={(e) => {
                  console.error("Error loading image:", e);
                  toast.error("Failed to load image. Please try again.");
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDocuments;
