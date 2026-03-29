// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: process.env['ASTRO_SITE_URL'] || 'https://claesen-verlichting.be',
  base: process.env['ASTRO_BASE_PATH'] || '/v1',
  i18n: {
    defaultLocale: "nl",
    locales: ["nl", "en", "fr"],
    routing: {
      prefixDefaultLocale: false
    }
  },
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});