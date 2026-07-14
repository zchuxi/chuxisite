# Phase 1: 站点地基与二次元外壳 - Research

**Researched:** 2026-07-14
**Domain:** Astro 7 静态站脚手架 + Tailwind v4 主题系统 + Content Layer schema + 字体/图标/SEO/Vercel 部署
**Confidence:** HIGH（包名与版本经 npm registry + slopcheck 核实；Tailwind v4 / Content Layer / 主题脚本 API 经项目级研究 HIGH 核实；Astro 原生 Fonts API 状态标 [ASSUMED]）

> 本文只补 Phase-1 落地细节。栈版本/架构/坑详见 `.planning/research/STACK.md`、`ARCHITECTURE.md`、`PITFALLS.md`，**不重复**。网络受限：docs.astro.build / npmjs.com 的 WebFetch 与 WebSearch 本次被 429/安全策略拦截；已改用 npm registry 直查 + slopcheck 核实包，训练知识部分标注 [ASSUMED]。

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01** 站点名 = **初曦的窝**（Logo/Wordmark 配 ✦ 星星 `aria-hidden`；用于浏览器标题、SEO）
- **D-02** SEO title 模式 = `{页面标题} · 初曦的窝`（覆盖 UI-SPEC 占位「二次元小站」）
- **D-03** Hero 标语 = **「工具、番剧、和一点点生活」**（可后续改）
- **D-04** 部署 = **Vercel**（git push 自动构建，`output:'static'` 免适配器）
- **D-05** 域名先用 Vercel 默认生产域名 `xxx.vercel.app`；`astro.config` 的 `site` 先填生产 URL，**首次部署后回填真实域名**。sitemap/canonical/OG 依赖 `site`，必须有有效值
- **D-06** 预置工具 1–2 条 + 番剧 1–2 条真实种子内容，验证 schema 与构建
- **D-07** 首页两入口卡可点击 → `/tools`、`/anime`
- **D-08** `/tools`、`/anime` 本阶段为**带空状态文案的可导航占位页**（不 404）

### Claude's Discretion（用户授权按研究蓝本落定）
- 工具 schema：`title` / `url`(url) / `summary` / `tags`(string[]) / `category`(单 string) / `cover`(image() 可选) / `draft`(默认 false)。优缺点/心得放 MDX 正文，不做结构化字段；不加评分
- 番剧 schema 分层：元数据组 `bgmId?`(number) / `titleJa?` / `titleCn` / `cover`(image|url) / `episodes?` / `airDate?`；状态组 `status`('watching'|'done'|'plan') / `myRating?`(0–10) / `progress`(默认0) / `comment?` / `draft`
- 数据访问经 `lib/tools.ts` / `lib/anime.ts` 薄封装，不直接 `getCollection`
- `astro.config` 预配 `image.remotePatterns`（`lain.bgm.tv`）
- 主题切换按钮优先原生 `<script>`（非 Preact 岛屿）；初始化走 `<head>` 内联阻塞脚本
- 装饰字体（Fredoka + ZCOOL KuaiLe）子集化 + preload，仅标题用

### Deferred Ideas (OUT OF SCOPE)
- 首页「最近更新」/时间线（v1.x FEED-02）
- 工具客户端搜索、组合筛选（v2 SEARCH-01/02）
- 自定义域名接入（首次上线后再接）
- Bangumi API 自动拉取（v2 API-01；本阶段仅 schema/config 预留）
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | Astro+Tailwind 静态架构，文件维护，git 自动部署 Vercel | §Scaffold Sequence、§Vercel 部署 |
| INFRA-02 | 两集合类型安全数据模型（Content Layer+Zod），番剧分层+bgmId 预留 | §content.config.ts、§种子内容 |
| INFRA-03 | 全站响应式 | §Architecture Patterns（容器/断点）、UI-SPEC |
| INFRA-04 | 亮/暗切换+记忆+无 FOUC | §主题系统实现 |
| INFRA-05 | 鲜艳可爱二次元视觉（配色/排版基线） | §Tailwind v4 @theme、§字体、§装饰 SVG |
| INFRA-06 | sitemap.xml + 每页 SEO meta（title/description/OG） | §SEO 组件、§sitemap |
| INFRA-07 | 二次元落地首页 + 简介 + 两入口 | §首页组成、UI-SPEC Hero 规格 |
</phase_requirements>

## Summary

Phase 1 是纯静态 greenfield 脚手架 + 视觉外壳 + 数据契约。项目根目前仅有 `CLAUDE.md`，无任何代码。本地 Node **v24.1.0** 满足 Astro 7 的 `node>=22.12.0`。全部 9 个新增 npm 包经 slopcheck（npm ecosystem）核实为 `OK`（`@iconify-json/ph` 仅 info 级 NO_REPO），版本经 npm registry 实时核实。

