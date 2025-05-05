import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to set auth token
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = Cookies.get("token");
        const storedUser = Cookies.get("user");

        if (!token || !storedUser) {
          setLoading(false);
          return;
        }

        // Set the token in axios headers
        setAuthToken(token);

        try {
          // Try to fetch fresh user data
          const response = await axios.get("/api/auth/me");
          if (response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
            // Update stored user data
            Cookies.set("user", JSON.stringify(response.data), {
              expires: 30,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // If the error is not a 401/403, try to use stored data
          if (
            error.response?.status !== 401 &&
            error.response?.status !== 403
          ) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
              setIsAuthenticated(true);
            } catch (parseError) {
              console.error("Error parsing stored user data:", parseError);
              handleLogout();
            }
          } else {
            handleLogout();
          }
        }
      } catch (error) {
        console.error("Error in initializeAuth:", error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = async (userId, password) => {
    try {
      const response = await axios.post("/api/auth/login", {
        userId,
        password,
      });

      if (!response.data.token || !response.data.user) {
        throw new Error("Invalid response from server");
      }

      const { token, user } = response.data;

      // Store token and user data with secure options
      Cookies.set("token", token, {
        expires: 30,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      Cookies.set("user", JSON.stringify(user), {
        expires: 30,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      // Set axios headers
      setAuthToken(token);

      // Update state
      setUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      console.error("Login error:", error);
      handleLogout();
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = Cookies.get("token");
      if (token) {
        await axios.post("/api/auth/logout", null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true, // Enable sending cookies
        });
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Always clean up local state and cookies, even if the server request fails
      handleLogout();
    }
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    // Update stored user data with secure options
    Cookies.set("user", JSON.stringify(newUserData), {
      expires: 30,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
