import { defineCollection, z } from 'astro:content';

const dateField = z.preprocess(
  (val) => (val instanceof Date ? val : typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined),
  z.date()
);

console.log('[config.ts] Defining posts collection');

export const collections = {
  posts: defineCollection({
    schema: z.object({
      title: z.string(),
      description: z.string(),
      dateCreated: dateField,
      type: z.string().optional(),
      dateUpdated: dateField.optional(),
      slug: z.string().optional(),
      show: z.boolean().default(false),
      priority: z.string().optional(),
    }),
    async getEntry(filePath) {
      console.log('[config.ts] Processing file:', filePath);
      return filePath;
    }
  })
};