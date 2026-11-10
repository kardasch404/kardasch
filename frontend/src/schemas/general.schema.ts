import { z } from 'zod';
import { bioSchema } from './bio.schema';
import { projectSchema } from './project.schema';

const source = z.string().refine(value => /^\/(?!\/)/.test(value) || /^https:\/\//.test(value), 'Use a local /path or an HTTPS URL');
export const mediaImageSchema = z.object({ id: z.string(), src: source, alt: z.string(), caption: z.string(), width: z.number().positive().optional(), height: z.number().positive().optional(), sourceFile: z.string().optional(), locationId: z.string().nullable().optional() });
const mediaSchema = z.object({ coverId: z.string().nullable(), images: z.array(mediaImageSchema), videos: z.array(z.object({ id: z.string(), src: source, title: z.string(), poster: source.optional() })) });
const dateSchema = z.union([z.string(), z.object({ year: z.number().int().nullable(), month: z.number().int().min(1).max(12), day: z.number().int().min(1).max(31) })]).nullable();
const linksSchema = z.object({ canva: source.nullable().optional(), slides: source.nullable().optional(), repository: source.nullable().optional(), post: source.nullable().optional(), other: z.array(z.object({ label: z.string(), url: source })).default([]) });
const entrySchema = z.object({ id: z.string(), title: z.string(), type: z.string(), recordType: z.enum(['presentations', 'events']), date: dateSchema, locationId: z.string().nullable(), description: z.string(), topics: z.array(z.string()).default([]), outline: z.array(z.string()).default([]), team: z.array(z.string()).default([]), projectId: z.string().optional(), organizers: z.array(z.string()).default([]), media: mediaSchema, links: linksSchema });
export const generalSchema = z.object({
  schemaVersion: z.string(), owner: bioSchema,
  board: z.object({ width: z.number(), height: z.number(), centerY: z.number(), photos: z.array(z.object({ id: z.string(), x: z.number(), y: z.number(), width: z.number(), angle: z.number() })) }),
  locations: z.array(z.object({
    id: z.string(),
    label: z.string(),
    countryCode: z.string(),
    type: z.enum(['city', 'country']),
    status: z.string().optional(),
    icon: z.string().optional(),
    current: z.boolean().optional(),
    tagline: z.string().optional(),
    institutions: z.array(z.object({
      name: z.string(),
      role: z.string().optional(),
      icon: z.string(),
      type: z.string().optional()
    })).optional(),
    coordinates: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) })
  })),
  presentations: z.array(entrySchema), events: z.array(entrySchema),
  projects: z.array(projectSchema.extend({ locationId: z.string().nullable(), eventId: z.string().optional(), media: mediaSchema })),
  education: z.array(z.object({ id: z.string(), institution: z.string(), degree: z.string(), field: z.string(), location: z.string(), locationId: z.string().nullable(), startDate: z.string(), endDate: z.string().nullable(), current: z.boolean(), description: z.string(), media: mediaSchema })),
  mediaLibrary: z.array(mediaImageSchema),
  map: z.object({ credit: z.object({ label: z.string(), url: source }), style: z.string(), visibleLocationIds: z.array(z.string()), moroccoLocationIds: z.array(z.string()), filters: z.array(z.enum(['all', 'education', 'presentations', 'events', 'projects', 'future-goals'])), viewport: z.object({ bounds: z.object({ west: z.number(), east: z.number(), north: z.number(), south: z.number() }).optional(), image: source, zoom: z.number(), startX: z.number(), startY: z.number(), columns: z.number(), rows: z.number() }), futureGoal: z.object({ originId: z.string().nullable(), destinationId: z.string(), label: z.string(), description: z.string(), marker: z.string(), connection: z.string(), visibleWithFilters: z.array(z.string()) }) }),
}).superRefine((data, ctx) => {
  const locations = new Set(data.locations.map(location => location.id));
  for (const entry of [...data.presentations, ...data.events, ...data.education, ...data.projects]) {
    if (entry.locationId && !locations.has(entry.locationId)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Unknown location for ${entry.id}` });
    if (entry.media.coverId && !entry.media.images.some(image => image.id === entry.media.coverId)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Missing cover image for ${entry.id}` });
  }
});
export type GeneralData = z.infer<typeof generalSchema>;
export type GeneralEntry = GeneralData['presentations'][number];
export function formatArchiveDate(date: GeneralEntry['date']) {
  if (!date) return null;
  if (typeof date === 'string') return date;
  const month = new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2000, date.month - 1, 1)));
  return `${month} ${date.day}${date.year ? `, ${date.year}` : ' (year not specified)'}`;
}
