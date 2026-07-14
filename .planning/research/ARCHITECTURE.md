# Architecture Patterns

**Domain:** 二次元风格个人内容站（Astro 7 + Tailwind v4 静态站，工具库 + 追番记录）
**Researched:** 2026-07-14
**Confidence:** HIGH（结构为 Astro 官方标准布局；与 STACK.md / PITFALLS.md 结论对齐）

## Recommended Architecture

单仓库、纯静态（`output: 'static'`）。构建期把两个 Content Collections 渲染成静态 HTML，
交互只在最小叶子岛屿。数据单向流动：**内容文件 → Content Layer(schema 校验) → 页面(getStaticPaths) → 静态 HTML → (可选)岛屿只做展示态交互**。

### 目录布局

```
src/
  content.config.ts        # 两个集合定义 + loader + Zod schema（单一数据契约来源）
  content/
    tools/*.md(x)          # 一文件一工具
    anime/*.md(x)          # 一文件一番剧（未来 API 条目也落这里）
  layouts/
    BaseLayout.astro       # <head> 内联主题脚本、meta、字体、全局壳
    ToolLayout.astro       # 工具详情壳（继承 Base）
    AnimeLayout.astro      # 番剧详情壳（继承 Base）
  pages/
    index.astro
    tools/index.astro          # 列表/网格
    tools/[...slug].astro      # 详情（getStaticPaths）
    tools/tag/[tag].astro      # 标签静态页（getStaticPaths）
    anime/index.astro          # 追番列表（按 status 分组）
    anime/[...slug].astro      # 番剧详情
  components/                 # 纯 .astro 展示组件（ToolCard, AnimeCard, Badge…）
  islands/                    # Preact 叶子岛屿（仅有状态交互）
  lib/
    anime.ts                 # 数据访问薄封装（见「可插拔数据流」）
    tools.ts
  styles/global.css          # @import "tailwindcss" + @theme + @custom-variant dark
  assets/                    # 被 import 的本地图（走 astro:assets 优化）
astro.config.mjs             # site、image.remotePatterns、集成
```

### 组件边界

| 组件 | 职责 | 依赖/通信 |
|------|------|-----------|
| `content.config.ts` | 定义集合、loader、Zod schema —— **唯一数据契约** | 被 `lib/*` 与页面经 `getCollection` 消费 |
| `lib/anime.ts` / `lib/tools.ts` | 薄数据访问层：封装 `getCollection`、过滤 draft、排序、状态分组、派生视图模型 | 只依赖 `astro:content`；页面只调它，不直接调 `getCollection` |
| `layouts/*` | 页面外壳：head、主题脚本、meta、字体、导航 | 被 pages 包裹 |
| `pages/*` | 路由 + `getStaticPaths` 生成静态页；组装 components | 调 `lib/*` 取数据 |
| `components/*`（.astro） | 构建期渲染的静态展示（卡片、徽章、网格） | 无客户端 JS |
| `islands/*`（Preact） | **仅**真正有状态的交互叶子 | 经 props 收构建期数据；跨岛屿状态用 nanostores |

## Data Flow（单向）

```
内容 .md(x) / 未来 JSON
        │  (loader: glob/file)
        ▼
content.config.ts  ──Zod 校验──►  astro:content
        │
        ▼
lib/anime.ts · lib/tools.ts   （过滤 draft、排序、按 status 分组、映射视图模型）
        │
        ▼
pages/*.astro  (getStaticPaths)  ──►  静态 HTML（默认零 JS）
        │
        ▼(仅需交互处传 props)
islands/*.tsx (Preact, client:visible)   ← nanostores 跨岛屿共享(主题/当前筛选)
```

关键：数据永远**构建期**流入 HTML；岛屿不拉数据、只对已渲染数据做交互（筛选 show/hide、评分展示、进度条）。这直接落实 PITFALLS P6（避免半个 SPA）。

## 可插拔的番剧数据源（手动文件 → Bangumi API）

目标：换数据源时**页面零改动**。抽象点放在 **schema 分层 + `lib/anime.ts` 薄封装**，而非现在就写重型数据访问层（PITFALLS P8：预留只体现在字段设计）。

三个支点：

1. **schema 分层**（已在 STACK.md 定稿）：客观元数据组（`bgmId`/`titleJa`/`titleCn`/`cover`/`episodes`/`airDate`，可空）与我的追番状态组（`status`/`myRating`/`progress`/`comment`，永远手动）分开。API 未来只覆盖前者。
2. **`cover` 兼容本地/远程** + `astro.config` 预配 `image.remotePatterns`（如 `lain.bgm.tv`），远程封面无需改图片管线。
3. **`lib/anime.ts` 收口读取**：页面只调 `getAllAnime()` / `getAnimeByStatus()`，不直接 `getCollection('anime')`。切数据源时只改这一层。

```ts
// lib/anime.ts —— 页面唯一入口；换 loader 时页面不动
import { getCollection } from 'astro:content';
export type AnimeView = { /* 稳定视图模型：页面只依赖它 */ };
export async function getAllAnime(): Promise<AnimeView[]> {
  const raw = await getCollection('anime', ({ data }) => !data.draft);
  return raw.map(toView).sort(byStatusThenDate);  // 状态/元数据在此合并
}
```

迁移路径（无需重写页面）：
- **v1（现在）**：`glob()` loader 读 `content/anime/*.md`，全手动。
- **v2（脚本预拉）**：构建前跑脚本调 Bangumi → 产出 `anime.json`，集合改 `file()` loader 或生成 Markdown；手动条目与 API 条目共存（靠 `bgmId` 关联，缺省即纯手动）。
- **`lib/anime.ts` 的 `toView` 负责「API 元数据 + 手动状态」合并**，页面感知不到源变化。