关键落地决策：(1) 脚手架用 `npm create astro@latest -- --template minimal --typescript strict --no-install --no-git --skip-houston` 非交互建立，再 `npx astro add tailwind mdx sitemap`（Preact 本阶段**不装**——无有状态岛屿）；(2) 主题防 FOUC 用 `<head>` 内 `is:inline` 阻塞脚本 + 原生 `<script>` 切换按钮 + `astro:after-swap`；(3) 字体走 **fontsource（Fredoka 变体）+ pyftsubset 手工子集化 ZCOOL KuaiLe**（避免整包 CJK >1MB，满足 P5），preload 关键字重；(4) 图标 `astro-icon` + `@iconify-json/ph`；(5) SEO 集中在 `BaseLayout` head + `@astrojs/sitemap`。

**Primary recommendation:** 按「脚手架→config(site+remotePatterns)→content.config.ts+种子→global.css(@theme+dark)→BaseLayout(主题脚本+SEO+字体)→组件/首页→占位页/404→Vercel 部署回填 site」顺序落地；能原生就原生，本阶段零 Preact 岛屿。

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 主题初始应用（防 FOUC） | Browser（`<head>` 内联同步脚本） | — | 必须在首次绘制前同步执行，不能等岛屿水合（P3） |
| 主题切换交互 | Browser（原生 `<script>`） | — | 仅翻 `.dark` class + 写 localStorage，无需框架（P6） |
| 数据 schema 校验 | Build（Content Layer + Zod） | — | 构建期编译校验，零运行时（INFRA-02） |
| 数据读取/过滤 draft/排序 | Build（`lib/*.ts`） | — | 薄封装收口，页面不直接 getCollection |
| 页面渲染 | Build（Astro `.astro` 静态） | — | 默认零 JS 静态优先 |
| 图片优化 | Build（`astro:assets` + sharp） | CDN（Vercel） | 构建期出 WebP/AVIF（P4） |
| sitemap/canonical/OG | Build（`@astrojs/sitemap` + BaseLayout head） | — | 依赖 `site` 构建期拼 URL（INFRA-06） |
| 部署/CDN | CDN（Vercel static） | — | git push 自动构建，免适配器 |

## Standard Stack

### Core（本阶段新增，均经 npm registry + slopcheck 核实 2026-07-14）
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | 7.0.9 | 框架/构建/Islands | 已定栈；`node>=22.12.0`（本地 v24.1.0 OK）[VERIFIED: npm registry] |
| @tailwindcss/vite | 4.3.2 | Tailwind v4 官方集成 | Astro≥5.2 推荐；旧 `@astrojs/tailwind` 弃用 [VERIFIED: npm registry] |
| tailwindcss | 4.3.2 | 原子 CSS + `@theme` token | CSS-first，无 config.js [VERIFIED: npm registry] |
| @astrojs/mdx | 7.0.3 | 详情页 MDX | peer `astro ^7`；Phase2/3 详情页需要，本阶段种子即用 [VERIFIED: npm registry] |
| @astrojs/sitemap | 3.7.3 | 构建期 sitemap.xml | 需 `site`（INFRA-06）[VERIFIED: npm registry] |
| astro-icon | 1.1.5 | 构建期内联 SVG 图标 | natemoo-re(Astro core)维护；零运行时 JS [VERIFIED: npm registry] |
| @iconify-json/ph | 1.2.2 | Phosphor 图标集数据 | UI-SPEC 指定 Phosphor；圆润友好 [VERIFIED: npm registry] |
| @fontsource-variable/fredoka | 5.2.10 | Fredoka 可变字体(Latin) | 自托管、免运行时请求 Google [VERIFIED: npm registry] |
| @fontsource/zcool-kuaile | 5.2.8 | ZCOOL KuaiLe 源字体 | **仅作 pyftsubset 子集化来源**，勿整包引入（见 §字体）[VERIFIED: npm registry] |

