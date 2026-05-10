import { z } from 'zod';

export const projectSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  type: z.string(),
  featured: z.boolean(),
  status: z.string(),
  github: z.string().url().nullable(),
  demo: z.string().url().nullable(),
  stack: z.array(z.string()),
  highlights: z.array(z.string()),
});

export const projectsArraySchema = z.array(projectSchema);

export type Project = z.infer<typeof projectSchema>;
