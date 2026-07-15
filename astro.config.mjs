// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  // D-05: Vercel 生产域名（首次部署回填）；sitemap/canonical/OG 依赖 site。
  site: 'https://chuxisite.vercel.app',
  integrations: [mdx(), sitemap(), icon()],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // Bangumi 远程封面预铺路（本阶段种子未用图，P4）
    remotePatterns: [{ protocol: 'https', hostname: 'lain.bgm.tv' }],
  },
});
