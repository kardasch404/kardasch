import { z } from 'zod';
import { existsSync } from 'fs';
import { join } from 'path';
import { getData } from '@/lib/getData';
import { bioSchema } from '@/schemas/bio.schema';
import { projectsArraySchema } from '@/schemas/project.schema';
import { generalSchema, formatArchiveDate } from '@/schemas/general.schema';
import { DetectiveRoom } from '@/components/board/DetectiveRoom';

const experienceSchema = z.array(
  z.object({
    id: z.string(),
    company: z.string(),
    location: z.string(),
    role: z.string(),
    type: z.string(),
    startDate: z.string(),
    endDate: z.string().nullable(),
    current: z.boolean(),
    bullets: z.array(z.string()),
    stack: z.array(z.string()),
  })
);

const educationSchema = z.array(
  z.object({
    id: z.string(),
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    location: z.string(),
    startDate: z.string(),
    endDate: z.string().nullable(),
    current: z.boolean(),
    description: z.string(),
  })
);

const certificationsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    issuer: z.string(),
    year: z.number(),
    date: z.string(),
    credentialUrl: z.string().nullable(),
    description: z.string(),
    tags: z.array(z.string()),
    inProgress: z.boolean().optional(),
  })
);

export default function HomePage() {
  const bio = getData('bio.json', bioSchema);
  const projects = getData('projects.json', projectsArraySchema);
  const experience = getData('experience.json', experienceSchema);
  const education = getData('education.json', educationSchema);
  const certifications = getData('certifications.json', certificationsSchema);
  const general = getData('general.json', generalSchema);
  const events = [...general.presentations, ...general.events].map(entry => ({
    id: entry.id, title: entry.title, description: entry.description,
    recordType: entry.recordType, date: formatArchiveDate(entry.date),
    venue: entry.organizers.join(' / ') || null,
    city: general.locations.find(location => location.id === entry.locationId)?.label ?? null,
    locationId: entry.locationId, outline: entry.outline, topics: entry.topics,
    team: entry.team, links: entry.links, videos: entry.media.videos, projectId: entry.projectId,
    photos: entry.media.images.filter(photo => !photo.src.startsWith('/') || existsSync(join(process.cwd(), 'public', photo.src.slice(1)))).map(photo => ({ url: photo.src, alt: photo.alt, caption: photo.caption })),
  }));

  return (
    <DetectiveRoom
      general={general}
      bio={bio}
      projects={projects}
      experience={experience}
      education={education}
      certifications={certifications}
      events={events}
    />
  );
}
