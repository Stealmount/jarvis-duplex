'use client';
import { useState, useEffect, useCallback } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');
  const [transitioning, setTransitioning] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('jarvis_theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = useCallback(() => {
    setTransitioning(true);
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('jarvis_theme', next);
    setTimeout(() => setTransitioning(false), 400);
  }, [theme]);

  return (
    <button
      className={`theme-toggle ${transitioning ? 'transitioning' : ''}`}
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      id="theme-toggle"
      aria-label="Toggle theme"
    >
      <span className="theme-icon">
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
    </button>
  );
}
