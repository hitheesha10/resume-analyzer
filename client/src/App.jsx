import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Register from './components/Register'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Contact from './components/Contact'
import { AnimatePresence, motion } from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="loading-spinner" style={{ margin: '100px auto' }}></div>
  return isAuthenticated ? children : <Navigate to="/login" />
}

function AnimatedRoutes() {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={{ duration: 0.5 }}>
            <Home />
          </motion.div>
        } />
        <Route path="/register" element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={{ duration: 0.5 }}>
            <Register />
          </motion.div>
        } />
        <Route path="/login" element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={{ duration: 0.5 }}>
            <Login />
          </motion.div>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={{ duration: 0.5 }}>
              <Dashboard />
            </motion.div>
          </ProtectedRoute>
        } />
        <Route path="/contact" element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={{ duration: 0.5 }}>
            <Contact />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <AnimatedRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App