# Stack Research

**Domain:** 二次元风格个人内容站（工具库 + 追番记录，文件驱动的 Astro + Tailwind 静态站）
**Researched:** 2026-07-14
**Confidence:** HIGH（核心版本经 npm registry + Context7 官方文档核实；岛屿框架取舍为经验判断，标注 MEDIUM）

> **版本说明（与 PITFALLS.md 对齐）：** 兄弟 PITFALLS 研究引用了 Context7 快照中的 Astro **6.3.1**。npm registry（权威、更新更快）显示当前 latest 为 **Astro 7.0.9**（7.0.0 发布于 2026-06-22）。二者不冲突：Content Layer API（`src/content.config.ts` + `glob()`/`file()` loader + `image()` helper）、`astro:assets`、Tailwind v4 经 `@tailwindcss/vite` 等 API 自 Astro 5 引入后在 6/7 保持稳定，PITFALLS 描述的所有 API 用法在 Astro 7 依然有效。本文档采用当前实际 latest 版本 7.0.9。

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Astro | 7.0.9 | 静态站点框架，构建期渲染，Islands 架构 | 内容型站点的主流最优解：默认零 JS、静态优先；Content Layer 契合「改文件 + git 部署」；用户指定栈。engines 要求 **Node ≥ 22.12.0** |
| Tailwind CSS | 4.3.2 | 原子化 CSS，主题/暗色系统 | v4 用 CSS-first 配置（`@import "tailwindcss"` + `@theme`），无需 `tailwind.config.js`；经 Vite 插件集成，构建更快 |
| @tailwindcss/vite | 4.3.2 | Astro 集成 Tailwind v4 的官方方式 | Astro ≥5.2 推荐路径；**旧的 `@astrojs/tailwind` 已弃用**，勿用 |
| @astrojs/mdx | 7.0.3 | 工具/番剧详情页支持 MDX（Markdown + 组件） | 详情页「可长可短图文」需要在 Markdown 中嵌入 `<Image>`、徽章、评分等组件。peer 要求 `astro ^7.0.0` |
| Content Layer API | （内置于 Astro 7） | 两个内容集合的类型安全数据层 | `src/content.config.ts` + Zod schema，编译期校验；用 `glob()`（一文件一条）/`file()`（单数据文件）loader |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @astrojs/preact | 6.0.1 | 唯一推荐的岛屿框架集成 | 主题切换、筛选、追番交互等真正需要客户端状态的最小叶子岛屿。peer: `preact ^10.6.5` |
| preact | 10.29.7 | ~3–4KB 的 React 兼容运行时 | 随 @astrojs/preact 安装 |
| @nanostores/preact | 1.1.0 | 跨岛屿共享状态（主题、当前筛选标签） | 多个独立岛屿需共享一份状态时（如导航栏主题按钮 + 页面其它响应主题的岛屿）。基础包 `nanostores` 1.4.0 |
| @astrojs/sitemap | 3.7.3 | 构建期生成 sitemap.xml | 上线即加，配合 `site` 做 SEO（PITFALLS「SEO 基础」项） |
| sharp | 0.35.3 | `astro:assets` 图片优化底层（WebP/AVIF） | Astro 默认使用；封面/截图优化管线依赖它（PITFALLS P4） |
| pagefind | 1.5.2 | 构建期全文搜索索引，按需加载 | **仅当内容达数百条以上**再引入；v1（几十条）不装（PITFALLS P7/过度工程） |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| TypeScript | Astro 内置类型 + Content Collections 类型推导 | 用 `astro/tsconfigs/strict`；`astro sync` 生成 `astro:content` 类型 |
| Prettier + prettier-plugin-astro | 格式化 `.astro`/`.mdx` | 可选，个人站按需 |
| astro check | 构建前类型/内容校验 | CI/部署前跑，及早发现 frontmatter 与 schema 不一致 |

## Installation

