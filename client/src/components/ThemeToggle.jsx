import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <motion.button 
      className="theme-toggle"
      onClick={toggleDarkMode}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {darkMode ? '☀️' : '🌙'}
    </motion.button>
  )
}

export default ThemeToggle