import React, { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import universityLogo from "../../assets/Hashemite-University-removebg-preview.png";
import MyDocuments from "./MyDocuments";
import UploadDocument from "./UploadDocument";
import DraftDocument from "./DraftDocument";
import Courses from "./Courses";
import Messages from "./Messages";
import Profile from "./Profile";
import axios from "axios";
import Cookies from "js-cookie";

// Import Lucide icons for a more consistent look
import {
  LayoutDashboard,
  FileText,
  Upload,
  Edit,
  BookOpen,
  MessageSquare,
  User,
  LogOut,
  ChevronRight,
  Menu,
  X,
  CheckCircle,
  Clock,
  Settings,
  MessageCircle
} from "lucide-react";

const API_URL = "http://localhost:5000";

const Dashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [documentCounts, setDocumentCounts] = useState({
    total: 0,
    draft: 0,
    approved: 0,
    pending: 0
  });
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchDocumentCounts = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get(`${API_URL}/api/documents/counts`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setDocumentCounts(response.data.counts);
        }
      } catch (error) {
        console.error('Error fetching document counts:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchDocumentCounts();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "My Documents",
      path: "/my-documents",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: "Upload Document",
      path: "/upload-document",
      icon: <Upload className="w-5 h-5" />,
    },
    {
      name: "Draft Document",
      path: "/draft-document",
      icon: <Edit className="w-5 h-5" />,
    },
    {
      name: "Courses",
      path: "/courses",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      name: "Messages",
      path: "/messages",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    { name: "Profile", path: "/profile", icon: <User className="w-5 h-5" /> },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo header */}
      <div className="p-4 flex flex-col items-center border-b border-gray-200">
        <div className="bg-white rounded-xl p-2 shadow-md mb-2 transition-transform hover:scale-105">
          <img
            src={universityLogo}
            alt="University Logo"
            className="w-24 h-auto"
          />
        </div>
        <h2 className="text-sm font-semibold text-gray-800 mt-1">
          Academic Portal
        </h2>
      </div>

      {/* User profile preview - more compact */}
      <div className="py-2 px-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.firstName?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-600 truncate">
              ID: {user?.userId || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation - no overflow */}
      <nav className="flex-1 px-2 py-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group ${
                location.pathname === item.path
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => {
                setActivePage(item.name.toLowerCase());
                if (isMobileSidebarOpen) {
                  setIsMobileSidebarOpen(false);
                }
              }}
            >
              <span className="flex items-center">
                <span
                  className={`mr-2 ${
                    location.pathname === item.path
                      ? "text-white"
                      : "text-gray-500 group-hover:text-gray-700"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.name}</span>
              </span>
              {location.pathname === item.path && (
                <ChevronRight className="w-4 h-4 text-white" />
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Logout button - moved to bottom */}
      <div className="p-3 mt-auto border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 text-white font-medium shadow-sm hover:shadow-md"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 bg-white text-gray-800 flex-col shadow-xl">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Toggle Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 bg-white rounded-lg text-gray-800 shadow-lg"
        >
          {isMobileSidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileSidebar}
        >
          <div
            className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col shadow-xl transition-transform duration-300 ease-in-out transform translate-x-0"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:pl-6 md:pr-8 md:py-6">
          <Routes>
            <Route
              path="/dashboard"
              element={
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
                      <Link to="/my-documents" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex flex-col items-center text-center">
                          <div className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <h3 className="mt-4 font-medium text-gray-900">My Documents</h3>
                        </div>
                      </Link>

                      {/* Upload Document */}
                      <Link to="/upload-document" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex flex-col items-center text-center">
                          <div className="p-3 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                            <Upload className="w-6 h-6 text-green-600" />
                          </div>
                          <h3 className="mt-4 font-medium text-gray-900">Upload Document</h3>
                        </div>
                      </Link>

                      {/* Draft Documents */}
                      <Link to="/draft-document" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex flex-col items-center text-center">
                          <div className="p-3 bg-purple-50 rounded-full group-hover:bg-purple-100 transition-colors">
                            <Edit className="w-6 h-6 text-purple-600" />
                          </div>
                          <h3 className="mt-4 font-medium text-gray-900">Draft Documents</h3>
                        </div>
                      </Link>

                      {/* Courses */}
                      <Link to="/courses" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex flex-col items-center text-center">
                          <div className="p-3 bg-yellow-50 rounded-full group-hover:bg-yellow-100 transition-colors">
                            <BookOpen className="w-6 h-6 text-yellow-600" />
                          </div>
                          <h3 className="mt-4 font-medium text-gray-900">Courses</h3>
                        </div>
                      </Link>

                      {/* Feedback */}
                      <Link to="/messages" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex flex-col items-center text-center">
                          <div className="p-3 bg-pink-50 rounded-full group-hover:bg-pink-100 transition-colors">
                            <MessageCircle className="w-6 h-6 text-pink-600" />
                          </div>
                          <h3 className="mt-4 font-medium text-gray-900">Feedback</h3>
                        </div>
                      </Link>

                      {/* Settings */}
                      <Link to="/profile" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
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
                            <button className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Document
                            </button>
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
                            <button className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Document
                            </button>
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
                            <button className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Document
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
            <Route path="/my-documents" element={<MyDocuments />} />
            <Route path="/upload-document" element={<UploadDocument />} />
            <Route path="/draft-document" element={<DraftDocument />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