## 岛屿放置（islands/）

| 交互 | 实现 | 指令 | 理由 |
|------|------|------|------|
| 初始主题应用 | `<head>` **内联同步脚本**（非岛屿） | 无 | 防 FOUC（P3）——绝不放岛屿 |
| 主题切换按钮 | 原生 `<script>` 或极小 Preact 叶子 | `client:idle` | 只翻 class + 写 localStorage |
| 标签/分类筛选 | 首选 `getStaticPaths` 静态页；客户端仅做 `data-tags` show/hide 增强 | `client:visible` | 分类页可直达、有 SEO（P7） |
| 追番评分/进度/状态展示 | Preact 叶子岛屿 | `client:visible` | 真有交互态时才用 |
| 跨岛屿共享（主题/当前筛选） | `@nanostores/preact` | — | 多岛屿共享一份状态 |

原则：默认全静态 `.astro`；岛屿是最小叶子，收 props、不拉数据（P6）。

## Architectural Patterns

### Pattern 1: 薄数据访问层（Repository-lite）
**What:** `lib/*.ts` 封装 `getCollection` + 过滤/排序/视图映射，页面只依赖它。
**When:** 数据源未来可能变（番剧），或多页复用同一取数逻辑。
**Trade-off:** 多一层间接；但换 loader 时页面零改动，值得。工具库同样受益（draft 过滤、标签聚合集中）。

### Pattern 2: 构建期静态分类页
**What:** `tools/tag/[tag].astro` 用 `getStaticPaths` 为每个标签预生成静态页。
**When:** 分类/标签浏览（表桩需求）。
**Trade-off:** 标签多则页面多，但都是零 JS 静态、SEO 友好，远优于客户端渲染分类。

### Pattern 3: 内联主题脚本 + 岛屿切换分离
**What:** 初始主题在 `<head>` 同步决定；切换按钮才是岛屿。
**When:** 亮/暗主题（表桩）。
**Trade-off:** 两处逻辑，但唯一能消除 FOUC/水合不匹配的方式（P3）。

## Anti-Patterns

### 整页岛屿化 / 到处 client:load
**Do instead:** 默认 `.astro` 静态，最小叶子岛屿 + `client:visible`（P6）。

### 页面直接 `getCollection` 并散落过滤逻辑
**Do instead:** 走 `lib/*.ts`，draft 过滤/排序/视图映射集中一处（利于番剧换源）。

### 番剧字段扁平混装、无 `bgmId`
**Do instead:** 元数据/状态分层 + 稳定 ID（P1），保住 API 迁移路径。

## 建议构建顺序（roadmap 输入）

依赖驱动，先地基后模块，工具库优先于追番（PROJECT.md 优先级）：

1. **脚手架 + 内容建模** — `create astro`、`astro add tailwind mdx preact sitemap`、`content.config.ts` 两集合 schema（含番剧分层字段）、`astro.config` 设 `site` + `image.remotePatterns`。落实 P2/P1 数据契约。
2. **基础布局 + 主题系统** — `BaseLayout`、`<head>` 内联主题脚本、Tailwind `@theme` + `@custom-variant dark`、导航壳。**先于任何内容模块**，定岛屿最小化原则（P3/P6）。
3. **工具库模块（核心，优先）** — `lib/tools.ts`、列表/网格、`[...slug]` 详情（首次用 `astro:assets`）、`tag/[tag]` 静态分类页。落实 P4/P7。
4. **追番模块** — `lib/anime.ts` 薄封装（可插拔关键）、按 status 分组列表、详情、评分/进度展示岛屿。数据层设计先于 UI（P1）。
5. **二次元视觉打磨** — 色板、字体子集化、卡片/徽章、暗色对比度。放最后避免过早陷入样式（P5/P8）。
6. **上线收尾** — sitemap/canonical/OG、404、筛选空状态、外链 `rel="noopener noreferrer"`、Lighthouse 核验。

未来里程碑（非本次）：Bangumi API 接入——只改 `lib/anime.ts` + loader，pages 不动。

## Integration Points

| Service | Pattern | Notes |
|---------|---------|-------|
| Bangumi API（未来） | 构建前脚本预拉 → JSON/MD → `file()`/`glob()` loader | 现在只对齐 schema 字段，不写运行时集成（P8） |
| Vercel/Netlify | git push 自动构建，`output:'static'` 免适配器 | 设 `site`；Node 22+ 构建镜像 |
| Bangumi 图床 | `image.remotePatterns` 预授权 | v1 未用也先配（P4） |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| pages ↔ 数据 | 只经 `lib/*.ts`，不直接 `getCollection` | 保番剧换源可插拔 |
| pages ↔ 岛屿 | props 单向下传；跨岛屿用 nanostores | 岛屿不拉数据 |
| 工具库 ↔ 追番 | 并列独立，各自 `lib` + pages，仅共享 layout/components | 低耦合，可分阶段交付 |

## Sources

- 兄弟 STACK.md（同批，HIGH）—— Astro 7 / Content Layer / 岛屿 / schema 分层，本文结构与其对齐
- 兄弟 PITFALLS.md（同批，HIGH）—— P1 数据可迁移、P3 主题、P4 图片、P6 岛屿、P7 筛选、P8 过度工程
- Astro 官方文档（Context7 `/withastro/docs`，经 STACK/PITFALLS 核实）—— 目录约定、`getStaticPaths`、`astro:content`、islands 指令 —— HIGH

---
*Architecture research for: 二次元风格个人内容站（Astro 7 + Tailwind v4 静态站）*
*Researched: 2026-07-14*