### 本阶段明确 NOT 安装
| Package | 为何不装本阶段 |
|---------|---------------|
| @astrojs/preact / preact | 本阶段无有状态岛屿；主题切换用原生 script。真需要时 Phase 3 再 `astro add preact`（STACK「可能完全不需要 Preact」）|
| nanostores / @nanostores/preact | 无跨岛屿状态 |
| pagefind | 内容仅几条，过度工程（P7）|
| @astrojs/vercel 适配器 | `output:'static'` Vercel 自动识别，装了增复杂度 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| fontsource + pyftsubset | Astro 原生 Fonts API（`experimental.fonts` + `<Font>`）| 自动子集/preload/fallback，但**其在 Astro 7 是否已 stable 未能核实 [ASSUMED]**；且 CJK 走 google provider 按 unicode-range 分片。若已 stable 更省事，但引入 experimental 风险。本阶段选已验证稳定的 fontsource 路径 |
| @fontsource/zcool-kuaile 整包 | 手工 pyftsubset 子集 | 整包 CJK woff2 常 >1MB，违反 P5 验收。仅取实际用字子集 |
| astro-icon | 内联手写 SVG 组件 | 图标多时 astro-icon 更省事、统一；装饰性异形 SVG（blob/星星）仍手写 |

**Installation:**
```bash
# 1) 非交互脚手架（Windows Git Bash）
npm create astro@latest chuxi-wo -- --template minimal --typescript strict --no-install --no-git --skip-houston
cd chuxi-wo
# 2) 官方集成（自动改 astro.config + 注入 tailwind vite 插件 + 写 @import "tailwindcss"）
npx astro add tailwind mdx sitemap --yes
# 3) 图标 + 字体
npm install astro-icon @iconify-json/ph @fontsource-variable/fredoka @fontsource/zcool-kuaile
# sharp 随 astro 自带；如构建报缺失再 npm install sharp
```

**Version verification（2026-07-14 实时 npm registry）:** 全部版本见上表，均为当前 latest。astro 7.0.9 engines = `node>=22.12.0, npm>=9.6.5`。

## Package Legitimacy Audit

> slopcheck 0.6.1 已装。**注意**：`slopcheck install` 子命令默认 PyPI ecosystem，会把 npm 名当 PyPI 包真装（本次误装了同名无关 Python 包 `astro`=astrodynamics、`tailwindcss`=占位）——这正是跨生态混淆（~9%）实例。正确用法：`slopcheck scan package.json`（自动识别 npm）。下表基于 npm ecosystem 扫描结果。

| Package | Registry | Age | Source Repo | slopcheck(npm) | Disposition |
|---------|----------|-----|-------------|----------------|-------------|
| astro | npm | 成熟 | withastro/astro | OK | Approved |
| @tailwindcss/vite | npm | 成熟 | tailwindlabs/tailwindcss | OK | Approved |
| tailwindcss | npm | 成熟 | tailwindlabs/tailwindcss | OK | Approved |
| @astrojs/mdx | npm | 成熟 | withastro/astro | OK | Approved |
| @astrojs/sitemap | npm | 成熟 | withastro/astro | OK | Approved |
| astro-icon | npm | mod 2024-12 | natemoo-re/astro-icon | OK | Approved |
| @iconify-json/ph | npm | mod 2024-12 | iconify(monorepo) | OK（info: NO_REPO）| Approved |
| @fontsource-variable/fredoka | npm | mod 2025-09 | fontsource/font-files | OK | Approved |
| @fontsource/zcool-kuaile | npm | mod 2026-02 | fontsource/font-files | OK | Approved |

**Packages removed due to [SLOP]:** none
**Packages flagged [SUS]:** none（`@iconify-json/ph` 仅 info 级 NO_REPO：Iconify 图标数据包无独立 repo 属正常，非风险）

## Scaffold Sequence（Windows / Git Bash）

**执行环境:** cwd `D:\workspace\site`，仅有 `CLAUDE.md`。**planner 决策点**：站点根就地放仓库根，还是子目录。建议就地初始化（`.`），避免嵌套多套 node_modules。`.` 非空（有 CLAUDE.md/.planning）时 create-astro 会警告非空目录——非交互加 `--yes` 跳过，它不删除既有文件。

```bash
# 在 D:\workspace\site 根就地初始化（保留 CLAUDE.md/.planning）
npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git --skip-houston --yes
npm install
npx astro add tailwind mdx sitemap --yes      # 自动写 astro.config + 装依赖 + 注入 tailwind vite 插件
npm install astro-icon @iconify-json/ph @fontsource-variable/fredoka @fontsource/zcool-kuaile
```

**create-astro flag 语义 [ASSUMED — 训练知识，未能联网核实]:** `--template minimal` 最空模板；`--typescript strict` = `astro/tsconfigs/strict`；`--no-install`/`--no-git` 跳过自动装依赖与 git init（仓库已受 GSD 管控）；`--skip-houston` 跳吉祥物动画；`--yes/-y` 全默认。若 flag 名有出入，回退交互式 `npm create astro@latest` 选 Empty + Strict + 不装依赖/不 git。

