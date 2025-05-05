import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Clock,
  MessageSquare,
  User,
  LogOut,
  ChevronRight,
} from "lucide-react";
import universityLogo from "../../assets/Hashemite-University-removebg-preview.png";

const API_URL = "http://localhost:5000";

const DoctorSidebar = ({ onLogout }) => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/doctor/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "All Documents",
      path: "/doctor/all-documents",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: "Pending Documents",
      path: "/doctor/pending-documents",
      icon: <Clock className="w-5 h-5" />,
    },
    {
      name: "Messages",
      path: "/doctor/messages",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      name: "Profile",
      path: "/doctor/profile",
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
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
          Doctor Portal
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
                {user?.firstName?.charAt(0) || "D"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">
              Dr. {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-600 truncate">
              ID: {user?.userId || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
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

      {/* Logout button */}
      <div className="p-3 mt-auto border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 text-white font-medium shadow-sm hover:shadow-md"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DoctorSidebar; 