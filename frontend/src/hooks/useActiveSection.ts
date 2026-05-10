'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/store/hooks/typed';
import { setActiveSection } from '@/store/slices/uiSlice';

export function useActiveSection(sectionId: string) {
  const ref = useRef<HTMLElement>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          dispatch(setActiveSection(sectionId));
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [sectionId, dispatch]);

  return ref;
}
