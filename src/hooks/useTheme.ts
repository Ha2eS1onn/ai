import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '@/types';

export function useTheme(settings: Settings) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      const root = window.document.documentElement;
      
      if (settings.theme === 'dark') {
        root.classList.add('dark');
        setIsDark(true);
      } else if (settings.theme === 'light') {
        root.classList.remove('dark');
        setIsDark(false);
      } else {
        // System preference
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemDark) {
          root.classList.add('dark');
          setIsDark(true);
        } else {
          root.classList.remove('dark');
          setIsDark(false);
        }
      }
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (settings.theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  const toggleTheme = useCallback(() => {
    const newTheme = isDark ? 'light' : 'dark';
    const root = window.document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
      setIsDark(true);
    } else {
      root.classList.remove('dark');
      setIsDark(false);
    }
    
    return newTheme;
  }, [isDark]);

  return { isDark, toggleTheme };
}
