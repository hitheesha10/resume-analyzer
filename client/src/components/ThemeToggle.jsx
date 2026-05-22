import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button className="theme-toggle" onClick={toggleDarkMode}>
      <span className="toggle-icon">{darkMode ? '☀️' : '🌙'}</span>
      <span className="toggle-text">{darkMode ? 'Light' : 'Dark'}</span>
    </button>
  );
};

export default ThemeToggle;