// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: process.env['ASTRO_SITE_URL'] || 'https://claesen-verlichting.be',
  base: process.env['ASTRO_BASE_PATH'] || '/v1',
  build: {
    assets: 'assets_astro'
  },
  i18n: {
    defaultLocale: "nl",
    locales: ["nl", "en", "fr", "de"],
    routing: {
      prefixDefaultLocale: false
    }
  },
  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        '/api-proxy': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-proxy/, '')
        }
      }
    }
  }
});