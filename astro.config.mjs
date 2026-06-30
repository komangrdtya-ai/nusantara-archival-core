// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://komangrdtya-ai.github.io',
  base: '/nusantara-archival-core',
  devToolbar: {
    enabled: false
  },
  prefetch: true,
  vite: {
    plugins: [tailwindcss()]
  }
});