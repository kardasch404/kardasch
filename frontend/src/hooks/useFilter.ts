'use client';

import { useAppSelector } from '@/store/hooks/typed';
import type { Project } from '@/types';

export function useFilter(projects: Project[]) {
  const { selectedTech, searchQuery } = useAppSelector((state) => state.projects);

  return projects.filter((project) => {
    const matchesTech =
      selectedTech.length === 0 ||
      selectedTech.some((tech) => project.stack.includes(tech));

    const matchesSearch =
      searchQuery === '' ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTech && matchesSearch;
  });
}
