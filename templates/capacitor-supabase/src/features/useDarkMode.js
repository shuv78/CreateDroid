import { useState, useEffect } from 'react';
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => { document.documentElement.classList.toggle('dark', isDark); localStorage.setItem('darkMode', isDark); }, [isDark]);
  const toggle = () => setIsDark(prev => !prev);
  const setDark = (v) => setIsDark(v);
  return { isDark, toggle, setDark };
}