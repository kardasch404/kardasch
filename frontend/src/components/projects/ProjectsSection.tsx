'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store/hooks/typed';
import { setFilter, clearFilters, setSearchQuery } from '@/store/slices/projectsSlice';
import { useInView } from '@/hooks/advanced/useInView';
import type { Project } from '@/types';
import Link from 'next/link';

interface ProjectsSectionProps {
  projects: Project[];
}

const projectTypeColors: Record<string, string> = {
  saas: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  security: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'ai-cv': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  backend: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  fullstack: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
};

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const dispatch = useAppDispatch();
  const { selectedTech, searchQuery } = useAppSelector((state) => state.projects);
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const [searchInput, setSearchInput] = useState('');

  const allTech = Array.from(new Set(projects.flatMap((p) => p.stack)));

  const filteredProjects = projects.filter((project) => {
    const matchesTech = selectedTech.length === 0 || selectedTech.some((tech) => project.stack.includes(tech));
    const matchesSearch = searchQuery === '' || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.stack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTech && matchesSearch;
  });

  const featuredProjects = filteredProjects.filter(p => p.featured);
  const regularProjects = filteredProjects.filter(p => !p.featured);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    const timeout = setTimeout(() => {
      dispatch(setSearchQuery(value));
    }, 300);
    return () => clearTimeout(timeout);
  };

  return (
    <section id="projects" ref={ref as any} className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Projects
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Building production-grade systems with modern tech stacks
          </p>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search projects by name or technology..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tech Filter Chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {allTech.map((tech) => (
              <button
                key={tech}
                onClick={() => dispatch(setFilter(tech))}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTech.includes(tech)
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tech}
              </button>
            ))}
            {selectedTech.length > 0 && (
              <button
                onClick={() => dispatch(clearFilters())}
                className="px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Results Counter */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Results: {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </p>

          {/* Featured Projects - Large Cards */}
          {featuredProjects.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <AnimatePresence mode="popLayout">
                {featuredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.08 }}
                    className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all overflow-hidden"
                  >
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${projectTypeColors[project.type] || 'bg-gray-100 text-gray-700'}`}>
                        {project.type.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 pr-24">
                      {project.name}
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">
                      {project.tagline}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {project.description}
                    </p>

                    {/* Highlights */}
                    <ul className="space-y-1 mb-4">
                      {project.highlights.slice(0, 3).map((highlight, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.stack.slice(0, 6).map((tech) => (
                        <span
                          key={tech}
                          onClick={() => dispatch(setFilter(tech))}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Links - Reveal on Hover */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                          GitHub
                        </a>
                      )}
                      {project.demo && (
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          Live Demo
                        </a>
                      )}
                      <Link
                        href={`/projects/${project.slug}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Regular Projects - Compact Grid */}
          {regularProjects.length > 0 && (
            <div className="grid md:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {regularProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: (featuredProjects.length + index) * 0.08 }}
                    className="group bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        {project.name}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${projectTypeColors[project.type] || 'bg-gray-100 text-gray-700'}`}>
                        {project.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {project.stack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your filters or search query
              </p>
              <button
                onClick={() => {
                  dispatch(clearFilters());
                  dispatch(setSearchQuery(''));
                  setSearchInput('');
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
