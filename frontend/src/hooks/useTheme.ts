'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks/typed';
import { setTheme, toggleTheme } from '@/store/slices/uiSlice';

export function useTheme() {
  const theme = useAppSelector((state) => state.ui.theme);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggle = () => dispatch(toggleTheme());
  const set = (newTheme: 'light' | 'dark') => dispatch(setTheme(newTheme));

  return { theme, toggle, set };
}
