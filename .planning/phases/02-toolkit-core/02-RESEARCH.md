# Phase 2: 工具库（核心）- Research

**Researched:** 2026-07-15
**Domain:** Astro 7 静态内容路由（`getStaticPaths` / `[slug]` / `[category]` / `[tag]`）+ MDX `<Content />` 渲染 + Zod schema transform + 复用既有 EntryCard/BaseLayout 组装工具库五条需求（TOOL-01..05）
**Confidence:** HIGH（全部 API 与 01-RESEARCH.md HIGH 结论一致；Content Layer `.render()`、EntryCard 签名、BaseLayout props、lib/tools.ts 收口均从；本阶段零新依赖；与 D-01..D-14 及 UI-SPEC 契约逐条核验无冲突）

> 本文只补 Phase-2 落地细节。栈版本/主题/字体/Content Layer/SEO/scaffold 详见既有研究，**不重复**。本阶段在 01-RESEARCH 与 `content.config.ts`/`lib/tools.ts`/`EntryCard.astro`/`BaseLayout.astro` 现状上**扩展**，不重构、不破坏 anime 集合。

<user_constraints>
## User Decisions (excerpted from 02-CONTEXT.md D-01..D-14; planner/executor 均不得推翻)

- **D-01** 主页纯卡片网格，不复设列表视图切换；复用 `EntryCard.astro` 保持视觉一致。
- **D-02** 固定排序：沿用 `getAllTools()` 按 `title.localeCompare('zh')`；v1 无排序 UI。
- **D-03** 响应式 1→2→3 列（`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8`）。
- **D-04** **整卡可点**→`/tools/[slug]`；卡片内独立外链图标按钮 `target=_blank rel="noopener noreferrer"` + `aria-label="{工具名} 外链"`，布局隔离（按钮在外层 `<a>` 之外，不依赖 stopPropagation）。
- **D-05** 分类走静态页 `/tools/category/[category]`（`getStaticPaths`）。
- **D-06** 标签走静态页 `/tools/tag/[tag]`（`getStaticPaths`）；工具多 tag 出现在多张标签页；**不设客户端勾选 island**。
- **D-07** 标签值自由录入，schema `.transform()` 归一化（trim / 小写 / 去重），避免「js/JS/Js」分裂；不约束枚举。
- **D-08** 分类/标签档案页一律复用主页网格 + BaseLayout，仅替换数据集 / 标题 / 面包屑 / 空状态。
- **D-09** 详情路由 `/tools/[slug]`（planner 定 slug 派生；非 ASCII URL-encode；唯一性校验）。
- **D-10** 卡片 `href` = 详情页；外链按钮 `target=_blank`（TOOL-05 锁死 noopener）。
- **D-11** 详情页底部 nav：「← 返回工具库」+ 同 category 相关 1–2 卡片（由 lib 暴露 `getRelated`；不足整区 hidden）。
- **D-12** MDX 心得/优缺点走 `<Content />` 渲染；schema 不做结构化字段。
- **D-13** 主页自上而下：summary line + 分类 pill 行（可横滚）+ 标签云 + 全部工具网格 + Footer。
- **D-14** 不分页，一页全列出（D-14）。

**Claude's Discretion（由 planner 在 PLAN 落定、记录）：**
- D-09 slug 派生（推荐 `encodeURIComponent(title)`，冲突追加 `-2`）。
- D-11 相关工具选取（推荐同 category 按 title 序取前 2、排除当前 slug）。
- 标签云排序（推荐按出现次数降序）。
- 详情页 title 中段（推荐 `{名} · 工具库 · 初曦的窝`）。

**Deferred Ideas:** 无。全部决策服务 TOOL-01..05。
</user_constraints>

<phase_requirements>
## Phase Requirements → Research Support

| ID | Description | Research Support |
|----|-------------|------------------|
| TOOL-01 | 卡片网格浏览全部工具（名/描述/外链/标签） | §Implementation: TOOL-01 — EntryCard 改造 + 主页网格骨架 + D-02 固定排序 |
| TOOL-02 | 点击进入独立图文详情页（MDX） | §Implementation: TOOL-02 — `[slug].astro` + `<Content />` 渲染 + breadcrumb + 底部 nav |
| TOOL-03 | 按分类浏览（静态页） | §Implementation: TOOL-03 — `[category].astro` 复用主页骨架 + `getToolsByCategory` |
| TOOL-04 | 按标签筛选（静态页） | §Implementation: TOOL-04 — `[tag].astro` + `getToolsByTag` + tags transform 归一化 |
| TOOL-05 | 外链 `target=_blank rel=noopener noreferrer` | §Implementation: TOOL-05 — EntryCard 外链按钮 rel 强制 + 布局隔离 |
</phase_requirements>

## Summary

本阶段是 01 地基上的纯粹扩展层。数据侧仅在 `content.config.ts` 的 `tools.tags` 加一行 zod transform、在 `lib/tools.ts` 增三个纯读取函数；UI 侧改造 `EntryCard.astro` 支持「整卡 inner `<a>` + 外(position-overlay)层 `<a>`」双层链接，复用 `BaseLayout` 首页骨架铺三张新静态档案页 + 一张 `[slug]` 详情页。**全程无新 npm 依赖、无 Preact 岛屿、不触碰 anime 集合及其 footer**。全部路由经 `getStaticPaths` 预生成，契合 01-RESEARCH 静态优先与 P7/P8 不过度工程。

**Primary recommendation:** 按「schema transform → lib 增读函数 → EntryCard 双层链接改造 → 主页骨架 page → 三张档案页 → 详情页 + `<Content />` 渲染 + 底部 nav → offline hand-rolled prose 样式 → build + check + 推送 Vercel」顺序落地。

## Technical Landscape

### 1. Astro 7 静态内容路由（getStaticPaths + [dynamic]）

Astro 静态路由模式对分类/标签/详情均适用：

```ts
// src/pages/tools/[slug].astro — 详情页
export async function getStaticPaths() {
  const tools = await getAllTools();
  return tools.map((t) => ({
    params: { slug: slugOf(t.data.title) },
    props: { entry: t },
  }));
}
// src/pages/tools/category/[category].astro — 分类档案
export async function getStaticPaths() {
  const tools = await getAllTools();
  const cats = [...new Set(tools.map((t) => t.data.category))];
  return cats.map((category) => ({ params: { category }, props: {
    items: tools.filter((t) => t.data.category === category), category,
  }}));
}
// src/pages/tools/tag/[tag].astro — 标签档案（tags 已 transform 归一化）
export async function getStaticPaths() {
  const tools = await getAllTools();
  const tagMap = new Map<string, typeof tools>();
  for (const t of tools) for (const tag of t.data.tags)
    tagMap.set(tag, [...(tagMap.get(tag) ?? []), t]);
  return [...tagMap.entries()].map(([tag, items]) => ({ params: { tag }, props: { items, tag } }));
}
```

要点：
- `params` 中的字符串在 URL 里由 Astro **自动 decode**；CJK `encodeURIComponent` 与自动 decode 对称，canonical/planner 校验即可（§Risk R-1）。
- 动态段文件名 `[slug].astro` 会捕获 `/tools/...` 下任何子路径；须确保 `/tools/index.astro`、`/tools/category/[category].astro`、`/tools/tag/[tag].astro` 这些更具体的静态/显式路由写在文件里即优先匹配（Astro 静态路由优先于动态段，与顺序无关）。
- `props` 直接传入过滤后的 items，页面内不再调 `getCollection`，与 lib 收口一致。

### 2. MDX `<Content />` 渲染（Content Layer render API）

Astro 7 内容条目通过 `.render()` 异步返回 `{ Content, headings, remarkPluginFrontmatter }`：

```astro
---
// src/pages/tools/[slug].astro
import type { RenderResult } from 'astro:content';
interface Props { entry: { render(): Promise<RenderResult> } /* ... */ }
const { entry } = Astro.props;
const { Content } = await entry.render();
---
<article class="prose">
  <Content />
</article>
```

要点：
- **这是 MDX 正文渲染的唯一干净路径**：MDX 里嵌入的 `<Image>`、自定义组件由 `<Content />` 自动解析（`astro:assets` 已配置、`image.remotePatterns` 仅 lain.bgm.tv 不影响工具外链图；若工具 MDX 要嵌外部图，planner 需在 `remotePatterns` 追加白名单——v02 建议暂不上外部图以省扩展）。
- `headings` 可选用于生成目录，本阶段 v1 不用（UI-SPEC 无目录需求，D-12）。
- `.render()` 需在页面 frontmatter 内 `await`，不支持组件层调用。

### 3. Zod Schema transform 归一化（tags）

在 `content.config.ts` 的 `tools` 集合 schema，把现有 `tags: z.array(z.string()).default([])` 改为链式 transform：

```ts
tags: z
  .array(z.string().transform((s) => s.trim().toLowerCase()))
  .transform((arr) => [...new Set(arr)])
  .default([]),
```

