import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTheme } from '../types';

interface ThemeContextType {
  theme: AppTheme;
  isParchment: boolean;
  toggleTheme: () => void;
  setTheme: (theme: AppTheme) => void;
}

const THEME_STORAGE_KEY = 'ragnarok_theme_mode';

const ThemeContext = createContext<ThemeContextType>({
  theme: 'classic',
  isParchment: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'parchment' || saved === 'classic') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'classic';
  });

  const isParchment = theme === 'parchment';

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'parchment' ? 'classic' : 'parchment');
  };

  return (
    <ThemeContext.Provider value={{ theme, isParchment, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