**Windows gotchas:**
- **大小写敏感差异（最高频线上事故）**：Windows 文件名不区分大小写，Vercel(Linux) 区分。组件 import 路径大小写必须与文件名完全一致，否则本地过、线上构建 404。
- glob base 用 POSIX 正斜杠 `./src/content/tools`，勿写 `.\src`。
- 建 `.gitattributes`（`* text=auto eol=lf`）统一 LF，避免 CRLF diff 噪声。
- sharp：Astro 7 自带预编译二进制，Windows x64 通常直接可用；报缺失再 `npm install sharp`。
- 本环境 shell 即 Git Bash，`npx astro add` 正常。

## astro.config.mjs（关键配置）

```js
// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // D-05: 先填 Vercel 生产域名占位，首次部署后回填真实值
  site: 'https://chuxi-wo.vercel.app',   // TODO: 首次部署后回填真实生产域名
  integrations: [mdx(), sitemap(), icon()],
  vite: { plugins: [tailwindcss()] },
  image: {
    remotePatterns: [{ protocol: 'https', hostname: 'lain.bgm.tv' }], // Bangumi 远程封面预铺路(P4)
  },
});
```
> `site` 是构建期值：占位期 sitemap/canonical 指向占位域名，回填后重新 push 触发重建即修正。[配置形状 CITED: Astro config 惯例]

## content.config.ts（数据契约 — INFRA-02）

