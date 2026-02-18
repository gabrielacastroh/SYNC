import { useEffect } from 'react';
import { useUIStore } from '@/store/ui';

export function useThemeSync(): void {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    const resolved =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
  }, [theme]);
}
