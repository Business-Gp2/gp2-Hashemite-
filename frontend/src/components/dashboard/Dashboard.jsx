import React, { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  Routes,
  Route,
  useLocation,
  Outlet,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import universityLogo from "../../assets/Hashemite-University-removebg-preview.png";
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
  MessageCircle,
  ExternalLink,
  Home,
  FileEdit
} from "lucide-react";

const API_URL = "http://localhost:5000";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
      name: "Courses",
      path: "/dashboard/courses",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      name: "My Documents",
      path: "/dashboard/my-documents",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: "Upload Document",
      path: "/dashboard/upload-document",
      icon: <Upload className="w-5 h-5" />,
    },
    {
      name: "Draft Document",
      path: "/dashboard/draft-document",
      icon: <Edit className="w-5 h-5" />,
    },
    {
      name: "Messages",
      path: "/dashboard/messages",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    { 
      name: "Profile", 
      path: "/dashboard/profile", 
      icon: <User className="w-5 h-5" /> 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4">
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

        {/* User profile preview */}
        <div className="py-2 px-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-500 flex items-center justify-center">
              {user?.profilePic ? (
                <img
                  src={`${API_URL}/uploads/${user.profilePic}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {user?.firstName?.charAt(0) || "U"}
                </span>
              )}
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

        {/* Navigation */}
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div
                  className={`mr-3 ${
                    isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500"
                  }`}
                >
                  {item.icon}
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <Menu className="h-6 w-6" />
          </button>
          <img
            src={universityLogo}
            alt="University Logo"
            className="h-8 w-auto"
          />
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileSidebar}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={toggleMobileSidebar}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <img
                  src={universityLogo}
                  alt="University Logo"
                  className="h-8 w-auto"
                />
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      onClick={toggleMobileSidebar}
                    >
                      <div
                        className={`mr-4 ${
                          isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500"
                        }`}
                      >
                        {item.icon}
                      </div>
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <button
                onClick={handleLogout}
                className="flex-shrink-0 w-full group block"
              >
                <div className="flex items-center">
                  <div>
                    <LogOut className="inline-block h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                      Logout
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