要点：
- 内层逐元素 `trim + lowercase`，外层 `Set` 去重，保证「js/JS/Js/`  js  `」归一为 `["js"]`（D-07）。
- **不得改动 anime 集合**：只改 `tools` 内 `tags` 那一行，`defineCollection` 内其他字段保留原位。
- transform 在**构建期**执行（Content Layer 校验），零运行时开销；归一化后的值直接用于标签云、标签档案页。
- transform 后运行 `npx astro sync`（Phase 2 首次 schema 改动触发，类型推导自动更新）。

### 4. EntryCard 双层链接（整卡 inner `<a>` + 外层 absolute `<a>`）

现状 `EntryCard.astro` 是**整张卡单个 `<a>`**。Phase 2 必须同时支持：(1) 整卡点击进入详情；(2) 卡内外链图标按钮 `target=_blank` 跳转外部站点——两个 `<a>` 语义上互斥（HTML 不允许嵌套交互式 `<a>`，解析器会直接闭合第一个，导致 DOM 异常 + 读屏双重激活）。

**02-UI-SPEC D-04 推荐方案（取此方案，零 JS）：**

结构改为**相对定位容器 + 整卡内层 `<a href=详情>` + 右上角 absolute 外层 `<a href=外部 target=_blank>`**：

```astro
<!-- EntryCard.astro 改造后骨架 -->
<article class="relative ...">
  <a href={detailHref} class="flex items-start gap-4 p-6 ...">  <!-- 当前整卡主体，包所有文本/icon -->
    <span class="icon-bg"><Icon name={icon} /></span>
    <span class="min-w-0 flex-1">
      <span class="flex justify-between ...">
        <span class="font-display text-...">{title}</span>
        <!-- 注意：不再在此放图标按钮！按钮移到外层 absolute -->
      </span>
      <span class="mt-2 block ...">{description}</span>
    </span>
    <Icon name="ph:arrow-right" ... />  <!-- hover 上浮保留 -->
  </a>
  {externalUrl && (
    <a href={externalUrl} target="_blank" rel="noopener noreferrer"
       aria-label={`${title} 外链`}
       class="absolute right-4 top-4 inline-flex min-h-11 min-w-11 ...">
      <Icon name="ph:arrow-square-out" class="size-5 ..." />
    </a>
  )}
</article>
```

要点（Ponytail 决策链 — 依次排除）：
- **不需要 Preact/JS stopPropagation**：按钮是独立 `<a>`、在整卡 `<a>` 的外层兄弟位置，无嵌套，原生行为即可（满足 D-4 便携）。
- **不需要新卡片组件**：直接在 `EntryCard.astro` 加 `url`/`external` prop 改造，节省一个文件。
- **不需要绝对定位时的额外可点区规避**：absolute 覆盖在卡片右上角 padding 区，与文本区不重叠；整卡 `<a>` 右上角保持 padding 留白（`pr-10` 给按钮让位）。
- 外链按钮 `aria-label` 强制 ≥ 工具名+「外链」（UI-SPEC Copywriting）。
- 如 `external` 为 falsy，整卡 `<a>` 直接就是唯一入口（兼容 Phase 1 用法（首页两入口卡无外链，无按钮）。

### 5. 零有状态岛屿与静态筛选（vs. 客户端 DOM 过滤）

01-RESEARCH 曾考虑 v1 客户端 `data-tags` show/hide 过滤。本阶段按 D-05/D-06 **改为静态档案页**：
- **取舍**：书签/分享一条 URL 即定位到具体分类/标签；构建期一次生成；零 JS。代价是 URL 路径多几层（`/tools/category/效率工具` 等），完全可接受。
- **不设 Preact island**：即便未来 v1.x 加客户端即时搜索（SEARCH-01），也不在本次范围。
- 01-RESEARCH 的「静态分类页 + 客户端 DOM 过滤 v1」蓝图本阶段**升级为纯静态**，蓝图不冲突、更纯粹。

### 6. MDX prose 排版 — Hand-rolled vs @tailwindcss/typography

**`@tailwindcss/typography` 未安装**，且 CLAUDE.md 栈未列。

