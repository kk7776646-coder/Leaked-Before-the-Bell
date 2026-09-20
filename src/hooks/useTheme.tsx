import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEYS = ['leaklens_theme', 'btb_theme', 'theme'] as const;

function getSavedTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    for (const key of STORAGE_KEYS) {
      const saved = localStorage.getItem(key);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    }
  } catch {
    // localStorage might be inaccessible or disabled
  }
  // Default MUST be light
  return 'light';
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => getSavedTheme());

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    const initialMode = getSavedTheme();
    if (initialMode === 'dark') return 'dark';
    if (initialMode === 'light') return 'light';
    return getSystemTheme();
  });

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      const currentResolved: ResolvedTheme = theme === 'system' ? getSystemTheme() : theme;
      setResolvedTheme(currentResolved);

      if (currentResolved === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
    };

    applyTheme();

    try {
      STORAGE_KEYS.forEach(k => localStorage.setItem(k, theme));
    } catch {
      // Ignore storage errors
    }

    if (theme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleMediaChange = () => {
        applyTheme();
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleMediaChange);
        return () => mediaQuery.removeEventListener('change', handleMediaChange);
      } else if (mediaQuery.addListener) {
        // Compatibility for older browsers
        mediaQuery.addListener(handleMediaChange);
        return () => mediaQuery.removeListener(handleMediaChange);
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  const setTheme = (newTheme: ThemeMode) => {
    if (newTheme === 'light' || newTheme === 'dark' || newTheme === 'system') {
      setThemeState(newTheme);
    } else {
      setThemeState('light');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

