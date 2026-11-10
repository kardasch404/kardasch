import { z } from 'zod';

export const projectSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  tagline: z.string(),
  shortDescription: z.string().optional(),
  category: z.string().optional(),
  description: z.string(),
  type: z.string(),
  featured: z.boolean(),
  status: z.string(),
  github: z.string().url().nullable(),
  demo: z.string().url().nullable(),
  stack: z.array(z.string()),
  highlights: z.array(z.string()),
  problem: z.string().optional(),
  architecture: z.string().optional(),
  architectureNodes: z.array(z.string()).optional(),
  technicalDecisions: z.array(z.object({
    tech: z.string(),
    reason: z.string(),
  })).optional(),
  backendEngineering: z.array(z.string()).optional(),
  role: z.string().optional(),
  engineeringConcepts: z.array(z.string()).optional(),
  metrics: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional(),
  repositories: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    role: z.string().optional(),
    language: z.string().optional(),
    stars: z.number().optional(),
    updated: z.string().optional(),
    visibility: z.string().optional(),
    topics: z.array(z.string()).optional(),
  })).optional(),
});

export const projectsArraySchema = z.array(projectSchema);

export type Project = z.infer<typeof projectSchema>;