Ponytail 决策：
- **不需要新依赖**：UI-SPEC 的 body / display token 已覆盖 MDX 输出最常用语义（h2/h3 用 `--font-display` 28px、正文 `--font-body` 16px、`code` 块 `--color-surface-muted` 底 + `--radius-sm`、链接 `--color-link`）。手写一个 `.prose` 工具层（约 40 CSS 行，利用 Tailwind v4 `@layer utilities` + `@apply`）即够。
- **typography 插件备选**：`npm i -D @tailwindcss/typography` + `plugins: [typography]`，仅当 MDX 内容出现大量嵌套列表/复杂表格等边缘场景再引入。v1 数十条、简单 Markdown 下 YAGNI。
- Hand-rolled 实现骨架：
```css
@layer utilities {
  .prose { max-width: 48rem; margin-inline: auto; color: var(--color-text); }
  .prose :where(h2,h3,h4) { font-family: var(--font-display); font-weight: 600; margin-block: 1.6em 0.6em; }
  .prose h2 { font-size: 1.5rem; line-height: 1.3; }
  .prose h3 { font-size: 1.25rem; line-height: 1.4; }
  .prose :where(p,ul,ol) { margin-block: 1em; line-height: 1.7; color: var(--color-text); }
  .prose ul { list-style: disc; padding-inline-start: 1.4em; }
  .prose a { color: var(--color-link); text-decoration: underline; }
  .prose :where(code:not(pre code)) { background: var(--color-surface-muted); border-radius: var(--radius-sm); padding: 0.1em 0.35em; }
  .prose :where(pre) { background: var(--color-surface-muted); border-radius: var(--radius-md); padding: 1rem; overflow-x: auto; }
  .prose :where(img) { border-radius: var(--radius-lg); }
}
```
加在 `src/styles/global.css`（`@import "tailwindcss"` 之后即可；Tailwind v4 接受 `@layer` 在任何位置声明）。

### 7. 数据访问边界（lib 收口、anime 中立）

01-RESEARCH Pattern 1/ARCHITECTURE：页面一律经 `lib/*.ts` 读取，不直接 `getCollection`。本阶段扩展：

```ts
// src/lib/tools.ts — 在 getAllTools() 基础上增
export async function getToolsByCategory(category: string) {
  return (await getAllTools()).filter((t) => t.data.category === category);
}
export async function getToolsByTag(tag: string) {
  const target = tag.toLowerCase();
  return (await getAllTools()).filter((t) => t.data.tags.includes(target));
}
export async function getRelated(category: string, excludeSlug: string, n = 2) {
  return (await getAllTools())
    .filter((t) => t.data.category === category && slugOf(t.data.title) !== excludeSlug)
    .slice(0, n);
}
export function slugOf(title: string): string {
  return encodeURIComponent(title);
}
```

要点：
- **全部排序统一走 `getAllTools()`** 的 title zh localeCompare，子读取函数只做 filter/slice，保证主页/详情/档案四页排序一致（D-02）。
- `slugOf` 统一在 lib 导出，getStaticPaths/pages/lib 共用一把派生；**anime 集合一条不改**（lib/anime.ts、content.config.ts 的 anime 块只读）。
- `getStaticPaths` 也经 lib 拿数据（tools 侧），保持收口。

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 数据 schema 校验（tags transform / slug 派生） | Build（Content Layer + Zod） | — | 构建期归一化，零运行时（D-07） |
| 数据读取 / filter / 排序 | Build（`lib/*.ts`） | — | 页面一律经 lib，收口换源（01-RESEARCH Pattern 1） |
| 静态分类/标签/索引页渲染 | Build（Astro `getStaticPaths`） | — | D-05/D-06 静态优先，P8 |
| MDX 图文详情渲染 + `<Image>` | Build（Astro 组件 + `astro:assets`） | — | D-12 可长可短图文；构建期圖片优化（P4） |
| 安全外链跳转 | Browser（原生 `<a target=_blank rel=noopener>`） | — | TOOL-05 / STRIDE T-01-03-02；纯原生 |
| 卡片 hover/焦点交互 | Browser（`prefers-reduced-motion` guard + `:focus-visible`/`:hover`） | — | 零 Preact，纯 CSS（P6） |
| sitemap 收录 `/tools/**` | Build（`@astrojs/sitemap`） | — | 新增路由自动进 sitemap；只需 page `site` 存在（INFRA-06 已实现） |
| 部署/CDN | CDN（Vercel static） | — | 01 已连，Phase 2 仅 build 出静态产物 |

## Implementation Approach per Requirement

### TOOL-01 — 卡片网格浏览全部工具（名/描述/外链/标签）

**涉及：`src/pages/tools/index.astro` + `EntryCard.astro` 改造 + `BaseLayout`。**

