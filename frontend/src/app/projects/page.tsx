import Link from 'next/link';
import { getData } from '@/lib/getData';
import { projectsArraySchema } from '@/schemas/project.schema';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import ProjectsClient from './ProjectsClient';

export default function ProjectsPage() {
  const projects = getData('projects.json', projectsArraySchema);

  return <ProjectsClient projects={projects} />;
}
