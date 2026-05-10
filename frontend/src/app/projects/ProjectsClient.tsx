'use client';

import Link from 'next/link';
import { useFilter } from '@/hooks/useFilter';
import { useAppDispatch, useAppSelector } from '@/store/hooks/typed';
import { setFilter, clearFilters } from '@/store/slices/projectsSlice';
import type { Project } from '@/types';

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const filteredProjects = useFilter(projects);
  const dispatch = useAppDispatch();
  const { selectedTech } = useAppSelector((state) => state.projects);

  const allTech = Array.from(new Set(projects.flatMap((p) => p.tech)));

  return (
    <div className="mt-8">
      <h1 className="font-OldLondon text-center text-8xl font-bold text-themeOrange">
        PROJECTS ARCHIVE
      </h1>

      <div className="mt-8 border-4 border-black p-4">
        <h2 className="font-Impact text-2xl font-bold uppercase mb-4">Filter by Technology</h2>
        <div className="flex flex-wrap gap-2">
          {allTech.map((tech) => (
            <button
              key={tech}
              onClick={() => dispatch(setFilter(tech))}
              className={`border-2 border-black px-4 py-2 font-TimesNewRoman font-bold transition-all ${
                selectedTech.includes(tech)
                  ? 'bg-themeOrange text-white'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {tech}
            </button>
          ))}
          {selectedTech.length > 0 && (
            <button
              onClick={() => dispatch(clearFilters())}
              className="border-2 border-black bg-black px-4 py-2 font-TimesNewRoman font-bold text-white hover:bg-gray-800"
            >
              CLEAR ALL
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Link key={project.id} href={`/projects/${project.slug}`}>
            <div className="border-4 border-black p-6 transition-all hover:bg-gray-100">
              <h3 className="font-Impact text-3xl font-bold uppercase mb-2">{project.title}</h3>
              <p className="font-EditorialNew text-base mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="border border-black bg-gray-200 px-2 py-1 font-TimesNewRoman text-xs font-bold"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="mt-8 border-4 border-black p-8 text-center">
          <p className="font-Impact text-2xl font-bold uppercase">
            NO PROJECTS FOUND
          </p>
          <p className="font-EditorialNew mt-2">
            Try adjusting your filters
          </p>
        </div>
      )}
    </div>
  );
}
