import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (token && userData && userData !== "undefined" && userData !== "null") {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } else {
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
      // Clear corrupted data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  const register = async (name, email, password) => {
    try {
      const response = await api.post("/auth/register", { name, email, password });
      if (response.data.success) {
        toast.success("Account created! Please login.");
      }
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        toast.success(`Welcome back, ${user.name}!`);
      }
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.info("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};