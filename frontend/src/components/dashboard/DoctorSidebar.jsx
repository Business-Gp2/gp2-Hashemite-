import React, { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import universityLogo from "../../assets/Hashemite-University-removebg-preview.png";

const API_URL = "http://localhost:5000";

const DoctorSidebar = ({ onLogout }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const sidebarVariants = {
    expanded: {
      width: "16rem",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    collapsed: {
      width: "5rem",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const textVariants = {
    expanded: {
      opacity: 1,
      display: "block",
      transition: { delay: 0.1, duration: 0.2 },
    },
    collapsed: {
      opacity: 0,
      display: "none",
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4 shadow-md overflow-hidden z-20"
      variants={sidebarVariants}
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
    >
      {/* Toggle button */}
      <button
        className="absolute top-4 right-4 z-50 bg-indigo-100 hover:bg-indigo-200 rounded-full p-1.5 transition-all duration-200"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-indigo-600" />
        ) : (
          <X className="w-4 h-4 text-indigo-600" />
        )}
      </button>

      {/* Logo header */}
      <div className="p-4 flex flex-col items-center border-b border-gray-200">
        <motion.div
          className="bg-white rounded-xl p-2 shadow-md mb-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <img
            src={universityLogo}
            alt="University Logo"
            className={isCollapsed ? "w-12 h-auto" : "w-24 h-auto"}
          />
        </motion.div>
        <motion.h2
          className="text-sm font-semibold text-gray-800 mt-1"
          variants={textVariants}
        >
          Doctor Portal
        </motion.h2>
      </div>

      {/* User profile preview */}
      <div className="py-3 px-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <motion.div
            className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {user?.profilePic ? (
              <img
                src={`${API_URL}/uploads/${user.profilePic}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold">
                {user?.firstName?.charAt(0) || "D"}
              </span>
            )}
          </motion.div>
          <motion.div className="flex-1 min-w-0" variants={textVariants}>
            <p className="text-sm font-medium text-gray-800 truncate">
              Dr. {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-600 truncate">
              ID: {user?.userId || "N/A"}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-5 flex-1 px-2 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                className={`flex items-center px-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md"
                    : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
                whileHover={{
                  scale: 1.03,
                  x: isActive ? 0 : 5,
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  className={`mr-3 ${
                    isActive ? "text-white" : "text-indigo-500"
                  }`}
                  whileHover={{
                    rotate: [0, -10, 10, -10, 0],
                    transition: { duration: 0.5 },
                  }}
                >
                  {item.icon}
                </motion.div>
                <motion.span
                  variants={textVariants}
                  className={isCollapsed ? "hidden" : "block"}
                >
                  {item.name}
                </motion.span>
                {isActive && !isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="ml-auto"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-200">
        <motion.button
          onClick={onLogout}
          className="w-full flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white font-medium shadow-sm"
          whileHover={{
            scale: 1.03,
            boxShadow:
              "0 10px 15px -3px rgba(239, 68, 68, 0.2), 0 4px 6px -2px rgba(239, 68, 68, 0.1)",
          }}
          whileTap={{ scale: 0.97 }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          <motion.span className="text-sm" variants={textVariants}>
            Logout
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DoctorSidebar;
