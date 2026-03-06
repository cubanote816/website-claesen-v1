// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://claesen-verlichting.be',
  base: '/v1',
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