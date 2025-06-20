export const lightTheme = {
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  primary: '#2563eb',
  success: '#10b981',
  danger: '#dc2626',
  warning: '#f59e0b',
  border: '#e5e7eb',
  headerBackground: '#ffffff',
}

export const darkTheme = {
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  primary: '#3b82f6',
  success: '#34d399',
  danger: '#ef4444',
  warning: '#fbbf24',
  border: '#334155',
  headerBackground: '#1e293b',
}

export type Theme = typeof lightTheme

export const getTheme = (isDarkMode: boolean): Theme => {
  return isDarkMode ? darkTheme : lightTheme
}
