import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/articles' }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string(),
    cover: z.string().url(),
    tags: z.array(z.string()).default([]),
    xUrl: z.string().url(),
    publishedAt: z.coerce.date(),
    nostrUrl: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles };
