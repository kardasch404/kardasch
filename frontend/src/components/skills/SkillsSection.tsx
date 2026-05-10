'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks/typed';
import { setFilter } from '@/store/slices/projectsSlice';
import { useInView } from '@/hooks/advanced/useInView';

interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface SkillCategory {
  id: string;
  label: string;
  icon: string;
  items: Skill[];
}

interface SkillsSectionProps {
  categories: SkillCategory[];
  languages: Array<{ name: string; level: string; code: string }>;
}

const levelDots = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const flagEmojis: Record<string, string> = {
  ar: '🇲🇦',
  fr: '🇫🇷',
  en: '🇬🇧',
  de: '🇩🇪',
};

export function SkillsSection({ categories, languages }: SkillsSectionProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id);
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSkillClick = (skillName: string) => {
    dispatch(setFilter(skillName));
    router.push('/#projects');
  };

  return (
    <section id="skills" ref={ref as any} className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Skills & Technologies
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Click any skill to see related projects
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {category.label} ({category.items.length})
                {activeCategory === category.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Skills Grid */}
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12"
          >
            {categories
              .find((c) => c.id === activeCategory)
              ?.items.map((skill, index) => (
                <motion.button
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, type: 'spring' }}
                  onClick={() => handleSkillClick(skill.name)}
                  className="group bg-gray-50 dark:bg-gray-900 rounded-lg p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:shadow-lg cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {skill.name}
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((dot) => (
                        <div
                          key={dot}
                          className={`w-2 h-2 rounded-full ${
                            dot <= levelDots[skill.level]
                              ? 'bg-blue-600 dark:bg-blue-400'
                              : 'bg-gray-300 dark:bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-left capitalize">
                    {skill.level}
                  </p>
                </motion.button>
              ))}
          </motion.div>

          {/* Spoken Languages */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Languages
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {languages.map((lang, index) => (
                <motion.div
                  key={lang.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{flagEmojis[lang.code] || '🌐'}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {lang.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {lang.level}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all"
                      style={{
                        width: lang.level.includes('Native')
                          ? '100%'
                          : lang.level.includes('C1')
                          ? '90%'
                          : lang.level.includes('B2')
                          ? '70%'
                          : '50%',
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
