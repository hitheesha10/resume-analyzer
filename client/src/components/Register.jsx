import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    // Validation
    if (!name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }
    
    if (!email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Sending registration request...");
      const response = await register(name, email, password);
      console.log("Registration response:", response);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error response:", err.response);
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-card glass">
        <div className="auth-header">
          <div className="auth-icon">📝</div>
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join thousands of successful job seekers</p>
        </div>
        
        {error && <div className="error-text">{error}</div>}
        {success && <div className="success-text">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name *</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label>Email Address *</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label>Password *</label>
            <input
              type="password"
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>
        
        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;