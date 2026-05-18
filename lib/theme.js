// Theme system — two complete themes: dark (Grok) + light (Abby.gg)

export const THEMES = {
  dark: 'dark',
  light: 'light',
};

export function getTheme() {
  if (typeof window === 'undefined') return 'dark';
  return localStorage.getItem('jarvis_theme') || 'dark';
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('jarvis_theme', theme);
}

export function initTheme() {
  const theme = getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  return theme;
}
