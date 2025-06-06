import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import DoctorLayout from "./DoctorLayout";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  BookOpen,
  MessageSquare,
  User,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDocuments: 0,
    pendingDocuments: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0,
    totalStudents: 0,
    totalCourses: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [documentsByCourse, setDocumentsByCourse] = useState({});
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`${API_URL}/api/doctor/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Doctor stats API response:", response.data);

        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        if (error.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = Cookies.get("token");
        const response = await axios.get(
          `${API_URL}/api/documents/doctor-courses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setDocuments(response.data.documents);
          setDocumentsByCourse(response.data.documentsByCourse);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch documents");
      }
    };

    fetchDocuments();
  }, []);

  // Calculate statistics from documents
  const calculatedStats = React.useMemo(() => {
    const totalDocuments = documents.length;
    const approvedDocuments = documents.filter(
      (doc) => doc.status === "approved"
    ).length;
    const pendingDocuments = documents.filter(
      (doc) => doc.status === "submitted"
    ).length;
    const rejectedDocuments = documents.filter(
      (doc) => doc.status === "rejected"
    ).length;
    return {
      totalDocuments,
      approvedDocuments,
      pendingDocuments,
      rejectedDocuments,
    };
  }, [documents]);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "submitted":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5" />;
      case "rejected":
        return <XCircle className="w-5 h-5" />;
      case "submitted":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
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
    // If the path already starts with http, return as is
    if (filePath.startsWith("http")) return filePath;
    // Otherwise, prepend the API_URL
    return `${API_URL}${filePath}`;
  };

  const handleViewPendingDocuments = async () => {
    try {
      setLoadingPending(true);
      const token = Cookies.get("token");
      const response = await axios.get(`${API_URL}/api/documents/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setPendingDocuments(response.data.documents);
        setShowPendingModal(true);
      }
    } catch (error) {
      console.error("Error fetching pending documents:", error);
      toast.error("Failed to fetch pending documents");
    } finally {
      setLoadingPending(false);
    }
  };

  const handleClosePendingModal = () => {
    setShowPendingModal(false);
    setPendingDocuments([]);
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-600">{error}</div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, Dr. {user?.firstName} {user?.lastName}
          </h1>
          <p className="mt-2 text-gray-600">
            Here's an overview of your academic activities and responsibilities.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Documents */}
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-700">
                  Total Documents
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {calculatedStats.totalDocuments}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Pending Documents */}
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-700">
                  Pending Review
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {calculatedStats.pendingDocuments}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Approved Documents */}
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-700">Approved</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {calculatedStats.approvedDocuments}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Rejected Documents */}
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-700">Rejected</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {calculatedStats.rejectedDocuments}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Review Documents */}
            <Link
              key="my-courses"
              to="/doctor/pending-documents"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="mt-4 font-medium text-gray-900">
                  Review Documents
                </h3>
              </div>
            </Link>

            {/* My Courses */}
            <Link
              key="my-courses"
              to="/doctor/profile"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="mt-4 font-medium text-gray-900">My Courses</h3>
              </div>
            </Link>

            {/* Students */}
            <Link
              key="students"
              to="/doctor/messages"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-purple-50 rounded-full group-hover:bg-purple-100 transition-colors">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="mt-4 font-medium text-gray-900">Messages</h3>
              </div>
            </Link>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Course Documents</h2>
          </div>

          {Object.keys(documentsByCourse).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No documents found for your courses
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(documentsByCourse).map(([course, courseDocs]) => (
                <div
                  key={course}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                >
                  <h3 className="text-xl font-semibold mb-4">{course}</h3>
                  <div className="grid gap-4">
                    {courseDocs.map((doc) => (
                      <div
                        key={doc._id}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold mb-2">
                              {doc.title}
                            </h4>
                            <p className="text-gray-600 mb-4">
                              {doc.description}
                            </p>
                          </div>
                          <div
                            className={`flex items-center ${getStatusColor(
                              doc.status
                            )}`}
                          >
                            {getStatusIcon(doc.status)}
                            <span className="ml-2 capitalize">
                              {doc.status}
                            </span>
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
                            <span>
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                          <button
                            onClick={() => handleViewDocument(doc)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            View Document
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Documents Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 mt-8">
          <h2 className="text-2xl font-semibold mb-4">All Documents</h2>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No documents found for your courses
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Title
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Course
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc._id}>
                      <td className="px-4 py-2">{doc.title}</td>
                      <td className="px-4 py-2">{doc.type}</td>
                      <td className="px-4 py-2">{doc.course}</td>
                      <td className="px-4 py-2 capitalize">{doc.status}</td>
                      <td className="px-4 py-2">
                        {doc.user?.firstName} {doc.user?.lastName}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
                            className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(
                              selectedDocument.status
                            )}`}
                          >
                            {selectedDocument.status}
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
    </DoctorLayout>
  );
};

export default DoctorDashboard;
