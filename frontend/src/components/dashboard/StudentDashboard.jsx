import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  FileText,
  Upload,
  Edit,
  BookOpen,
  MessageCircle,
  User,
  CheckCircle,
  Clock,
  ExternalLink,
  Users,
} from "lucide-react";

const API_URL = "http://localhost:5000";

const StudentDashboard = () => {
  const [documentCounts, setDocumentCounts] = useState({
    total: 0,
    draft: 0,
    approved: 0,
    pending: 0,
  });
  const [approvedDocuments, setApprovedDocuments] = useState([]);
  const [userCourses, setUserCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch document counts
        const countsResponse = await axios.get(
          `${API_URL}/api/documents/counts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (countsResponse.data.success) {
          setDocumentCounts(countsResponse.data.counts);
        }

        // Fetch approved documents
        const approvedResponse = await axios.get(
          `${API_URL}/api/documents/approved`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (approvedResponse.data.success) {
          setApprovedDocuments(approvedResponse.data.documents);
        }

        // Fetch user profile to get courses
        const userResponse = await axios.get(`${API_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.data.success && userResponse.data.user) {
          setUserCourses(userResponse.data.user.courses || []);
        } else {
          console.error(
            "Failed to fetch user courses:",
            userResponse.data.message
          );
          toast.error("Failed to fetch your courses");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          navigate("/login");
        } else {
          toast.error("Failed to fetch dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const courseDetails = {
    CS101: {
      name: "Introduction to Computer Science",
      description: "Fundamental concepts of computer science and programming",
      schedule: "Monday & Wednesday, 10:00 AM - 11:30 AM",
      instructor: "Dr. Ahmed Mohammed",
    },
    MATH201: {
      name: "Advanced Mathematics",
      description:
        "Advanced mathematical concepts and problem-solving techniques",
      schedule: "Tuesday & Thursday, 1:00 PM - 2:30 PM",
      instructor: "Dr. Sarah Johnson",
    },
    ENG105: {
      name: "English Composition",
      description: "Advanced writing and communication skills",
      schedule: "Monday & Wednesday, 2:00 PM - 3:30 PM",
      instructor: "Prof. Michael Brown",
    },
    "WEB ADVANCE": {
      name: "Advanced Web Development",
      description: "Modern web development techniques and frameworks",
      schedule: "Tuesday & Thursday, 10:00 AM - 11:30 AM",
      instructor: "Dr. Omar Hassan",
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Title */}
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* My Documents Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-700">
                My Documents
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {documentCounts.total}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Draft Documents Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-700">
                Draft Documents
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {documentCounts.draft}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Upload className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Approved Documents Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-700">Approved</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {documentCounts.approved}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Pending Documents Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-700">Pending</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {documentCounts.pending}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
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
          {/* My Documents */}
          <Link
            to="/dashboard/my-documents"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="mt-4 font-medium text-gray-900">My Documents</h3>
            </div>
          </Link>

          {/* Upload Document */}
          <Link
            to="/dashboard/upload-document"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="mt-4 font-medium text-gray-900">
                Upload Document
              </h3>
            </div>
          </Link>

          {/* Draft Documents */}
          <Link
            to="/dashboard/draft-document"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-purple-50 rounded-full group-hover:bg-purple-100 transition-colors">
                <Edit className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="mt-4 font-medium text-gray-900">
                Draft Documents
              </h3>
            </div>
          </Link>

          {/* Courses */}
          <Link
            to="/dashboard/courses"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-yellow-50 rounded-full group-hover:bg-yellow-100 transition-colors">
                <BookOpen className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="mt-4 font-medium text-gray-900">Courses</h3>
            </div>
          </Link>
        </div>
      </div>

      {/* Courses Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          My Courses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userCourses.length > 0 ? (
            userCourses.map((courseCode) => {
              const course = courseDetails[courseCode];
              return (
                <div
                  key={courseCode}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                        {courseCode}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {course.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{course.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-5 w-5 mr-2 text-indigo-500" />
                        <span>{course.schedule}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-5 w-5 mr-2 text-indigo-500" />
                        <span>{course.instructor}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <Link
                        to={`/dashboard/upload-document?course=${courseCode}`}
                        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 inline-flex items-center justify-center"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No courses enrolled
              </h3>
              <p className="mt-1 text-gray-500">
                You haven't enrolled in any courses yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
