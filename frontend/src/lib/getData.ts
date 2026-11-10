import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

export function getData<S extends z.ZodTypeAny>(fileName: string, schema: S): z.output<S> {
  // Read projects.json directly from src/data/projects.json so all 10 case files and microservices are always loaded.
  const sections: Record<string, string> = { 'bio.json': 'owner', 'education.json': 'education', 'experience.json': 'experience', 'certifications.json': 'certifications', 'skills.json': 'skills' };
  if (sections[fileName]) {
    const general = JSON.parse(readFileSync(join(process.cwd(), 'src', 'data', 'general.json'), 'utf-8'));
    return schema.parse(general[sections[fileName]]);
  }
  const filePath = join(process.cwd(), 'src', 'data', fileName);
  const fileContent = readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(fileContent);
  return schema.parse(parsed);
}
