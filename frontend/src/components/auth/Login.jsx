import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthLayout from "./AuthLayout";
import { useAuth } from "../../context/AuthContext";
import universityLogo from "../../assets/Hashemite-University-removebg-preview.png";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const userData = await login(formData.userId, formData.password);

      if (userData) {
        toast.success("Login successful!");
        // Redirect based on user role
        if (userData.role === "doctor") {
          navigate("/doctor/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        throw new Error("Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || "Invalid credentials";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Left Side - Campus Image */}
      {/* Left side - Enhanced Design panel with background image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Background image with overlay and gradient */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://jornews.com/assets/2024-04-18/images/87003_1720219503.jpg')",
          }}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-800/20 to-pink-600/20"></div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center items-center h-full text-white relative z-10 px-12">
          <div className="p-8 bg-black/30 rounded-2xl backdrop-blur-md max-w-lg border border-white/10 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-white/20 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 50 50"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="
      M24.999 27.381
      c-5.406 0-9.999 1.572-12.999 4.036
      v4.583
      h26
      v-4.583
      c-3-2.464-7.594-4.036-13.001-4.036
      zm23.871-2.352
      l-23.934-11.029-23.924 11.029
      l3.988 1.825
      v2.807
      c-1 .207-1.003.731-1.003 1.354
      0 .368.122.799.354 1.057
      l-1.368 2.928
      h4.88
      l-1.356-2.93
      c.228-.258.415-.638.415-1.006
      0-.622-.922-1.197-.922-1.404
      v-2.337
      l5 2.246
      v-.199
      c3-2.609 8.271-4.265 13.998-4.265
      5.729 0 11.002 1.656 14.002 4.265
      v.199
      l9.87-4.54
    "
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-center mb-3 text-white drop-shadow-lg">
              Welcome Hashemite Students
            </h2>
            <p className="text-center text-white text-opacity-90 mb-8 text-lg">
              Step into a world of knowledge, innovation, and inspiration.
            </p>
            <div className="space-y-5">
              <div className="flex items-center bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <div className="p-2 bg-indigo-500 rounded-full mr-4 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="font-medium">
                  Explore diverse academic programs tailored for your growth
                </p>
              </div>
              <div className="flex items-center bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <div className="p-2 bg-indigo-500 rounded-full mr-4 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="font-medium">
                  Connect with leading professors and researchers in your field
                </p>
              </div>
              <div className="flex items-center bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <div className="p-2 bg-indigo-500 rounded-full mr-4 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="font-medium">
                  Access campus resources to support your academic and personal
                  success
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-10">
            <img
              src={universityLogo}
              alt="Hashemite University Logo"
              className="h-32 mb-6"
            />
            <h2 className="text-center text-3xl font-bold text-gray-800">
              Welcome Back
            </h2>
            <p className="text-gray-600 mt-2">Log in to access your account</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="group">
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  required
                  className="pl-10 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Enter your User ID"
                  value={formData.userId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="group">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="pl-10 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 hover:text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 hover:text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-gray-600"
                >
                  Remember me
                </label>
              </div>
              <a
                href="https://reg1.hu.edu.jo/password4get.aspx"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="text-indigo-600 hover:text-indigo-500 cursor-pointer">
                  Forgot password?
                </div>
              </a>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 font-medium flex justify-center items-center"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : null}
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>

          <div className="mt-12 text-center lg:hidden">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Hashemite University. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