1. 改 `EntryCard.astro` 接口与结构（§4 双层链接）：
   - Props 增 `externalUrl?: string`（默认 undefined） + `href` 保留 = 详情页 path；`emphasis`/`badge` 保留兼容 Phase 1 入口卡。
   - 外层由 `<a>` 改为 `<article class="relative">`（整卡 <a> 包在此 article 内，外链按钮移出至 article 绝对定位层）。
   - 内层 `<a href={href}>` 包当前所有视觉内容（icon + title + summary + arrow）。
   - 整卡 `<a>` 加 `pr-10` 给右侧按钮留白；article wrapper 加 `relative`。
   - 内层 `<a>` 保留 Phase 1 全部 class：`rounded-[--radius-xl]` / `bg-[--color-surface]` / `shadow-[--shadow-soft]` / `p-6` / `transition` / `motion-safe:-translate-y-0.5`；hover 上浮保留。
   - 新增绝对定位外链按钮（仅当 externalUrl 存在）：
     ```astro
     {externalUrl && (
       <a href={externalUrl} target="_blank" rel="noopener noreferrer"
          aria-label={`${title} 外链`}
          class="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-[--radius-md] text-[--color-text-muted] transition hover:text-[--color-primary] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]">
         <Icon name="ph:arrow-square-out" class="size-5" aria-hidden="true" />
       </a>
     )}
     ```
   - 兼容：Phase 1 首页入口卡无 `externalUrl` 时不渲染按钮，行为回归 Phase-1 整卡单 `<a>`（视觉等价，article 仅包一层 hover 由内层 a 驱动）。
2. 改 `src/pages/tools/index.astro`（01 占位空状态迁为完整主页）：
   - 骨架搬迁 01 占位空状态，替换为 Section 序列（D-13）。
   - 各 Section 经 `getAllTools()` / 聚合（见下）。
   - summary line：`共 {tools.length} 件工具 · 慢慢整理中～`（02-UI-SPEC Copywriting 锁定）。
   - 分类 pill 行：`[...new Set(all.map(t=>t.data.category))]` → 渲染为 `<a href="/tools/category/{enc}">` + 首项固定「全部工具」href `/tools`；active 项 `aria-current="page"`。
   - 标签云：展开所有 tags（transform 归一后）→ `Map<tag, count>` → 按 count 降序 → `<a href="/tools/tag/{enc}">` chip。
   - 网格：`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8` + `EntryCard` 填充。
   - Empty state：tools.length===0 时复 01 Empty state 形态 + CTA。

### TOOL-02 — 独立图文详情页（MDX）

**涉及：`src/pages/tools/[slug].astro`。**

1. `getStaticPaths` 遍历 `getAllTools()`，`params.slug = slugOf(entry.data.title)`（D-09 discretionary；唯一性由 planner build 期 assert 校验，见 R-2）。
2. `props.entry` 直接传入；页面内 `const { Content } = await entry.render();`；包在 `<article class="prose">`（§6 hand-rolled）。
3. 面包屑：`<nav aria-label="路径">` > Home（`/`）→ `工具库(/tools)` → 当前 `工具名(无链接)` 用 `ph:caret-right` 分隔（`aria-hidden`）；当前项不加链接。
4. Hero：display 28px tool name + 外链按钮（`<a target=_blank rel=noopener>`，视觉同 EntryCard 外链按钮风格）+ meta 13px `分类 • 标签`。
5. MDX Body：`<article class="prose max-w-[48rem] mx-auto"><Content /></article>`（~70 CPL）。空内容（frontmatter 有、body 为空）回退文案 `这篇介绍还没写完…`（02-UI-SPEC）。
6. 标签 chip 行：该工具 tags → `<a href="/tools/tag/{enc}">`。
7. 底部 nav（D-11）：分割线 `--color-border`；左侧 `← 返回工具库` (`/tools`)；右侧「同分类的其他工具」由 `getRelated(category, slug)` 取 1–2 张 EntryCard（不足整区 `hidden`）。
8. SEO title：`{title} · 工具库 · 初曦的窝`（planner 选 discretionary 中段）；description = `summary` 自动生成。
### TOOL-03 — 按分类浏览（静态页）

**涉及：`src/pages/tools/category/[category].astro`。**

1. `getStaticPaths`：枚举 `getAllTools()` 去重 category → `/tools/category/{enc}`。
2. 复用 TOOL-01 主页网格 + BaseLayout，仅替换数据集/标题/面包屑/空状态：
   - breadcrumb「工具库 / 分类 / {名}」
   - Heading 24px display `分类：{category}` + meta 13px `（{N} 个工具）`
   - 数据集 = `getToolsByCategory(category)`
   - 空状态：02-UI-SPEC Copywriting 锁定「`这个分类还没住进任何工具 (｡•́︿•̀｡)`」，CTA `返回工具库`
3. 分类 pill 档案页的 pill 当前项加 `aria-current="page"`（由 `Astro.url.pathname` 与归档路径比较判定 active 态）。
4. 为最小化档案页重复代码，planner 可在 `pages/tools/_ToolboxPage.astro` 抽一个「数据集 + Heading + 网格 + 面包屑」的泛型壳（仅分类/标签两处复用，不提前泛化到 anime）。