```bash
# 脚手架（交互式，选 minimal 模板 + TypeScript strict）
npm create astro@latest

# 核心集成（推荐用 astro add，自动改配置）
npx astro add tailwind mdx preact sitemap
# ↑ tailwind 会装 @tailwindcss/vite 4.x 并在 astro.config 注入 vite 插件；
#   并在全局 CSS 写入 @import "tailwindcss"

# 跨岛屿状态（仅在确有多岛屿共享状态时）
npm install nanostores @nanostores/preact

# 图片优化底层（Astro 通常已带；如缺显式安装）
npm install sharp

# 搜索（推迟到数百条内容后再装，非 v1）
# npm install -D pagefind
```

无需部署适配器：`output: 'static'`（默认）时 Vercel/Netlify 均可零配置自动识别 Astro 并构建。仅当日后启用 SSR/按需渲染才装 `@astrojs/vercel` 或 `@astrojs/netlify`。

## 关键配置要点（供 roadmap 落地）

**Tailwind v4 暗色策略（与 PITFALLS P3 对齐）** — 全局 CSS 中：
```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```
配合 `<head>` 内联同步脚本在绘制前给 `<html>` 加 `.dark`，避免 FOUC。不要用纯 `media` 策略（无法手动切换）。

**两个内容集合结构（`src/content.config.ts`）：**
```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const tools = defineCollection({
  loader: glob({ base: './src/content/tools', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    url: z.string().url(),
    summary: z.string(),           // 一句话描述
    tags: z.array(z.string()),
    category: z.string(),
    cover: image().optional(),      // 本地图走 astro:assets 优化
    draft: z.boolean().default(false),
  }),
});

const anime = defineCollection({
  loader: glob({ base: './src/content/anime', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) => z.object({
    // —— 客观元数据组（未来可被 Bangumi API 覆盖）——
    bgmId: z.number().optional(),          // 手动条目留空，稳定 ID 预留
    titleJa: z.string().optional(),
    titleCn: z.string(),
    cover: z.union([image(), z.string().url()]).optional(), // 本地 or 远程
    episodes: z.number().optional(),
    airDate: z.coerce.date().optional(),
    // —— 我的追番状态组（永远手动）——
    status: z.enum(['watching', 'done', 'plan']),
    myRating: z.number().min(0).max(10).optional(),
    progress: z.number().default(0),
    comment: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { tools, anime };
```
两组字段分层、`bgmId` 预留、`cover` 兼容本地/远程 —— 直接落实 PITFALLS P1 的数据层可迁移性。`astro.config` 中提前配 `image.remotePatterns`（如 `hostname: 'lain.bgm.tv'`）为远程封面铺路，即使 v1 未用。

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Preact（岛屿框架） | 原生 `<script>` + `data-*` / `<details>` | 主题切换、简单展开折叠、tab —— 这些**优先用原生**，根本不需要框架（PITFALLS P6）。Preact 只留给追番状态编辑、复杂筛选等真正有状态的 UI |
| Preact | Solid（@astrojs/solid-js） | 若偏好细粒度响应式且团队熟悉 Solid；体积同样极小。对本项目差异不大 |
| Preact | Alpine.js（@astrojs/alpinejs） | 若想「HTML 里撒少量交互指令」而完全不写组件；适合极轻交互，但跨组件状态不如 nanostores 清晰 |
| nanostores | Astro 原生 `<script>` + 自定义事件 / localStorage | 岛屿极少、状态简单时，直接用事件/DOM 即可，不必引入状态库（YAGNI） |
| pagefind | 客户端 `data-tags` show/hide 过滤 | v1 几十条内容：构建期静态分类页 + 轻量 DOM 过滤足够，不装索引库 |
| @tailwindcss/vite | 手写 CSS / CSS Modules | 若不想要原子化；但用户已定 Tailwind，且二次元主题用 `@theme` token 管理色板最顺手 |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@astrojs/tailwind` | 已弃用（Astro ≥5.2 起）；对应 Tailwind v3 老路径 | `@tailwindcss/vite` + `@import "tailwindcss"`（Tailwind v4） |
| `tailwind.config.js`（JS 配置为主） | v4 改为 CSS-first，`@theme` 内定义 token | 全局 CSS 里用 `@theme { --color-... }` |
| `src/content/config.ts` + 隐式集合（无 loader） | Astro 3/4 旧 API，Astro 5+ 已换 Content Layer | `src/content.config.ts` + 显式 `loader`（PITFALLS P2） |
| React（@astrojs/react） | 运行时对纯静态个人站过重（~40KB+），无必要 | Preact（~3–4KB，API 兼容） |
| Vue / Svelte（作为主岛屿框架） | 再引入一套运行时；本项目交互极少不值当 | 单一 Preact，能原生就原生 |
| CMS / 数据库 / 状态管理大全套（Redux 等） | 违背「改文件 + git、无后台」初衷（PITFALLS P8 过度工程） | Content Collections + 文件 |
| Fuse.js / 自建搜索后端（v1） | 几十条内容上重型搜索是过度工程 | 静态分类页 + 轻量 DOM 过滤；数百条后再上 Pagefind |
| 部署适配器（纯静态时） | `output:'static'` 下 Vercel/Netlify 自动识别，装了反增复杂度 | 无适配器；需 SSR 时再按平台加 |

## Stack Patterns by Variant

**If 交互只有主题切换 + 标签筛选（v1 最可能）：**
- 主题：`<head>` 内联脚本 + 一个原生 `<script>` 切换按钮，零框架
- 筛选：`getStaticPaths` 生成 `/tools/tag/xxx` 静态页 + 客户端 `data-tags` show/hide
- 结论：**可能完全不需要 Preact**；先不装，真遇到有状态 UI 再 `astro add preact`

**If 追番模块需要客户端可编辑/交互式评分、进度条、多状态切换：**
- 用 Preact 做该模块的最小叶子岛屿（`client:visible`）
- 跨岛屿共享「当前主题 / 当前筛选」用 nanostores
- 数据仍来自 Content Collections（构建期），岛屿只处理展示态交互

**If 未来接入 Bangumi API：**
- schema 已按 subject 蓝本分层（`bgmId`/`titleJa`/`titleCn`/`cover`/`episodes`），无需重构数据层
- 远程封面靠预配的 `image.remotePatterns` 直接生效
- 拉取脚本产出 JSON → 改用 `file()` loader 或构建期生成 Markdown，手动条目与 API 条目共存

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| astro@7.0.9 | Node ≥ 22.12.0, npm ≥ 9.6.5 | engines 强约束；Vercel/Netlify 构建镜像需 Node 22+ |
| @astrojs/mdx@7.0.3 | astro ^7.0.0 | 与 Astro 7 同步大版本 |
| @astrojs/preact@6.0.1 | preact ^10.6.5 | 装 preact@10.29.7 满足 |
| @tailwindcss/vite@4.3.2 | tailwindcss@4.3.2 | 两者同版本齐进 |
| @nanostores/preact@1.1.0 | nanostores@1.4.0, preact@10.x | 与 Preact 岛屿配套 |
| @astrojs/sitemap@3.7.3 | astro 7 | 需在 `astro.config` 设 `site` 才生成正确 URL |

## Sources

- npm registry（`npm view`，2026-07-14 实时）— astro 7.0.9（latest，7.0.0 发布 2026-06-22）、@astrojs/mdx 7.0.3（peer astro ^7）、@astrojs/preact 6.0.1（peer preact ^10.6.5）、@tailwindcss/vite 4.3.2、tailwindcss 4.3.2、@nanostores/preact 1.1.0、nanostores 1.4.0、pagefind 1.5.2、sharp 0.35.3、preact 10.29.7；astro engines node ≥22.12.0 — **HIGH**
- Context7 `/withastro/docs`（Astro，快照 6.3.1）— Content Layer（`src/content.config.ts`、`glob`/`file` loader、`image()` helper）、`astro:assets`、Tailwind v4 经 `@tailwindcss/vite`、`@astrojs/tailwind` 弃用、Islands `client:*` 指令语义 — **HIGH**（API 在 7 中稳定延续）
- 兄弟 PITFALLS.md（同批研究）— 数据层可迁移 schema、主题 FOUC、图片优化、岛屿过度水合、过度工程等约束，本 STACK 与其 API/版本结论对齐 — **HIGH**
- 岛屿框架取舍（Preact vs React/Vue/Solid/Alpine，体积与场景匹配）— 通用生态经验判断 — **MEDIUM**

---
*Stack research for: 二次元风格个人内容站（Astro 7 + Tailwind v4 静态站点）*
*Researched: 2026-07-14*