**路径必须 `src/content.config.ts`（Content Layer），非旧 `src/content/config.ts`（P2）。**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const tools = defineCollection({
  loader: glob({ base: './src/content/tools', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    url: z.string().url(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    category: z.string(),
    cover: image().optional(),
    draft: z.boolean().default(false),
  }),
});

const anime = defineCollection({
  loader: glob({ base: './src/content/anime', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) => z.object({
    // 客观元数据组（未来 Bangumi API 可覆盖）
    bgmId: z.number().optional(),
    titleJa: z.string().optional(),
    titleCn: z.string(),
    cover: z.union([image(), z.string().url()]).optional(),
    episodes: z.number().optional(),
    airDate: z.coerce.date().optional(),
    // 追番状态组（永远手动）
    status: z.enum(['watching', 'done', 'plan']),
    myRating: z.number().min(0).max(10).optional(),
    progress: z.number().default(0),
    comment: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { tools, anime };
```

**Content Layer / Zod 要点 [VERIFIED: 项目级研究 HIGH + Astro 7 稳定]:**
- `schema: ({ image }) => ...` 函数式签名才拿得到 `image()` helper。
- `z.union([image(), z.string().url()])`：`image()` 放前，兼容本地/远程 cover（P1）。
- 元数据组用 `.optional()`（不用 `.default()`，避免把手动值伪装成客观值，P1）；状态组 progress/draft/tags 用 `.default()`。
- 建后 `npx astro sync` 生成 `astro:content` 类型，供 `lib/*.ts` 与页面消费。
- `airDate` 用 `z.coerce.date()`，frontmatter 可写 `2024-04-01` 字符串。

## lib 薄数据层（ARCHITECTURE Pattern 1）

页面不直接 `getCollection`，一律经 `lib/tools.ts` / `lib/anime.ts`（保番剧换源可插拔）。本阶段最小实现：

```ts
// src/lib/tools.ts
import { getCollection } from 'astro:content';
export async function getAllTools() {
  const raw = await getCollection('tools', ({ data }) => !data.draft);
  return raw.sort((a, b) => a.data.title.localeCompare(b.data.title, 'zh'));
}
// src/lib/anime.ts — getAllAnime() 过滤 draft + 按 status(watching→plan→done) 排序
```

## 种子内容（D-06 — 验证 schema 与构建）

`src/content/tools/example-tool.mdx`（frontmatter 必须过 schema）：
```mdx
---
title: "Raycast"
url: "https://raycast.com"
summary: "macOS 上顺手的启动器与效率工具箱"
tags: ["效率", "macOS", "启动器"]
category: "效率工具"
draft: false
---
第一次用就回不去了。可长可短的图文心得写在正文（MDX 正文，不进 schema）。
```
`src/content/anime/example-anime.mdx`：
```mdx
---
titleCn: "葬送的芙莉莲"
titleJa: "葬送のフリーレン"
episodes: 28
airDate: 2023-09-29
status: "done"
myRating: 9
progress: 28
comment: "后劲很大的一部。"
draft: false
# bgmId 手动条目留空(预留 Bangumi 关联)；cover 可后补本地图或 lain.bgm.tv 远程 URL
---
```
> 种子内容不带 cover（本阶段可无图），避免引入图片资源；Phase 2/3 首次用 `<Image>` 时再补。构建后 `npx astro check` 应零 frontmatter 报错。

## Tailwind v4 `@theme` Token 设置（INFRA-05）

`src/styles/global.css`（`astro add tailwind` 会写入 `@import "tailwindcss"`；追加 token 与暗色变体）：
```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));   /* class 策略，配合内联脚本，非 media(P3) */

@theme {
  /* 字体 */
  --font-display: "Fredoka Variable", "ZCOOL KuaiLe", system-ui, sans-serif;
  --font-body: system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif;
  /* 圆角(很圆润) */
  --radius-sm: 10px; --radius-md: 16px; --radius-lg: 24px; --radius-xl: 32px; --radius-full: 9999px;
  /* 亮色调色板(节选，全量见 UI-SPEC) */
  --color-bg: #F3FBFE; --color-surface: #FFFFFF; --color-surface-muted: #E7F6FB;
  --color-primary: #17B6D6; --color-primary-hover: #0FA0BE; --color-primary-fg: #FFFFFF;
  --color-link: #0A7C93; --color-text: #0F2E3A; --color-text-muted: #5A7A85;
  --color-border: #CDEBF3; --color-deco-pink: #FF8FC7; --color-destructive: #F26D6D;
  /* 柔和青蓝染色阴影 */
  --shadow-soft: 0 6px 24px -8px rgba(23,182,214,0.25);
}

/* 暗色覆盖：Tailwind v4 @theme 生成的是 CSS 变量，暗色在 .dark 作用域重定义同名变量 */
:where(.dark) {
  --color-bg: #0C1B22; --color-surface: #12262F; --color-surface-muted: #17303A;
  --color-primary: #3AD2EF; --color-primary-hover: #5CDCF2; --color-primary-fg: #04222B;
  --color-link: #6FE0F5; --color-text: #E6F6FA; --color-text-muted: #94B4BF;
  --color-border: #234450; --color-deco-pink: #FF9ECF;
  --shadow-soft: 0 6px 24px -8px rgba(23,182,214,0.15);   /* 暗色降透明避免发灰 */
}
```
**要点 [VERIFIED: 项目级研究 HIGH]:** `@theme` 内的 `--color-*` 自动生成 `bg-bg`/`text-text`/`border-border` 等工具类与 `text-[--color-link]` 变量引用。暗色**不要**再在 `@theme` 里写第二套，而是在 `.dark` 作用域重定义同名变量——工具类自动跟随。`@custom-variant dark` 让 `dark:` 前缀也可用。阴影用 `shadow-[var(--shadow-soft)]` 或定义 `--shadow-soft` 后 `shadow-soft`。

## 主题系统实现（INFRA-04 · 无 FOUC · P3）

**① `<head>` 内联阻塞脚本（BaseLayout 首个 head 子元素，`is:inline`）:**
```astro
<script is:inline>
  const t = localStorage.getItem('theme')
    ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (t === 'dark') document.documentElement.classList.add('dark');
</script>
```
`is:inline` 告诉 Astro 不处理/不打包此脚本，原样内联同步执行（关键——绘制前跑，杜绝闪白）。

**② 切换按钮原生 `<script>`（ThemeToggle.astro，非 module 岛屿）:**
```astro
<button id="theme-toggle" aria-label="切换深浅色主题" class="...44x44 rounded-full">...</button>
<script>
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  });
</script>
```
Astro 普通 `<script>`（无 `is:inline`）会被打包为 `type=module` defer 脚本，仅执行一次、无水合、无框架——契合 D-38/P6。

**③ View Transitions 兜底:** 若启用 `<ClientRouter/>`，加 `astro:after-swap` 监听器重应用 `.dark`（读 localStorage），防跳转丢主题。**建议本阶段先不启用 View Transitions**（页面少，避免额外复杂度）；若启用则必须加此 hook。

## 字体加载（Fredoka + ZCOOL KuaiLe · P5）

**策略:** 正文用系统栈（`--font-body`，零加载）。装饰字体仅标题/Logo。
- **Fredoka（Latin，小）:** `@fontsource-variable/fredoka` — 在 BaseLayout 或 global.css `@import '@fontsource-variable/fredoka/index.css';`（或只 import 需要的字重）。自托管 woff2，几十 KB。
- **ZCOOL KuaiLe（CJK，大 — 不可整包引入）:** `@fontsource/zcool-kuaile` 整包 woff2 常 >1MB，**违反 P5**。改用 **pyftsubset 手工子集化**：
  ```bash
  # 取站点标题实际用字子集（初曦的窝/工具库/追番记录/section 标题等）
  pyftsubset node_modules/@fontsource/zcool-kuaile/files/zcool-kuaile-chinese-simplified-400-normal.woff2 \
    --text="初曦的窝工具库追番记录进入查看和一点点生活" \
    --flavor=woff2 --output-file=public/fonts/zcool-subset.woff2
  ```
  自定义 `@font-face { font-family:"ZCOOL KuaiLe"; src:url('/fonts/zcool-subset.woff2') format('woff2'); font-display:swap; }`。子集后通常 <30KB。
- **Preload 关键字重（BaseLayout head）:**
  ```html
  <link rel="preload" href="/fonts/zcool-subset.woff2" as="font" type="font/woff2" crossorigin>
  ```
  `crossorigin` 必需（字体请求匿名 CORS）。所有装饰字体 `font-display: swap`。
> **验收（P5）:** 网络面板无单个 >1MB 字体请求；正文永不用装饰字体；≤14px 不用花体。
> **备选 [ASSUMED]:** Astro 原生 Fonts API（`experimental.fonts` + `<Font>`）能自动子集/preload/fallback，CJK 走 google provider unicode-range 分片——若 Astro 7 已 stable 可替代 pyftsubset 手工流程，但本次未能联网核实其稳定状态，故主推 fontsource+pyftsubset（已验证稳定）。planner 可让 executor 首步 `npx astro --help` / 查 docs 确认后二选一。

## 图标 astro-icon + Phosphor（UI-SPEC）

`astro add` 不含 astro-icon，需手动加 `icon()` 到 integrations（见 astro.config）。用法：
```astro
---
import { Icon } from 'astro-icon/components';
---
<Icon name="ph:moon" aria-hidden="true" />           <!-- 装饰图标 aria-hidden -->
<Icon name="ph:wrench" class="size-6 text-primary" />
```
`name="ph:xxx"` 前缀 `ph` 对应 `@iconify-json/ph`。astro-icon 构建期把 SVG 内联进 HTML，零运行时 JS。装饰性图标加 `aria-hidden="true"`；语义图标配 `title` 或旁注文字。[VERIFIED: npm registry 包存在；用法 CITED: astro-icon 惯例]

## 装饰 SVG（星星/爱心/blob · UI-SPEC）

- 手写 `.astro` 内联 SVG 组件（`src/components/deco/`），非 astro-icon（这些是异形装饰非图标集）。
- 每个装饰 SVG：`aria-hidden="true"` + 容器 `pointer-events-none` + `position:absolute` 不占文档流、不遮文本。
- Hero 占位 blob：同尺寸 `aspect-ratio:4/3` + `--radius-xl` 圆角渐变（primary→pink），中心 1–2 星星/爱心；浮动动效包 `@media (prefers-reduced-motion: reduce)` 关闭。保证有图/无图占位一致，CLS≈0。
- 动效只用 `transform`/`opacity`，≤200ms。

## SEO 组件 + sitemap（INFRA-06）

**BaseLayout.astro head 统一输出**（props: `title`/`description`/`ogImage?`）：
```astro
---
const { title, description, ogImage } = Astro.props;
const fullTitle = `${title} · 初曦的窝`;                 // D-02
const canonical = new URL(Astro.url.pathname, Astro.site); // Astro.site = config.site
const og = new URL(ogImage ?? '/og-default.png', Astro.site);
---
<title>{fullTitle}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<meta property="og:type" content="website" />
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={og} />
<meta name="twitter:card" content="summary_large_image" />
```
- **默认 OG 图:** `public/og-default.png`（含 Logo/主色，1200×630），页面未传 `ogImage` 时兜底（D-02/UI-SPEC）。本阶段可先放占位 PNG。
- **sitemap:** `@astrojs/sitemap` 集成后构建期自动出 `/sitemap-index.xml` + `/sitemap-0.xml`（依赖 `site`）。在 head 加 `<link rel="sitemap" href="/sitemap-index.xml">`（可选）。
- **首页 title:** 首页可特化为 `初曦的窝 · 工具、番剧、和一点点生活`（D-03），避免 `首页 · 初曦的窝` 生硬。

## 首页组成（INFRA-07 · UI-SPEC）

`src/pages/index.astro`（包 BaseLayout）自上而下：Header/Nav(sticky) → Hero(Display 标题 D-03 + 副标 + 主CTA`进入工具库`→/tools + 次CTA`查看追番`→/anime + 插画/占位 blob) → IntroBlock(站点简介) → EntryCard×2(工具库/追番，整卡 `<a>`，1列→md 2列，工具库卡视觉略重) → Footer(手绘 divider + 软萌签名)。文案全部取自 UI-SPEC Copywriting Contract。

`/tools`、`/anime` 占位页（D-08）：各自 `index.astro` 渲染空状态（heading `这里还空空如也～ (｡･ω･｡)` + body + CTA`回到首页`），但 planner 可选让占位页已渲染种子内容的最简列表以证管道通（非必须，空状态即达标）。`src/pages/404.astro`：Error state 文案 + 回首页 + 走丢小装饰。

## Architecture Patterns

### System Data Flow
```
内容 .mdx (tools/ anime/)
      │ glob() loader
      ▼
content.config.ts ──Zod 校验(构建期)──► astro:content ──► astro sync 生成类型
      │
      ▼
lib/tools.ts · lib/anime.ts (过滤 draft / 排序)
      │
      ▼
pages/*.astro (index, tools/, anime/, 404) ── 组装 ──► components/*.astro (静态)
      │                                                    │
      │  BaseLayout: <head>内联主题脚本 + SEO meta + 字体preload + sitemap
      ▼
静态 HTML (默认零 JS) ──► Vercel build ──► CDN
      ▲
  Browser: 内联脚本(绘制前定主题) + ThemeToggle 打包 <script>(点击切换)
```

### Recommended Project Structure（就地仓库根）
```
src/
  content.config.ts          # 两集合 schema（唯一数据契约）
  content/{tools,anime}/*.mdx # 种子内容
  layouts/BaseLayout.astro    # head 主题脚本+SEO+字体; slot; footer
  pages/{index,404}.astro  pages/{tools,anime}/index.astro  # 占位空状态
  components/{Header,ThemeToggle,Hero,IntroBlock,EntryCard,Footer}.astro  components/deco/*.astro
  lib/{tools,anime}.ts        # 薄数据层
  styles/global.css           # @import tailwindcss + @theme + @custom-variant dark
  assets/                     # import 的本地图(astro:assets)
public/{fonts/zcool-subset.woff2, og-default.png, favicon.svg}
astro.config.mjs  .gitattributes
```

### Anti-Patterns
- **主题逻辑塞岛屿/useEffect** → 用 `<head>` `is:inline` 同步脚本（P3）。
- **暗色只在 `@theme` 写第二套色** → 在 `.dark` 作用域重定义同名变量。
- **整包引入 CJK 字体** → pyftsubset 子集（P5）。
- **页面直接 getCollection** → 经 lib/*（P1/ARCH）。
- **import 路径大小写与文件名不符** → Windows 本地过、Vercel 挂。

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| sitemap 生成 | 手写 XML 遍历 | `@astrojs/sitemap` | 自动跟随路由、依赖 site 拼 URL |
| 图片优化/WebP | 手写 sharp 管线 | `astro:assets <Image>` | 构建期自动 srcset/格式/尺寸(P4) |
| 图标 SVG | 复制粘贴 SVG 源 | astro-icon + `@iconify-json/ph` | 构建期内联、统一命名、零运行时 |
| 字体自托管 | 手下载摆放 Fredoka | `@fontsource-variable/fredoka` | 版本化、woff2、CSS 就绪 |
| CJK 子集 | 手删字形 | `pyftsubset`(fonttools) | 精确按用字裁剪、正确 woff2 |
| 数据类型 | 手写 TS interface | Content Layer + Zod + astro sync | schema 即类型，构建期校验 |
| 暗色主题切换 | React 状态库 | 原生 script + class 策略 | 零框架、无 FOUC(P3/P6) |

## Common Pitfalls（本阶段直接命中，详见项目级 PITFALLS.md）

- **P3 主题 FOUC** — 最易漏 `<head>` `is:inline` 脚本。验收：刷新暗色页无闪白、控制台无 hydration 警告。
- **P2 Content Layer 旧 API** — 用 `src/content.config.ts` + 显式 `loader`，非 `src/content/config.ts`。验收：`astro check` 零 frontmatter 报错。
- **P5 CJK 字体** — 别整包引 ZCOOL KuaiLe。验收：无 >1MB 字体请求。
- **P8 过度工程** — 本阶段零 Preact/nanostores/pagefind，占位页够简。
- **Windows→Vercel 大小写** — import 路径大小写严格一致。验收：Vercel 首次构建绿。
- **site 未回填** — 首次部署后必须回填真实域名并重 push，否则 canonical/OG/sitemap 指占位域名。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Astro 7 构建 | ✓ | v24.1.0 (≥22.12 OK) | — |
| npm | 装包/脚手架 | ✓ | 11.3.0 | — |
| sharp | astro:assets 优化 | 随 astro 自带 | — | 本阶段种子无图，未触发 |
| pyftsubset (fonttools) | ZCOOL 子集化 | ✗ 未核实 | — | `pip install fonttools brotli`；或先只上 Fredoka，ZCOOL 子集延后到视觉打磨步 |
| Vercel 账号/项目 | 部署(D-04) | ✗ 需用户配置 | — | 无——需用户在 Vercel 连 git 仓库（planner 应设 checkpoint:human） |
| git 远程仓库 | git push 自动部署 | ✗ 本地非 git 仓 | — | 需 `git init` + 建远程（GitHub）并连 Vercel |

**Missing with no fallback（planner 必须处理）:** Vercel 项目连接 + git 远程仓库——需人工一次性配置（checkpoint:human-verify）。当前 `D:\workspace\site` 非 git 仓库。
**Missing with fallback:** pyftsubset——装 fonttools 即可，或 ZCOOL 子集延后。

## Security Domain

静态只读站，无 auth/session/后端/用户输入 → ASVS V2/V3/V4 不适用。适用项：
| 项 | 控制 |
|----|------|
| V5 输入校验 | Content Layer + Zod 构建期校验 frontmatter（唯一「输入」是自管内容文件） |
| 外链安全 | 所有 `target="_blank"` 外链加 `rel="noopener noreferrer"`（本阶段种子工具外链已需，Phase2 卡片强化）(PITFALLS 安全表) |
| 内容发布控制 | `draft` 字段 + `lib/*` 构建期过滤，防私稿误发布 |
| 远程图 | `image.remotePatterns` 白名单授权（仅 lain.bgm.tv） |
> 无破坏性操作、无密钥、无 CI secret。config 未设 `security_enforcement`（默认启用）——以上为本静态站全部相关面。

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | create-astro flag（`--template minimal`/`--typescript strict`/`--skip-houston`/`--yes` 等）语义与名称 | Scaffold | 低——回退交互式脚手架即可，一次性 |
| A2 | Astro 7 原生 Fonts API 是否已 stable 未核实 | 字体·Alternatives | 低——主推 fontsource+pyftsubset 不依赖它 |
| A3 | astro-icon 1.1.5 与 Astro 7 完全兼容（peer 未显式读到） | 图标 | 中——若不兼容改手写内联 SVG；natemoo-re 维护，大概率兼容 |
| A4 | `@fontsource/zcool-kuaile` 内 woff2 文件名（`...-chinese-simplified-400-normal.woff2`） | 字体 | 低——executor 装后 `ls node_modules/.../files` 确认实际名 |
| A5 | Tailwind v4 `@theme` 暗色靠 `.dark` 作用域重定义同名变量（vs 其他机制） | Tailwind token | 中——项目级研究 HIGH 支撑；executor 构建后目视校验暗色 |

## Open Questions

1. **站点根目录：就地仓库根 vs 子目录** — 建议就地（`.`）。planner 定夺；影响所有路径。
2. **是否启用 View Transitions/ClientRouter** — 建议本阶段不启用（省 `astro:after-swap` 复杂度）；若启用必加主题重应用 hook。
3. **Vercel + git 远程尚未建立** — 需人工配置（见 Environment Availability），planner 应设 checkpoint。
4. **Fonts API vs pyftsubset 二选一** — executor 首步核实 Astro 7 Fonts API 稳定状态后决定（A2）。

## Sources

### Primary (HIGH)
- npm registry 实时查询（2026-07-14）— astro 7.0.9(engines node≥22.12.0)、@tailwindcss/vite 4.3.2、tailwindcss 4.3.2、@astrojs/mdx 7.0.3、@astrojs/sitemap 3.7.3、astro-icon 1.1.5、@iconify-json/ph 1.2.2、@fontsource-variable/fredoka 5.2.10、@fontsource/zcool-kuaile 5.2.8
- slopcheck 0.6.1 `scan --json`（npm ecosystem）— 全 9 包 status=OK
- 项目级研究 STACK.md / ARCHITECTURE.md / PITFALLS.md（HIGH）— Content Layer、Tailwind v4 暗色、主题 FOUC、图片、schema 分层
- 本地环境探测 — Node v24.1.0 / npm 11.3.0

### Tertiary (LOW/未核实 — 联网受限)
- create-astro CLI flag、Astro Fonts API 稳定状态、astro-icon Astro7 兼容 — 训练知识，标 [ASSUMED]（docs.astro.build/npmjs.com WebFetch 被安全策略拦、WebSearch 429）

## Metadata

**Confidence breakdown:**
- Standard stack / 版本：HIGH — npm registry + slopcheck 双验证
- 数据契约 schema / 主题系统 / Tailwind token：HIGH — 项目级研究 HIGH + Astro 7 稳定 API
- 脚手架 flag / Fonts API / astro-icon 兼容：MEDIUM-LOW — 训练知识，联网核实受阻（见 Assumptions）

**Research date:** 2026-07-14
**Valid until:** ~2026-08-14（Astro/Tailwind 快速迭代，30 天内复核版本）