### TOOL-04 — 按标签筛选（静态页）

**涉及：`src/pages/tools/tag/[tag].astro` + `content.config.ts` tags transform。**

1. 先改 `content.config.ts`：`tools.tags` 加 transform（§3）→ `npx astro sync` 刷新类型。该改动**只动 tools block 一行，anime block 完整保留**。
2. `getStaticPaths`：用 §1 的 `Map<string, tools[]>` 聚合标签档案（tags 已归一化，直接做 key；中文 tag 同样 `encodeURIComponent` 进 params）。
3. 复用 TOOL-01 主页档案页骨架：
   - breadcrumb「工具库 / 标签 / {tag}」
   - Heading `标签：{tag}` + meta 13px `（{N} 个工具）`
   - 数据集 = `getToolsByTag(tag)`
   - 空状态：Copywriting 锁定「`还没有工具打过这个标签～`」，CTA `返回工具库`
4. 标签云 / 标签档案 chip 排序：按出现次数降序（Claude's Discretion 默认；planner 记录在 PLAN）。
5. 标签 chip `#` 文本 `aria-hidden`，命中区 ≥32px；当前标签对应 chip `aria-current="page"`。

### TOOL-05 — 外链 target=_blank rel=noopener noreferrer

**涉及：EntryCard 外链按钮 + 详情页 hero 外链按钮 + 任意动态生成 `<a>`。**

1. 两处视觉位置（整卡 absolute 按钮、detail hero 外链按钮）共享同一 class：`min-h-11 min-w-11`、`ph:arrow-square-out`、`target=_blank`、`rel="noopener noreferrer"`、`aria-label="{工具名} 外链"`。
2. 在 PLAN/REVIEW 阶段 grep 校验：本阶段新写 `<a` 凡带 `target="_blank"` 必须匹配 `rel="noopener noreferrer"`；违反直接 reject（02-UI-SPEC Requirement Traceability 表 TOOL-05 条目 / STRIDE T-01-03-02）。
3. 详情页 MDX 正文中用户手撰外链不受代码约束，属内容层，planner 不处理。
## Risks & Mitigations

| ID | 风险 | 触发条件 | 缓解 |
|----|------|----------|------|
| R-1 | **CJK slug URL 不对称**：planner 用 `encodeURIComponent(title)`；Astro 自动 decode params；若多处重复 encode 导致 `%25xx` 双重编码，canonical/sitemap 不一致。 | `slugOf` 或 `<a href>` 生成时二次编码。 | `slugOf` 仅编码一次；planner 在 PLAN 显式标注「路径生成后 `<a href>` 不二次 encode」；sitemap 由 `@astrojs/sitemap` 自动从实际路由生成（跟随 `site`）。 |
| R-2 | **同名工具 slug 冲突**：两工具 title 相同 → `getStaticPaths` 出重复 slug，后者覆盖前者，页面访问 404/重叠。 | 内容端写重 title。 | planner 在 PLAN 加 build 期唯一性 assert（`new Set(slugs).size === slugs.length`），违背强制报错；内容审查校验（建议种子内容维护小手册记录已用 title）。 |
| R-3 | **双层链接 a11y 回归**：嵌套两个交互 `<a>` 时浏览器按 HTML 规则自动闭合第一个，DOM 异常 + 屏幕阅读器双重激活。 | planner 在整卡 `<a>` 内再嵌套外链按钮 `<a>`。 | 必须使用 02-UI-SPEC D-04 推荐「`article.relative` + 内层 `<a>`（整卡） + 外层 absolute 兄弟 `<a>`（外链）」，禁止嵌套；review 时 grep 检查 `<a ...>...<a ` 不存在二级嵌套。 |
| R-4 | **EntryCard 改造破坏 Phase 1 入口卡**：01 已发布首页用 `<EntryCard href="/tools" …>`，外层 `a→article` + 结构改动引入 CLS/行为回归。 | 改外层结构、hover 驱动元素变化。 | 入口卡调用不传 `externalUrl`，回归视觉等价；planner Phase 2 验收含「首页渲染与 Phase 1 视觉 diff 对比 + EntryCard 无外链时 html 与 Phase 1 等价断言」。 |
| R-5 | **anime 集合被误改**：`content.config.ts` 改动同时涉及 anime。 | 改 tools schema 时误改 anime 块。 | Edit 严格 scope 在 tools block，Phase 2 不碰 anime block，planner review 仅 touch 区域验证 + `git diff --stat` 只动 tools 一行。 |
| R-6 | **transform 后既有 seed 标签外壳变化**：raycast.mdx 现有 tags `["效率","macOS","启动器"]` 经 lowercase 后 macOS→macos，标签档案 URL 变为 `/tools/tag/macos`，与手书签 `/tools/tag/macOS` 不一致。 | seed tags 含大写。 | transform 强制 lowercase；planner 更新 raycast.mdx seed tags 为小写一致，`/tools/tag/macos` 与 transform 后数据一致。 |
| R-7 | **MDX `<Image>` 远程白名单**：工具 MDX 嵌外部截图时 `remotePatterns` 仅配 `lain.bgm.tv` → Astro 拒绝构建（`优化远程图片被拒绝`）。 | 详情页 MDX 用外部图。 | v1 走本地图或 Cover field（cover 走 `astro:assets`）；如须远程，planner 在 `astro.config` `remotePatterns` 追加域名白名单（D-07 schema 不阻挡该扩展）。 |

