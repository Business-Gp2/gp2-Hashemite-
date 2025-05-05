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
  ExternalLink
} from "lucide-react";

const API_URL = "http://localhost:5000";

const StudentDashboard = () => {
  const [documentCounts, setDocumentCounts] = useState({
    total: 0,
    draft: 0,
    approved: 0,
    pending: 0
  });
  const [approvedDocuments, setApprovedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        // Fetch document counts
        const countsResponse = await axios.get(`${API_URL}/api/documents/counts`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (countsResponse.data.success) {
          setDocumentCounts(countsResponse.data.counts);
        }

        // Fetch approved documents
        const approvedResponse = await axios.get(`${API_URL}/api/documents/approved`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (approvedResponse.data.success) {
          setApprovedDocuments(approvedResponse.data.documents);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

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
              <h3 className="text-lg font-medium text-gray-700">My Documents</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{documentCounts.total}</p>
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
              <h3 className="text-lg font-medium text-gray-700">Draft Documents</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{documentCounts.draft}</p>
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
              <p className="text-3xl font-bold text-gray-900 mt-2">{documentCounts.approved}</p>
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
              <p className="text-3xl font-bold text-gray-900 mt-2">{documentCounts.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* My Documents */}
          <Link to="/dashboard/my-documents" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="mt-4 font-medium text-gray-900">My Documents</h3>
            </div>
          </Link>

          {/* Upload Document */}
          <Link to="/dashboard/upload-document" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="mt-4 font-medium text-gray-900">Upload Document</h3>
            </div>
          </Link>

          {/* Draft Documents */}
          <Link to="/dashboard/draft-document" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-purple-50 rounded-full group-hover:bg-purple-100 transition-colors">
                <Edit className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="mt-4 font-medium text-gray-900">Draft Documents</h3>
            </div>
          </Link>

          {/* Courses */}
          <Link to="/dashboard/courses" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-yellow-50 rounded-full group-hover:bg-yellow-100 transition-colors">
                <BookOpen className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="mt-4 font-medium text-gray-900">Courses</h3>
            </div>
          </Link>

          {/* Feedback */}
          <Link to="/dashboard/messages" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-pink-50 rounded-full group-hover:bg-pink-100 transition-colors">
                <MessageCircle className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="mt-4 font-medium text-gray-900">Feedback</h3>
            </div>
          </Link>

          {/* Settings */}
          <Link to="/dashboard/profile" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-gray-50 rounded-full group-hover:bg-gray-100 transition-colors">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="mt-4 font-medium text-gray-900">Profile</h3>
            </div>
          </Link>
        </div>
      </div>

      {/* Courses Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CS101 Course */}
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="text-blue-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">CS101</h3>
                <p className="text-base font-medium text-gray-800">Introduction to Computer Science</p>
                <p className="text-sm text-gray-600 mt-1">Instructor: Dr. Mohammad Hashemi</p>
                <p className="text-sm text-gray-600">Schedule: Sunday, Tuesday 10:00-11:30</p>
                <p className="text-sm text-gray-600 mt-2">This course introduces the fundamental concepts of computer science.</p>
                <Link to="/dashboard/upload-document" className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Link>
              </div>
            </div>
          </div>

          {/* MATH201 Course */}
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="text-blue-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">MATH201</h3>
                <p className="text-base font-medium text-gray-800">Calculus II</p>
                <p className="text-sm text-gray-600 mt-1">Instructor: Dr. Layla Al-Razi</p>
                <p className="text-sm text-gray-600">Schedule: Monday, Wednesday 9:00-10:30</p>
                <p className="text-sm text-gray-600 mt-2">Advanced calculus topics including integration techniques and series.</p>
                <Link to="/dashboard/upload-document" className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Link>
              </div>
            </div>
          </div>

          {/* ENG105 Course */}
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="text-blue-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">ENG105</h3>
                <p className="text-base font-medium text-gray-800">Academic English</p>
                <p className="text-sm text-gray-600 mt-1">Instructor: Dr. Omar Khatib</p>
                <p className="text-sm text-gray-600">Schedule: Tuesday, Thursday 13:00-14:30</p>
                <p className="text-sm text-gray-600 mt-2">Developing academic writing and communication skills for university students.</p>
                <Link to="/dashboard/upload-document" className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
