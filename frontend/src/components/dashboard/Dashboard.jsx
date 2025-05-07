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
import { motion, AnimatePresence } from "framer-motion";

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
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);

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

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);
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

  const sidebarVariants = {
    expanded: {
      width: "16rem", // 64 in tailwind
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    collapsed: {
      width: "5rem", // 20 in tailwind
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

  const mainContentVariants = {
    expanded: {
      paddingLeft: "16rem", // 64 in tailwind
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    collapsed: {
      paddingLeft: "5rem", // 20 in tailwind
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const mobileSidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <motion.div 
        className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4 shadow-md overflow-hidden z-20"
        variants={sidebarVariants}
        initial="expanded"
        animate={isDesktopSidebarCollapsed ? "collapsed" : "expanded"}
      >
        {/* Toggle button */}
        <button 
          className="absolute top-4 right-4 z-50 bg-indigo-100 hover:bg-indigo-200 rounded-full p-1.5 transition-all duration-200"
          onClick={toggleDesktopSidebar}
        >
          {isDesktopSidebarCollapsed ? 
            <ChevronRight className="w-4 h-4 text-indigo-600" /> : 
            <X className="w-4 h-4 text-indigo-600" />
          }
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
              className={isDesktopSidebarCollapsed ? "w-12 h-auto" : "w-24 h-auto"}
            />
          </motion.div>
          <motion.h2 
            className="text-sm font-semibold text-gray-800 mt-1"
            variants={textVariants}
          >
            Academic Portal
          </motion.h2>
        </div>

        {/* User profile preview */}
        <div className="py-2 px-3 border-b border-gray-200">
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
                  {user?.firstName?.charAt(0) || "U"}
                </span>
              )}
            </motion.div>
            <motion.div 
              className="flex-1 min-w-0"
              variants={textVariants}
            >
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.firstName} {user?.lastName}
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
              <Link
                key={item.path}
                to={item.path}
              >
                <motion.div
                  className={`flex items-center px-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md"
                      : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                  whileHover={{ 
                    scale: 1.03,
                    x: isActive ? 0 : 5
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
                      transition: { duration: 0.5 }
                    }}
                  >
                    {item.icon}
                  </motion.div>
                  <motion.span 
                    variants={textVariants}
                    className={isDesktopSidebarCollapsed ? 'hidden' : 'block'}
                  >
                    {item.name}
                  </motion.span>
                  {isActive && !isDesktopSidebarCollapsed && (
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

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <motion.button
            onClick={handleLogout}
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

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <motion.button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-md text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            whileTap={{ scale: 0.9 }}
          >
            <Menu className="h-6 w-6" />
          </motion.button>
          <motion.img
            src={universityLogo}
            alt="University Logo"
            className="h-10 w-auto"
            whileHover={{ scale: 1.05 }}
          />
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
              onClick={toggleMobileSidebar}
            ></motion.div>
            <motion.div 
              className="fixed inset-y-0 left-0 flex flex-col max-w-xs w-full bg-white z-40 lg:hidden shadow-xl"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={mobileSidebarVariants}
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <motion.button
                  onClick={toggleMobileSidebar}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-6 w-6 text-white" />
                </motion.button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex flex-col items-center px-4">
                  <motion.div 
                    className="bg-white rounded-xl p-2 shadow-md mb-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <img
                      src={universityLogo}
                      alt="University Logo"
                      className="h-16 w-auto"
                    />
                  </motion.div>
                  <h2 className="text-sm font-semibold text-gray-800 mt-1">
                    Academic Portal
                  </h2>
                </div>
                
                {/* User profile in mobile */}
                <div className="py-3 px-4 border-b border-gray-200 mt-4">
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md"
                      whileHover={{ scale: 1.1 }}
                    >
                      {user?.profilePic ? (
                        <img
                          src={`${API_URL}/uploads/${user.profilePic}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {user?.firstName?.charAt(0) || "U"}
                        </span>
                      )}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        ID: {user?.userId || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <nav className="mt-5 px-3 space-y-2">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={toggleMobileSidebar}
                      >
                        <motion.div
                          className={`flex items-center px-3 py-2.5 text-base font-medium rounded-lg ${
                            isActive
                              ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md"
                              : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                          }`}
                          whileHover={{ 
                            scale: 1.02,
                            x: isActive ? 0 : 5
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <motion.div
                            className={`mr-4 ${
                              isActive ? "text-white" : "text-indigo-500"
                            }`}
                            whileHover={{ 
                              rotate: [0, -10, 10, -10, 0],
                              transition: { duration: 0.5 }
                            }}
                          >
                            {item.icon}
                          </motion.div>
                          {item.name}
                          {isActive && (
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
              </div>
              <div className="flex-shrink-0 p-4 border-t border-gray-200">
                <motion.button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white font-medium shadow-sm"
                  whileHover={{ 
                    scale: 1.03, 
                    boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.2), 0 4px 6px -2px rgba(239, 68, 68, 0.1)"
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="text-sm">Logout</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div 
        className="flex flex-col flex-1"
        variants={mainContentVariants}
        initial="expanded"
        animate={isDesktopSidebarCollapsed ? "collapsed" : "expanded"}
        transition={{ duration: 0.3 }}
      >
        <main className="flex-1 pt-16 lg:pt-0">
          <div className="py-6">
            <motion.div 
              className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </motion.div>
    </div>
  );
};

export default Dashboard;