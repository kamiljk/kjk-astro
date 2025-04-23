import { defineCollection, z } from 'astro:content';

export const collections = {
  posts: defineCollection({ schema: z.any() }),
};