## Recommended Project Structure (Phase 2 adds)

```
src/
  content.config.ts             # + tags transform（tools 块内 only）
  lib/tools.ts                  # + getToolsByCategory / getToolsByTag / getRelated / slugOf
  layouts/BaseLayout.astro      # 不动
  components/
    EntryCard.astro              # 外层改 <article.relative> + 内层 <a> + absolute 外链 <a>
    Breadcrumb.astro             # 新建：通用 <nav aria-label="路径"> 面包屑组件
    EmptyState.astro             # 新建：空状态通用组件（Phase 01 视觉）
    PillRow.astro                # 新建：分类 pill 行（overflow-x-auto / active / href）
    TagCloud.astro               # 新建：标签云 wrap chip
    ToolDetailNav.astro          # 新建：底部 nav（返回工具库 + 相关卡片）
  pages/tools/
    index.astro                  # 迁 01 占位 → 主页（D-13 骨架）
    [slug].astro                 # 新建：图文详情页
    category/[category].astro    # 新建：分类档案（复用主页骨架 + 定制 Heading/面包屑/空状态/数据集）
    tag/[tag].astro              # 新建：标签档案
  styles/global.css              # + @layer utilities .prose（~40 行）
```

ponytail 注：6 新建 + 3 改造 = 9 文件；全部最小必要。EntryCard 改造是单人复用点（不另造工具卡组件）；其余 5 个新建组件每组件 ≤ 30 行、单一职责（Breadcrumb/EmptyState/PillRow/TagCloud 各聚焦，ToolDetailNav 唯一复合体）。不抽「工具箱泛型壳」除非分类+标签真的写出来≥2 处重复 — planner 自定，但倾向抽一个 `_ToolboxArchive.astro` 私有壳控重复。

## Validation Architecture (testable acceptance)

Nyquist 已禁用；下表给 gsd-verifier 手动/合约验收用（与 ROADMAP §Phase 2 success criteria 1:1）。

| # | Acceptance | 验证方式 |
|---|-----------|---------|
| V-1 | 访问 `/tools`，卡片网格列出所有 no-draft 工具；每卡显示 name、summary、外链图标按钮（`target=_blank rel=noopener noreferrer`）、tags chip。 | `npm run build` → `astro check` 零 error；dev server 渲染目视；grep 构建产物 HTML 确认卡片数量 = `getAllTools().length`。 |
| V-2 | 点击进入 `/tools/{slug}` 独立详情页渲染 MDX 正文；底部 nav「← 返回工具库」+ 同分类相关 1-2 个卡片。 | dev 真实跳转；断言面包屑 / `<Content />` 文本 / 底部 nav 出现；相关不足时 nav 区 hidden。 |
| V-3 | `/tools/category/{x}` 列出该分类工具；pill `aria-current` 激活态。 | 访问分类 pill href 着陆档案页；数据集长度 = `getToolsByCategory` 理论数；激活 pill 朗读音读 current。 |
| V-4 | `/tools/tag/{t}` 列出该标签工具；tags 归一后分裂标签合流为一项。 | 写 seed tag 混用 `JS`/`js`/前导空格，断言归一后统一 `/tools/tag/js` 页面包含所有该 key 工具。 |
| V-5 | 所有 `<a target="_blank"` 含 `rel="noopener noreferrer"`（本阶段新增路径内）。 | `grep -rc 'target="_blank"' src/` 与 `grep -rc 'rel="noopener noreferrer"' src/` 数量对齐；planner 验收脚本。 |
| V-6 | anime 集合零改动：`/anime` 行为同 Phase 1，`/tools` 不引入 anime 代码。 | `git diff --stat` 只动 tools 一行 schema；`astro check` 零 schema warning；访问 `/anime` 无再生异常。 |
| V-7 | 响应式 1/2/3 列 + 暗色主题跟随 + FOUC 不重拾。 | 三断点 + 暗色刷新目视，与 01 验收方式同。 |
| V-8 | sitemap 新增 `/tools/**` 路由；title 依 D-02 模式（`{页面} · 初曦的窝` 或 `{名} · 工具库 · 初曦的窝`）。 | `cat dist/sitemap-0.xml | grep /tools` 可追溯所有工具路由；grep `<title>` 确认拼接。 |
## Don't Hand-Roll (本阶段已覆盖)

