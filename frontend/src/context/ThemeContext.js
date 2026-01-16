import React, { createContext, useState, useContext, useEffect } from 'react';

// Create Theme Context
const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  // Theme can be 'light', 'dark', or 'auto'
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'auto'; // Default to auto
  });

  // Get system preference
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Actual theme being applied (resolves 'auto' to system preference)
  const [appliedTheme, setAppliedTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'auto' || !savedTheme) {
      return getSystemTheme();
    }
    return savedTheme;
  });

  // Toggle between light, dark, and auto
  const toggleTheme = () => {
    setThemeMode((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'auto';
      return 'light';
    });
  };

  // Set specific theme modes
  const setLightTheme = () => setThemeMode('light');
  const setDarkTheme = () => setThemeMode('dark');
  const setAutoTheme = () => setThemeMode('auto');

  // Apply theme to document root
  useEffect(() => {
    const effectiveTheme = themeMode === 'auto' ? getSystemTheme() : themeMode;
    setAppliedTheme(effectiveTheme);

    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('theme', themeMode);
  }, [themeMode]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (themeMode === 'auto') {
        const newTheme = getSystemTheme();
        setAppliedTheme(newTheme);
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  const value = {
    theme: appliedTheme,        // The actual theme being displayed
    themeMode,                  // The mode: 'light', 'dark', or 'auto'
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setAutoTheme,
    isDark: appliedTheme === 'dark',
    isLight: appliedTheme === 'light',
    isAuto: themeMode === 'auto',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom Hook to use Theme Context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
