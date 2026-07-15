---
phase: 01-foundation-shell
plan: 01
subsystem: infra
tags: [astro, tailwind-v4, mdx, content-collections, zod, sitemap, astro-icon, theme, fouc, vercel]

# Dependency graph
requires: []
provides:
  - Astro 7 静态站脚手架（output:static，免适配器）+ Tailwind v4（@tailwindcss/vite, CSS-first @theme）+ MDX + sitemap + astro-icon
  - tools/anime 两集合分层 Zod schema（唯一数据契约，content.config.ts）+ lib 薄数据层（getAllTools/getAllAnime 收口读取）
  - 防 FOUC 主题系统（<head> is:inline 阻塞脚本 + ThemeToggle + localStorage 记忆）
  - 已部署的 Vercel 生产站（https://chuxisite.vercel.app）+ 内容管道（改 .mdx → git push → 构建校验 → CDN 上线）
affects: [01-02, 01-03, 工具库-phase2, 追番-phase3]

# Tech tracking
tech-stack:
  added: [astro@7, "@tailwindcss/vite@4", "@astrojs/mdx", "@astrojs/sitemap", astro-icon, "@iconify-json/ph", "@fontsource-variable/fredoka", "@fontsource/zcool-kuaile", "@astrojs/check", typescript]
  patterns: ["页面经 lib/*.ts 读取数据（不直接 getCollection）", "番剧 schema 分层（客观元数据组 + 追番状态组，bgmId 预留）", "class 策略暗色 + :where(.dark) 重定义 @theme 变量", "<head> is:inline 同步脚本防 FOUC"]

key-files:
  created:
    - astro.config.mjs
    - src/content.config.ts
    - src/lib/tools.ts
    - src/lib/anime.ts
    - src/content/tools/raycast.mdx
    - src/content/anime/frieren.mdx
    - src/styles/global.css
    - src/layouts/BaseLayout.astro
    - src/components/ThemeToggle.astro
    - src/pages/index.astro
    - .gitattributes
  modified:
    - .gitignore

key-decisions:
  - "z import 用 astro/zod（Astro 7 已弃用 astro:content 的 z 再导出）"
  - "本地分支 master → main，对齐 GitHub 默认分支与 Vercel 生产分支"
  - "site 首次部署即回填真实域名 chuxisite.vercel.app（比先推占位再重建少一次 Vercel 构建）"
  - "本阶段零有状态依赖：不装 preact/nanostores/pagefind/@astrojs/vercel（P8）"

patterns-established:
  - "数据读取收口 lib/*.ts：页面调用 getAllTools()/getAllAnime()，不直接 getCollection（保番剧换源可插拔）"
  - "番剧 schema 分层：元数据组用 .optional()（bgmId 预留），状态组用 .default()（P1）"
  - "暗色主题走 class 策略 + @custom-variant dark，:where(.dark) 作用域重定义 --color-*，不写第二套 @theme"
  - "防 FOUC：BaseLayout head 首元素 is:inline 同步脚本，绘制前读 localStorage.theme 定 .dark"

requirements-completed: [INFRA-01, INFRA-02, INFRA-04]

# Metrics
duration: ~51min (含人工部署 checkpoint 等待)
completed: 2026-07-15
---

# Phase 01 Plan 01: Walking Skeleton Summary

**Astro 7 + Tailwind v4 静态站脚手架，tools/anime 两集合分层 Zod 数据契约 + lib 薄数据层，防 FOUC 主题系统与最小首页，已部署 Vercel 生产站并打通「改文件 → git push → 构建校验 → CDN 上线」全链路**

## Performance

- **Duration:** ~51 min（含 Task 4/5 人工部署 checkpoint 等待）
- **Started:** 2026-07-15T13:09:53+08:00
- **Completed:** 2026-07-15T14:00:51+08:00
- **Tasks:** 5（Task 1-3 自动，Task 4 人工部署，Task 5 回填 + 人工验证）
- **Files created/modified:** 11+

## Accomplishments
- 就地脚手架 Astro 7（output:static）+ Tailwind v4（@tailwindcss/vite）+ MDX + sitemap + astro-icon + 字体，`npm run build` 与 `npx astro check` 双绿
- tools/anime 两集合分层 Zod schema（bgmId 预留 / status enum / cover union）+ `lib/tools.ts`·`lib/anime.ts` 收口数据读取 + 2 条种子经构建期校验渲染
- 防 FOUC 主题系统：`<head>` is:inline 阻塞脚本绘制前定主题 + ThemeToggle 原生脚本切换 + localStorage 记忆
- 部署上线 Vercel 生产站 `https://chuxisite.vercel.app`，sitemap 用真实域名，人工确认暗色刷新无白闪 + 主题记忆稳定

## Task Commits

1. **Task 1: 脚手架 + 集成 + astro.config + .gitattributes** - `56ba202` (chore)
2. **Task 2: content.config.ts 两集合 schema + lib 薄数据层 + 种子内容** - `ab28a05` (feat)
3. **Task 3: global.css @theme + BaseLayout 防 FOUC + ThemeToggle + 最小首页** - `3fc452d` (feat)
4. **Task 4: 【人工】git 远程 + Vercel 连接 + 首次部署** - 无代码提交（用户建 GitHub 仓库 zchuxi/chuxisite + 连接 Vercel；编排器加 remote + push main）
5. **Task 5: 回填 site + 首屏无 FOUC 验证** - `a924832` (feat，site → chuxisite.vercel.app)

