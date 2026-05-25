import axios from "axios";

// Change this to your LIVE backend URL when deployed
// For development: http://localhost:5000
// For production: https://your-backend-url.onrender.com
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"||"";

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;