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

        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        if (error.response?.status === 401) {
          navigate("/login");
        }
        toast.error("Failed to fetch dashboard statistics");
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
                  {stats.totalDocuments}
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
                  {stats.pendingDocuments}
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
                  {stats.approvedDocuments}
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
                  {stats.rejectedDocuments}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Students */}
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-700">
                  Total Students
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalStudents}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Total Courses */}
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-700">
                  Total Courses
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalCourses}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Unread Messages */}
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-700">
                  Unread Messages
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.unreadMessages}
                </p>
              </div>
              <div className="p-3 bg-pink-100 rounded-full">
                <MessageSquare className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
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

                        <div className="flex justify-end">
                          <Link
                            to={`/documents/${doc._id}`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            View Document
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
