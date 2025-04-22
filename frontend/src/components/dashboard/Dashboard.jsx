import React, { useState } from "react";
import {
  Link,
  useNavigate,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import universityLogo from "../../assets/Hashemite-University-removebg-preview.png"; // Adjust the path as necessary
import MyDocuments from "./MyDocuments";
import UploadDocument from "./UploadDocument";
import DraftDocument from "./DraftDocument";
import Courses from "./Courses";
import Messages from "./Messages";
import Profile from "./Profile";

const Dashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "My Documents", path: "/my-documents", icon: "📄" },
    { name: "Upload Document", path: "/upload-document", icon: "⬆️" },
    { name: "Draft Document", path: "/draft-document", icon: "📝" },
    { name: "Courses", path: "/courses", icon: "📚" },
    { name: "Messages", path: "/messages", icon: "💬" },
    { name: "Profile", path: "/profile", icon: "👤" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white">
        <div className="p-4 flex justify-center border-b border-slate-700">
          <div className="bg-white rounded-md p-2">
            <img
              src={universityLogo}
              alt="University Logo"
              className="w-32 h-auto"
            />
          </div>
        </div>
        <nav className="mt-6 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-3 py-3 my-1 rounded-md transition-colors ${
                location.pathname === item.path
                  ? "bg-slate-700 border-l-4 border-yellow-400"
                  : "hover:bg-slate-700/70"
              }`}
              onClick={() => setActivePage(item.name.toLowerCase())}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md transition-colors"
          >
            <span className="mr-2">🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route
            path="/dashboard"
            element={<div className="p-8">Welcome to Dashboard</div>}
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
  );
};

export default Dashboard;