## Files Created/Modified
- `astro.config.mjs` - site + image.remotePatterns(lain.bgm.tv) + mdx/sitemap/icon + tailwindcss() vite 插件
- `src/content.config.ts` - tools/anime 两集合分层 schema（唯一数据契约，z from astro/zod）
- `src/lib/tools.ts` - getAllTools() 过滤 draft + 按 title 中文排序
- `src/lib/anime.ts` - getAllAnime() 过滤 draft + 按 status 排序
- `src/content/tools/raycast.mdx`·`src/content/anime/frieren.mdx` - 2 条种子（frieren 含 bgmId 预留空位）
- `src/styles/global.css` - @import tailwindcss + @custom-variant dark + @theme 令牌 + :where(.dark) 重定义
- `src/layouts/BaseLayout.astro` - head is:inline 防 FOUC 脚本 + slot + footer
- `src/components/ThemeToggle.astro` - 44×44 圆角按钮 + ph:moon/sun + 原生 script 切 .dark/写 localStorage
- `src/pages/index.astro` - 经 lib 渲染站名「初曦的窝」+ 种子标题 + ThemeToggle
- `.gitattributes` - `* text=auto eol=lf`（统一 LF，避免 Windows→Vercel CRLF 噪声）

## Decisions Made
- **z import 用 `astro/zod`**：Astro 7 弃用 `astro:content` 再导出的 z（24 条 hint），改官方非弃用路径，避免 Phase 2/3 继承弃用写法
- **分支 master → main**：对齐 GitHub 新仓库默认分支与 Vercel 生产分支，push main 即触发生产部署
- **site 首推即回填真实域名**：将 Task 5 的 site 回填提前到首次 push 之前，Vercel 只构建一次即用正确 canonical/OG/sitemap 域名
- **git 走本地代理 127.0.0.1:7897**：仅写入本仓库 config（http.proxy/https.proxy），解决 GitHub 443 连接问题

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 脚手架 flag 回退：子目录 → 就地根**
- **Found during:** Task 1（脚手架）
- **Issue:** `npm create astro . --yes` 未就地生成，建了 `spiffy-star/` 子目录（含 stub 版 CLAUDE.md/AGENTS.md）
- **Fix:** 脚手架文件移至仓库根、跳过 stub 文档（保住真实 10856 字节项目 CLAUDE.md），删空子目录；包名改 `chuxi-wo`
- **Committed in:** 56ba202

**2. [Rule 1 - 弃用根因修复] z 导入路径 astro:content → astro/zod**
- **Found during:** Task 2（数据契约）
- **Issue:** `import { z } from 'astro:content'` 在 Astro 7 已弃用，触发 24 条 hint
- **Fix:** 改官方非弃用路径 `import { z } from 'astro/zod'`，清除 22 条 hint（剩 2 条为 `z.string().url()` 的 Zod 提示，属 Task 2 验收明确要求写法）
- **Committed in:** ab28a05

**3. [Rule 3 - Blocking] 补装 astro check 依赖**
- **Found during:** Task 2（验收要求 `npx astro check exits 0`）
- **Issue:** `@astrojs/check` + `typescript` 缺失，astro check 无法运行
- **Fix:** 作为 devDependencies 安装（官方 @astrojs 域 + Microsoft typescript）
- **Committed in:** ab28a05

---

**Total deviations:** 3 auto-fixed（1 弃用根因修复 + 2 blocking）
**Impact on plan:** 均为正确性/验收所必需，无 scope creep。

## Issues Encountered
- **GitHub push 443 连接失败**：git CLI 未走系统代理，`github.com:443` 超时。探测到本地代理 `127.0.0.1:7897`（Clash）可达 GitHub，配置仓库级 http.proxy/https.proxy 后 push 成功。

## User Setup Required
外部服务已由用户一次性配置完成（Task 4）：
- GitHub 仓库 `zchuxi/chuxisite`（已建 + 已推 main）
- Vercel 项目 `chuxisite`，生产域名 `https://chuxisite.vercel.app`（已识别 Astro，output static 免适配器，已生产部署成功）
- 后续维护：改 `.mdx`/配置 → `git push origin main` → Vercel 自动重建部署

## Next Phase Readiness
- **地基就绪**：node_modules 已装（Wave 2 的 01-02/01-03 在主树复用）；BaseLayout/ThemeToggle/global.css/index.astro 已存在，供 01-02 视觉外壳与 01-03 SEO 扩展
- **01-02（视觉外壳）**：在 global.css @theme 上扩展完整令牌，替换最小首页为 Hero 落地页
- **01-03（SEO 占位页）**：在 BaseLayout 上追加 SEO/OG/canonical head（与 01-02 无文件重叠，可并列）
- **无阻塞项**

---
*Phase: 01-foundation-shell*
*Completed: 2026-07-15*
