import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

export function getData<T>(fileName: string, schema: z.ZodSchema<T>): T {
  const filePath = join(process.cwd(), 'src', 'data', fileName);
  const fileContent = readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(fileContent);
  return schema.parse(parsed);
}
