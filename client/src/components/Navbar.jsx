import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import './Navbar.css'

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    ...(isAuthenticated ? [{ path: '/dashboard', label: 'Dashboard', icon: '📊' }] : []),
    { path: '/contact', label: 'Contact', icon: '📧' }
  ]

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="logo">
          <motion.div 
            className="logo-icon"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            🎯
          </motion.div>
          <div className="logo-text">
            <span className="logo-main">Resume</span>
            <span className="logo-accent">Score</span>
          </div>
        </Link>

        <div className="nav-controls">
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            ☰
          </button>
        </div>

        <AnimatePresence>
          {(mobileOpen || window.innerWidth > 768) && (
            <motion.div 
              className={`nav-menu ${mobileOpen ? 'mobile' : ''}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="nav-icon">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="nav-link" onClick={() => setMobileOpen(false)}>
                    <span className="nav-icon">🔐</span> Login
                  </Link>
                  <Link to="/register" className="btn-primary-small" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  <div className="user-badge">
                    <span className="user-avatar">👤</span>
                    <span className="user-name">{user?.name?.split(' ')[0]}</span>
                  </div>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navbar;