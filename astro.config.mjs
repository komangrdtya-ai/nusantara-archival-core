// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel'; // Robot Vercel
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Wajib 'server' karena kamu pakai prerender = false
  adapter: vercel(), // Menghubungkan langsung ke server Vercel
  trailingSlash: 'never',
  devToolbar: {
    enabled: false
  },
  prefetch: true,
  vite: {
    plugins: [tailwindcss()]
  }
});