'use client'

import * as React from 'react';
import { useColorScheme } from 'react-native';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

export function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'theme' }: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<string>(defaultTheme);
  const colorScheme = useColorScheme();

  // Valeur de thème actuelle (fonctionne avec le contexte de thème de React Navigation)
  const value = React.useMemo(() => {
    const resolved = theme === 'system' ? (colorScheme || 'light') : theme;
    return {
      theme,
      setTheme,
      resolvedTheme: (resolved === 'light' || resolved === 'dark' ? resolved : 'light') as 'light' | 'dark',
    };
  }, [theme, colorScheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Création du contexte de thème
type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
  resolvedTheme: 'light' | 'dark';
};

export const ThemeContext = React.createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'light',
});

// Hook personnalisé pour utiliser le thème
export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
