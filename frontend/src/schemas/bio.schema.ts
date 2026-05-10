import { z } from 'zod';

export const bioSchema = z.object({
  name: z.string(),
  title: z.string(),
  tagline: z.string(),
  location: z.object({
    city: z.string(),
    country: z.string(),
    openToRelocation: z.boolean(),
    relocationTarget: z.string(),
  }),
  contact: z.object({
    email: z.string().email(),
    phone: z.string(),
    linkedin: z.string().url(),
    github: z.string().url(),
    xing: z.string().url(),
  }),
  summary: z.string(),
  availableForWork: z.boolean(),
  languages: z.array(z.object({
    name: z.string(),
    level: z.string(),
    code: z.string(),
  })),
  interests: z.array(z.object({
    label: z.string(),
    detail: z.string().nullable(),
  })),
});

export type Bio = z.infer<typeof bioSchema>;
