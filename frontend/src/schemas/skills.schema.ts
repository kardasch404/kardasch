import { z } from 'zod';

export const skillsSchema = z.object({
  categories: z.array(z.object({
    id: z.string(),
    label: z.string(),
    icon: z.string(),
    items: z.array(z.object({
      name: z.string(),
      level: z.enum(['beginner', 'intermediate', 'advanced']),
    })),
  })),
});

export type Skills = z.infer<typeof skillsSchema>;