| Problem | Use Instead |
|---------|-------------|
| slug 派生/编码一致性 | `slugOf()` 单一 lib 函数，所有 pages/components 共用，不内联派生 |
| MDX 正文渲染 | `<Content />` from `entry.render()`，不自行解析 markdown/ast |
| 分类/标签聚合 | 经 `getAllTools()` filter/slice，不造新 query 引擎 |
| 空状态 / 面包屑 / pill / chip 视觉复用 | 4 个单职责 Astro 组件（≤30 行/个），不写重复结构 |
| prose 排版 | hand-rolled `.prose`（Tailwind v4 `@layer utilities`），不引 typography 插件（P8） |
| 外链安全 rel | 模板内联 `rel="noopener noreferrer"`，不写 wrapper helper |
| 分类/标签档案页结构 | 一套「数据集 + Heading + 网格 + 面包屑 + 空状态」壳 ×2，避免三处 copy |

## Sources

- **01-RESEARCH.md（HIGH）** — `.render()/<Content />`、`glob()+image()`、静态分类页蓝图、P7/P8（不过度工程）、BaseLayout SEO、font 子集、`astro-icon ph:*`、lib 收口、EntryCard Phase-1 用法。Phase 2 全部继承不冲突（01 的「静态分类页 + 客户端 DOM 过滤 v1」蓝图在本阶段升级为纯静态，属强化而非违背）。
- **Astro 7 Stable APIs [CITED: 01 HIGH 延续]** — `getStaticPaths` 契约（Astro 自动 decode params，静态段优先于动态段）、`entry.render()` 返回 `{ Content, headings, remarkPluginFrontmatter }`、Content Layer glob loader、zod `.transform` 链。与 01 HIGH 核验一致。
- **02-CONTEXT.md D-01..D-14**（本阶段用户锁 decision）→ 全部映射到 Implementation 契约条目与风险缓解。
- **02-UI-SPEC.md**（刚批视觉契约）→ Component spacing/typography/color/copywriting/motion/a11y 各段落地到 §Implementation TOOL-01..05。项目名已落实「初曦的窝 / chuxisite.vercel.app」。
- **local code（已读）** — `content.config.ts`（tools/anime 双层结构、`bgmId` 预留确认）/ `lib/{tools,anime}.ts`（收口模式 + STATUS_ORDER 常量模板）/ `components/EntryCard.astro`（整卡 `<a>` 现状，改造切入口）/ `layouts/BaseLayout.astro`（`fullTitle?/description?/ogImage?` props + head 内联主题脚本 + FOUC 不动点）/ `pages/tools/index.astro`（01 占位空状态，迁出）/ `styles/global.css`（`@theme` token + `.dark` 覆盖 + `:focus-visible` 基线，`.prose` 注入点）。
- **`@tailwindcss/typography` [VERIFIED: not installed]** — `ls node_modules/@tailwindcss/typography` 不存在，CLI 栈未列，P8 反新增 → 主推 hand-rolled + typography 备选 Ponytail 决策。

## Metadata

**Confidence breakdown:**
- Standard stack / lib / pages 模式：**HIGH** — 零新依赖、全部复用 01 HIGH 核验的 Astro 7 稳定 API 与既有组件/schema。
- 数据契约（tags transform / slug 派生）：**HIGH** — zod `.transform()` 链为标准写法；`encodeURIComponent` + Astro 自动 decode 对称性为构建期契约。
- UI-SPEC 视觉落地：**HIGH** — spacing/typography/copywriting 逐项 02-UI-SPEC 双契约锁定。
- a11y / 安全外链（TOOL-05 / D-04）：**HIGH** — 双层 layout 隔离 + grep 验收脚本 + noopener 强制，对应 STRIDE T-01-03-02。
- planner 自由度（slug 派生细节 / 相关工具选取 / 标签云排序 / title 中段）：**planner 可定** — 已置于 §User Decisions Claude's Discretion 并提供推荐默认。

**Research date:** 2026-07-15
**Valid until:** ~2026-08-14（同 01 迭代复核窗口）

---
*Phase: 02 — 工具库（核心）*
