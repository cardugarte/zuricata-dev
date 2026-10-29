// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { rehypeLazyImages } from './src/lib/rehypeLazyImages.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://zuricata.dev',
  output: 'static',
  redirects: {
    '/blog': {
      status: 301,
      destination: '/articles',
    },
    '/blog/hello-world': {
      status: 301,
      destination: '/articles',
    },
  },
  integrations: [
    react(),
    mdx(),
    sitemap({
      customPages: [
        'https://zuricata.dev/talks/campamento-de-agentes/',
        'https://zuricata.dev/talks/punatech-2026/',
        'https://zuricata.dev/talks/agents-at-work/',
        'https://zuricata.dev/talks/guerra-silenciosa-ia/',
      ],
    }),
  ],
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'vitesse-black',
    },
    rehypePlugins: [rehypeLazyImages],
  },
});