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
      width: "240px",
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    collapsed: {
      width: "80px",
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  const textVariants = {
    expanded: { 
      opacity: 1,
      display: "block",
      transition: { delay: 0.1, duration: 0.2 }
    },
    collapsed: { 
      opacity: 0,
      display: "none",
      transition: { duration: 0.2 }
    }
  };

  const logoVariants = {
    expanded: { scale: 1, transition: { duration: 0.3 } },
    collapsed: { scale: 0.8, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      className="h-full flex flex-col bg-white border-r border-gray-200 overflow-hidden shadow-md"
      variants={sidebarVariants}
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
    >
      {/* Toggle button */}
      <button 
        className="absolute top-4 right-4 z-50 bg-indigo-100 hover:bg-indigo-200 rounded-full p-1.5 transition-all duration-200"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? 
          <Menu className="w-4 h-4 text-indigo-600" /> : 
          <X className="w-4 h-4 text-indigo-600" />
        }
      </button>

      {/* Logo header */}
      <motion.div 
        className="p-4 flex flex-col items-center border-b border-gray-200"
        variants={logoVariants}
      >
        <motion.div 
          className="bg-white rounded-xl p-2 shadow-md mb-2 transition-all duration-300 hover:shadow-lg"
          whileHover={{ scale: 1.05 }}
        >
          <img
            src={universityLogo}
            alt="University Logo"
            className="w-24 h-auto"
          />
        </motion.div>
        <motion.h2 
          className="text-sm font-semibold text-gray-800 mt-1"
          variants={textVariants}
        >
          Doctor Portal
        </motion.h2>
      </motion.div>

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
          <motion.div 
            className="flex-1 min-w-0"
            variants={textVariants}
          >
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
      <nav className="flex-1 px-2 py-3 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
              >
                <motion.div
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md"
                      : "text-gray-700 hover:bg-indigo-50"
                  }`}
                  whileHover={{ 
                    scale: 1.03,
                    x: isActive ? 0 : 5
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <span className="flex items-center">
                    <motion.span
                      className={`${
                        isActive
                          ? "text-white"
                          : "text-indigo-500 group-hover:text-indigo-600"
                      }`}
                      whileHover={{ 
                        rotate: [0, -10, 10, -10, 0],
                        transition: { duration: 0.5 }
                      }}
                    >
                      {item.icon}
                    </motion.span>
                    <motion.span 
                      className={`font-medium text-sm ml-3 ${isCollapsed ? 'hidden' : 'block'}`}
                      variants={textVariants}
                    >
                      {item.name}
                    </motion.span>
                  </span>
                  {isActive && !isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout button */}
      <div className="p-3 mt-auto border-t border-gray-200">
        <motion.button
          onClick={onLogout}
          className="w-full flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white font-medium shadow-sm"
          whileHover={{ 
            scale: 1.03, 
            boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.2), 0 4px 6px -2px rgba(239, 68, 68, 0.1)"
          }}
          whileTap={{ scale: 0.97 }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          <motion.span 
            className="text-sm"
            variants={textVariants}
          >
            Logout
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DoctorSidebar;