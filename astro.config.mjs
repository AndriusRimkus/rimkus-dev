// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
    site: 'https://rimkus.dev',

    integrations: [mdx(), sitemap(), vue()],

    markdown: {
        shikiConfig: {
            theme: 'dracula-soft',
        },
    },

    vite: {
        plugins: [tailwindcss()],
    },
});
