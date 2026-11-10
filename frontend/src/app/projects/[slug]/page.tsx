import { notFound } from 'next/navigation';
import { getData } from '@/lib/getData';
import { projectsArraySchema } from '@/schemas/project.schema';
import { ProjectCaseFileClient } from '@/components/board/ProjectCaseFileClient';
import '@/components/board/detective-room.css';

export async function generateStaticParams() {
  const projects = getData('projects.json', projectsArraySchema);
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projects = getData('projects.json', projectsArraySchema);
  const caseIndex = projects.findIndex((p) => p.slug === slug);

  if (caseIndex === -1) {
    notFound();
  }

  const project = projects[caseIndex];
  const caseId = `CASE-${String(caseIndex + 1).padStart(3, '0')}`;
  const prevProject = projects[(caseIndex - 1 + projects.length) % projects.length];
  const nextProject = projects[(caseIndex + 1) % projects.length];

  return (
    <ProjectCaseFileClient
      project={project}
      caseId={caseId}
      prevProject={prevProject}
      nextProject={nextProject}
    />
  );
}
