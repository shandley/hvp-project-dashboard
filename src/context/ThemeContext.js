import React, { createContext, useState, useEffect } from 'react';

// Create the theme context
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check if user has previously selected a theme
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    // If a saved theme exists, use it
    if (savedTheme) {
      return savedTheme;
    }
    // Check if user's system prefers dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    // Default to light theme
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Apply theme to the document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme context
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};