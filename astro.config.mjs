// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://raditiphone1612-hash.github.io',
  base: '/nusantara-archival',
  devToolbar: {
    enabled: false
  },
  prefetch: true,
  vite: {
    plugins: [tailwindcss()]
  }
});