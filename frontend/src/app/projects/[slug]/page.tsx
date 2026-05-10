import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getData } from '@/lib/getData';
import { projectsArraySchema } from '@/schemas/project.schema';

export async function generateStaticParams() {
  const projects = getData('projects.json', projectsArraySchema);
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default function ProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const projects = getData('projects.json', projectsArraySchema);
  const project = projects.find((p) => p.slug === params.slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="mt-8">
      <Link 
        href="/projects" 
        className="inline-block border-2 border-black bg-white px-4 py-2 font-TimesNewRoman font-bold hover:bg-gray-200"
      >
        ← BACK TO PROJECTS
      </Link>

      <div className="mt-8 border-4 border-black p-8">
        <h1 className="font-OldLondon text-7xl font-bold leading-tight">
          {project.title}
        </h1>
        
        <div className="mt-6 border-t-2 border-b-2 border-black py-4">
          <div className="flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="border-2 border-black bg-gray-200 px-3 py-1 font-TimesNewRoman text-sm font-bold"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 font-EditorialNew text-xl leading-relaxed">
          <p className="high">P</p>
          <p className="text-justify">
            {project.longDescription || project.description}
          </p>
        </div>

        <div className="mt-8 flex gap-4">
          {project.github && (
            <a 
              href={project.github} 
              target="_blank" 
              rel="noopener noreferrer"
              className="border-4 border-black bg-black px-6 py-3 font-TimesNewRoman text-lg font-bold text-white hover:bg-themeOrange hover:border-themeOrange"
            >
              VIEW ON GITHUB
            </a>
          )}
          {project.demo && (
            <a 
              href={project.demo} 
              target="_blank" 
              rel="noopener noreferrer"
              className="border-4 border-black bg-white px-6 py-3 font-TimesNewRoman text-lg font-bold text-black hover:bg-themeOrange hover:text-white hover:border-themeOrange"
            >
              LIVE DEMO
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
