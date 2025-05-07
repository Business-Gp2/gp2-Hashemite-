import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = Cookies.get("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!Cookies.get("token");
  });

  // Function to set auth token
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = Cookies.get("token");
      
      if (!token) {
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
        // If we have stored user data, use it
        const storedUser = Cookies.get("user");
        if (storedUser) {
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
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Add axios interceptor for handling token expiration
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const token = Cookies.get("token");
          if (token) {
            try {
              // Try to refresh the token
              const response = await axios.get("/api/auth/me", {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              
              if (response.data) {
                setUser(response.data);
                setIsAuthenticated(true);
                Cookies.set("user", JSON.stringify(response.data), {
                  expires: 30,
                  secure: process.env.NODE_ENV === "production",
                  sameSite: "lax",
                });
                return axios(error.config);
              }
            } catch (refreshError) {
              console.error("Token refresh failed:", refreshError);
              handleLogout();
            }
          } else {
            handleLogout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
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
          withCredentials: true,
        });
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      handleLogout();
    }
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
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
