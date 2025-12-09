import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
    loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
    schema: () =>
        z.object({
            title: z.string(),
            description: z.string(),
            pubDate: z.coerce.date(),
            category: z.enum(['ai notes', 'ai demos', 'react', 'misc']),
        }),
});

export const collections = { blog };
