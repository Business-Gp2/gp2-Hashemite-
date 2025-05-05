import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = Cookies.get('token');
      const storedUser = Cookies.get('user');

      if (token && storedUser) {
        try {
          // Set the token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Try to fetch fresh user data
          try {
            const response = await axios.get('http://localhost:5000/api/auth/me');
            setUser(response.data);
            setIsAuthenticated(true);
            // Update stored user data
            Cookies.set('user', JSON.stringify(response.data), { expires: 30 });
          } catch (error) {
            console.error('Error fetching user data:', error);
            // If fetch fails, use stored user data
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          // Clear invalid data
          Cookies.remove('token');
          Cookies.remove('user');
          delete axios.defaults.headers.common['Authorization'];
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (userId, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        userId,
        password
      });

      if (!response.data.token || !response.data.user) {
        throw new Error('Invalid response from server');
      }

      const { token, user } = response.data;
      
      // Store token and user data
      Cookies.set('token', token, { expires: 30 });
      Cookies.set('user', JSON.stringify(user), { expires: 30 });
      
      // Set axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      // Clear any existing auth data
      Cookies.remove('token');
      Cookies.remove('user');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = Cookies.get('token');
      await axios.post('http://localhost:5000/api/auth/logout', null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear all auth data
      Cookies.remove('token');
      Cookies.remove('user');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    // Update stored user data
    Cookies.set('user', JSON.stringify(newUserData), { expires: 30 });
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
