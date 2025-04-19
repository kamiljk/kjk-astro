import { z, defineCollection } from 'astro:content';

export const collections = {
  posts: defineCollection({
    schema: z.object({
      title: z.string(),
      description: z.string(),
      dateCreated: z.coerce.date(),
      dateUpdated: z.optional(z.coerce.date()),
      type: z.string(),
    }).passthrough(),
  }),
};