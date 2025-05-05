import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { Camera, User, Shield } from "lucide-react";

const API_URL = "http://localhost:5000";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user?.profilePic) {
      setPreviewUrl(`${API_URL}/uploads/${user.profilePic}`);
    }
  }, [user]);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG and GIF are allowed.');
      return;
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size too large. Maximum size is 2MB.');
      return;
    }

    setProfilePic(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const token = Cookies.get("token");
      const response = await axios.post(
        `${API_URL}/api/users/profile-pic`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        // Update the user state with the complete user object from the response
        updateUser(response.data.user);
        
        // Update the preview URL with the new image
        setPreviewUrl(`${API_URL}/uploads/${response.data.profilePic}`);
        
        toast.success("Profile picture updated successfully");
      } else {
        throw new Error(response.data.message || "Failed to update profile picture");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      // Reset preview to previous image
      setPreviewUrl(user?.profilePic ? `${API_URL}/uploads/${user.profilePic}` : "");
      
      if (error.response) {
        toast.error(error.response.data.message || "Failed to update profile picture");
      } else if (error.request) {
        toast.error("No response from server. Please try again.");
      } else {
        toast.error(error.message || "An error occurred while uploading the profile picture");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-500">
                        {user?.firstName?.charAt(0)}
                      </span>
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <label 
                  className={`absolute bottom-1 right-1 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100 transition-all duration-200 transform hover:scale-110 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Camera className="w-5 h-5 text-indigo-600" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-white mb-1">
                  {user?.firstName} {user?.lastName}
                </h1>
              </div>
            </div>
          </div>

          {/* User Information Sections */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ID Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <User className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-800">User ID</h2>
                </div>
                <div className="bg-white rounded-md p-4 shadow-sm">
                  <p className="text-gray-700 font-medium">{user?.userId}</p>
                </div>
              </div>

              {/* Role Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-800">User Role</h2>
                </div>
                <div className="bg-white rounded-md p-4 shadow-sm">
                  <p className="text-gray-700 font-medium capitalize">{user?.role}</p>
                </div>
              </div>

              {/* Course Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <h2 className="text-xl font-semibold text-gray-800">Courses</h2>
                </div>
                <div className="bg-white rounded-md p-4 shadow-sm">
                  {user?.courses && user.courses.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.courses.map((course, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No courses selected</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
