import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar glass ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <div className="logo-icon pulse">🎯</div>
          <div className="logo-text">
            <span className="logo-main">ResumeScore</span>
            <span className="logo-sub">ATS Analyzer</span>
          </div>
        </Link>
        
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span>☰</span>
        </button>
        
        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
            <span>🏠</span> Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/resumes" className={`nav-link ${isActive('/resumes') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                <span>📄</span> My Resumes
              </Link>
              <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                <span>💬</span> Contact
              </Link>
              <div className="nav-user">
                <span className="user-emoji">👤</span>
                <span className="user-name">{user?.name?.split(' ')[0]}</span>
              </div>
              <button onClick={handleLogout} className="nav-logout">
                <span>🚪</span> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                <span>🔐</span> Login
              </Link>
              <Link to="/register" className={`nav-link ${isActive('/register') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                <span>✨</span> Register
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;