import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios interceptor for token
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    return () => {
      delete axios.defaults.headers.common["Authorization"];
    };
  }, []);

  useEffect(() => {
    const storedUser = Cookies.get("user");
    const storedToken = Cookies.get("token");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("Stored user and token found:", parsedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        // Clear invalid data
        Cookies.remove("user");
        Cookies.remove("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (userId, password) => {
    try {
      console.log("Attempting login with:", userId);
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          userId,
          password,
        }
      );
      const userData = response.data;
      console.log("Login successful, user data:", userData);

      // Store user data and token in cookies
      Cookies.set("token", userData.token, { expires: 30 }); // 30 days
      Cookies.set("user", JSON.stringify(userData), { expires: 30 });

      // Set the token in axios headers
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${userData.token}`;

      // Update state
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log("Attempting registration with:", userData);
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        userData
      );
      const newUser = response.data;
      console.log("Registration successful, user data:", newUser);

      // Store user data and token in cookies
      Cookies.set("token", newUser.token, { expires: 30 }); // 30 days
      Cookies.set("user", JSON.stringify(newUser), { expires: 30 });

      // Set the token in axios headers
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${newUser.token}`;

      // Update state
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  const logout = () => {
    // Clear cookies
    Cookies.remove("token");
    Cookies.remove("user");
    // Clear axios headers
    delete axios.defaults.headers.common["Authorization"];
    // Clear state
    setUser(null);
    console.log("User logged out");
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
