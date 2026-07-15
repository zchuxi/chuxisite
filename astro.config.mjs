// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  // D-05: 先填 Vercel 生产域名占位；sitemap/canonical/OG 依赖 site，必须有有效值。
  // TODO(01-01 Task 5): 首次部署确定真实生产域名后回填并删除本注释。
  site: 'https://chuxi-wo.vercel.app',
  integrations: [mdx(), sitemap(), icon()],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // Bangumi 远程封面预铺路（本阶段种子未用图，P4）
    remotePatterns: [{ protocol: 'https', hostname: 'lain.bgm.tv' }],
  },
});
