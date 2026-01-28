import { useEffect, useState } from 'react';

const THEME_KEY = 'labgate-theme';

type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return (saved as Theme) || 'system';
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const applyTheme = (dark: boolean) => {
      // Remove both classes first
      document.body.classList.remove('dark', 'light');

      // Add the appropriate class
      if (theme === 'dark' || (theme === 'system' && dark)) {
        document.body.classList.add('dark');
      } else if (theme === 'light') {
        document.body.classList.add('light');
      }

      setIsDark(dark);
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  const toggleDarkMode = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return {
    theme,
    setTheme,
    isDark,
    toggleDarkMode,
  };
};
