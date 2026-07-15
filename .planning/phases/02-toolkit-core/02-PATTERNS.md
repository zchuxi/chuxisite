# Phase 02: 工具库（核心）- Pattern Map

**Mapped:** 2026-07-15
**Files:** 13（5 modify + 8 create）
**Scope:** `src/content.config.ts` / `src/lib/tools.ts` / `src/components/EntryCard.astro` / 5 new components + `src/pages/tools/**` / `src/styles/global.css`

---

## 1. File Classification

| # | File | Role | Data Flow | Closest Analog | Match |
|---|------|------|-----------|----------------|-------|
| M-1 | `src/content.config.ts` | content-schema | build-time validation | 自身 tools block（anime block 完整保留；分层技法 ≈ `lib/anime.ts` STATUS_ORDER 常量模板） | exact |
| M-2 | `src/lib/tools.ts` | data-lib | build-time read/filter | `lib/anime.ts`（`getAllAnime` + STATUS_ORDER 模式一对一移植） | exact |
| M-3 | `src/components/EntryCard.astro` | ui-component | props → static HTML | 自身（外层 `<a>` 变 `<article>` 内二层，自突变） | self-mutate |
| M-4 | `src/pages/tools/index.astro` | page | build-time lib read → grid | `pages/index.astro`（lib 读取 + BaseLayout+Header+Footer+EntryCard 组装 + `getAllTools` badge 计数） | exact |
| M-5 | `src/styles/global.css` | stylesheet | build/render token + utility | 自身（`@theme`/`.dark`/`:focus-visible` 已存在，末尾追加 `@layer utilities`） | exact self-append |
| N-1 | `src/components/Breadcrumb.astro` | ui-component | props → nav 标记 | Header.astro 的 `aria-current` + `isActive` 模式（L6, L33–39） | strong |
| N-2 | `src/components/EmptyState.astro` | ui-component | props → static markup | `pages/tools/index.astro` 占位空状态（L7–20）+ `pages/404.astro` main 骨架 | strong |
| N-3 | `src/components/PillRow.astro` | ui-component | props → chip row | Header.astro `<nav>` 主动 `aria-current` pill + 404 CTA button class 复用 | strong |
| N-4 | `src/components/TagCloud.astro` | ui-component | props → chip wrap | PillRow 派生（横滚 vs wrap 区分） | derive from N-3 |
| N-5 | `src/components/ToolDetailNav.astro` | ui-component | props → section | Footer.astro（Divider 区间隔线 + 简单布局） | medium |
| N-6 | `src/pages/tools/[slug].astro` | page | build-time MDX render | `pages/index.astro`（BaseLayout 组装）+ `layouts/BaseLayout.astro` OG props；MDX `<Content />` 无现有代码（按 RESEARCH §2） | high concept |
| N-7 | `src/pages/tools/category/[category].astro` | page | build-time static path | `pages/index.astro` Section 过滤 + Header 导航 `isActive` 判定为 `aria-current` | strong |
| N-8 | `src/pages/tools/tag/[tag].astro` | page | build-time static path | 同 N-7（tags 聚合来自 `getAllTools()` derived Map） | strong |

---

## 2. Extracts by File

### M-1 · `src/content.config.ts` — tags transform

**Analog:** 自身 tools block L6–17（改动范围严格限定 L13 `tags` 一行；anime block L20–40 必须保留）。

**Ponytail scope lock** — RESEARCH §3 指定只改 `tags`，构建期零运行时代价，与 anime 集合解耦。

```ts
// 当前 L13
tags: z.array(z.string()).default([]),

// 改后（zod .transform 链：内层元素 trim+lowercase，外层 Set 去重）
tags: z
  .array(z.string().transform((s) => s.trim().toLowerCase()))
  .transform((arr) => [...new Set(arr)])
  .default([]),
```

**Anime 不动点点（R-5 缓解）：** Edit scope `tools schema block only`；改后 `git diff --stat` 只动 content.config.ts 一行；`npx astro sync` 后类型推导自动刷新。planner 在 PLAN 显式记录此拒绝规则。

### M-2 · `src/lib/tools.ts` — +3 读函数 + slugOf

**Analog:** `src/lib/anime.ts` L1–15（`getCollection` → filter draft → sort → return 模式一对一移植）。现有 tools.ts L1–9 已具 `getCollection('tools', …)` + title zh localeCompare 排序基底，新函数只做 filter/slice 不再自造排序（RESEARCH §4 D-02）。

```ts
import { getCollection } from 'astro:content';   // 同 anime.ts 风格
// getAllTools 已存在 L5–9，不重写

export function slugOf(title: string): string {
  return encodeURIComponent(title);               // D-09 唯一出口，pages + components 共用
}
export async function getToolsByCategory(category: string) {
  return (await getAllTools()).filter((t) => t.data.category === category);
}
export async function getToolsByTag(tag: string) {
  const target = tag.toLowerCase();               // 与 M-1 schema transform lowercase 对齐
  return (await getAllTools()).filter((t) => t.data.tags.includes(target));
}
export async function getRelated(category: string, excludeSlug: string, n = 2) {
  return (await getAllTools())
    .filter((t) => t.data.category === category && slugOf(t.data.title) !== excludeSlug)
    .slice(0, n);                                 // D-11 取 1–2；不足自然返回 ≤n（空则 hidden）
}
```

`getStaticPaths` 也经 lib 拿数据（tools 侧），保持收口（RESEARCH §7）。`slugOf` 单一导出为最大约束：所有 href 派生必须经此函数（R-1 缓解）。

### M-3 · `src/components/EntryCard.astro` — 双层链接改造

**Analog:** 自身 L1–59 现有整卡 `<a>` 结构。

**关键设计（RESEARCH §4 D-04 推荐方案，Ponytail 已通过取用，零 JS）：**

外层 `<a>` → **`<article class="relative ...">`**；内层包所有视觉内容的原 `<a>` 改 `href={detailHref}`（指向 `/tools/[slug]`），并加 `pr-10` 给按钮让位；右上角追加 absolute 兄弟 `<a>` 外链按钮（仅当 `externalUrl` 存在时渲染）。

```astro
--- ...
interface Props {
  href: string;
  title: string;
  description: string;
  icon: string;
  emphasis?: boolean;
  badge?: string;
  externalUrl?: string;            // 新增：外链 URL，undefined 时不渲染按钮 → 兼容 Phase 1 入口卡
}
const { href, title, description, icon, emphasis = false, badge, externalUrl } = Astro.props;
---

<article class="relative group flex items-start gap-4 rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] transition-transform duration-150 motion-safe:hover:-translate-y-0.5 {emphasis ? 'border-2 border-[var(--color-primary)]' : 'border border-[var(--color-border)]'}">
  <a href={href} class="flex items-start gap-4 pr-10">            <!-- 整卡主体，pr-10 让位 -->
    <span
      class="grid size-12 shrink-0 place-items-center rounded-[var(--radius-full)]"
      style={`background: color-mix(in oklab, var(--color-primary) ${emphasis ? 18 : 12}%, transparent);`}
    >
      <Icon name={icon} class="size-6 text-[var(--color-primary)]" aria-hidden="true" />
    </span>
    <span class="min-w-0 flex-1">
      <span class="flex items-center justify-between gap-2">
        <span class="flex min-w-0 items-center gap-2">
          <span class="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">{title}</span>
          {badge && <span class="shrink-0 rounded-[var(--radius-full)] px-2 py-0.5 text-xs font-semibold text-[var(--color-primary)]" style="background: color-mix(in oklab, var(--color-primary) 12%, transparent);">{badge}</span>}
        </span>
        <Icon name="ph:arrow-right" class="size-5 shrink-0 text-[var(--color-text-muted)] transition-transform duration-150 motion-safe:group-hover:translate-x-1" aria-hidden="true" />
      </span>
      <span class="mt-2 block text-[var(--color-text-muted)]">{description}</span>
    </span>
  </a>

  {externalUrl && (
    <a
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${title} 外链`}
      class="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] transition hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
    >
      <Icon name="ph:arrow-square-out" class="size-5" aria-hidden="true" />
    </a>
  )}
</article>
```

**Phase 1 兼容（R-4 缓解）：** `pages/index.astro` 两处 `<EntryCard href="/tools|/anime" ...>` 无 `externalUrl`，按钮不渲染 → 视觉回归 Phase 1 整卡单 `<a>`。hover 驱动 class 从原 `<a>` 迁到 `<article>` 上。planner 验收含「首页与 Phase 1 渲染 html diff 等价断言」。

**安全约束（TOOL-05 / STRIDE T-01-03-02 / V-5）：** 所有带 `target="_blank"` 的 `<a>` 必须含 `rel="noopener noreferrer"`——本文件外链按钮即其中之一，详见 §V-5 grep。

### M-4 · `src/pages/tools/index.astro` — 主页骨架迁出 01 占位

**Analog:** `src/pages/index.astro` L1–42（lib 读取 + BaseLayout+Header+Footer+EntryCard 组装 + `getAllTools` badge 计数 模式）。

**Baseline 骨架（复用 pages/index.astro 模式）：**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import EntryCard from '../../components/EntryCard.astro';
import { getAllTools, slugOf } from '../../lib/tools';

const tools = await getAllTools();
const categories = [...new Set(tools.map((t) => t.data.category))];
const tagCounts = new Map<string, number>();
for (const t of tools) for (const tag of t.data.tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
const tags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).map(([tag]) => tag);
---

<BaseLayout title="工具库" description="我收藏与折腾过的好用软件 / 网站，分类整理、图文记录">
  <Header />
  <main class="mx-auto max-w-[72rem] px-4 py-12 md:px-6">
    <p class="text-sm text-[var(--color-text-muted)]">共 {tools.length} 件工具 · 慢慢整理中～</p>

    {/* Section 分类 pill — 首项固定「全部工具」，复用 N-3 PillRow；首页默认 active 首项 */}
    {/* Section 标签云 — 复用 N-4 TagCloud */}

    {tools.length === 0
      ? <EmptyState />
      : <section class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {tools.map((t) => (
            <EntryCard
              href={`/tools/${slugOf(t.data.title)}`}
              externalUrl={t.data.url}
              icon="ph:wrench"
              title={t.data.title}
              description={t.data.summary}
            />
          ))}
        </section>
    }
  </main>
  <Footer />
</BaseLayout>
```

**Ponytail 强制：** `tools.map(...)` 内 `slugOf(t.data.title)` 必须导入 M-2 导出的 `slugOf`，不内联 `encodeURIComponent`。`description` prop（M-3 已新增）替代原 Astro 默认的 summary 字段；EntryCard 支持 `description` 后此处不需要 alias。

**Copywriting（02-UI-SPEC 锁定）：** summary line `共 {n} 件工具 · 慢慢整理中～`；empty state 复用 N-2 默认 heading。

### M-5 · `src/styles/global.css` — 末尾追加 `.prose`

**Analog:** 自身 L14–46 `@theme { ... }` 块 + L48–65 `:where(.dark ...)` + L74–78 `:focus-visible`。追加位置在文件尾（`:focus-visible` 之后）。

```css
/* global.css 末尾（:focus-visible 之后）追加 —— ~40 行 hand-rolled prose */
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

**Ponytail 决策（RESEARCH §6）：** 不引 `@tailwindcss/typography`（未装，CLAUDE.md 栈未列，P8 反新增）。hand-rolled 覆盖 MDX 最常用语义足够；仅当 v2 出现大量嵌套列表/复杂表格再引入插件。Tailwind v4 接受 `@layer` 在 `@import "tailwindcss"` 之后的任意位置声明。

### N-1 · `src/components/Breadcrumb.astro` — 通用面包屑

**Analog:** `src/components/Header.astro` L6 `isActive` + L33–39 `aria-current` 主动模式。

```astro
---
interface Props {
  items: { href?: string; label: string }[];
}
const { items } = Astro.props;
---

<nav aria-label="路径" class="text-sm text-[var(--color-text-muted)]">
  <ol class="flex flex-wrap items-center gap-1">
    {items.map((item, i) => {
      const isLast = i === items.length - 1;
      return (
        <li class="flex items-center gap-1" key={i}>
          {isLast
            ? <span class="font-semibold text-[var(--color-text)]" aria-current="page">{item.label}</span>
            : <>
                <a href={item.href} class="hover:text-[var(--color-primary)]">{item.label}</a>
                <span aria-hidden="true">/</span>
              </>
          }
        </li>
      );
    })}
  </ol>
</nav>
```

**调用示例（详情页）：** `items={[{ href: '/', label: '首页' }, { href: '/tools', label: '工具库' }, { label: title }]}`。分隔符 `/` 用 `aria-hidden`（RESEARCH §TOOL-02）。

### N-2 · `src/components/EmptyState.astro` — 通用空状态

**Analog:** `src/pages/tools/index.astro` L7–20 占位空状态 + `src/pages/404.astro` L7–25 main 骨架（漂浮星点缀 + CTA 404 button class）。

```astro
---
import Divider from './deco/Divider.astro';
interface Props {
  heading?: string;
  body?: string;
  cta?: string;
  ctaLabel?: string;
}
const {
  heading = '这里还空空如也～ (｡･ω･｡)',
  body = '内容正在慢慢整理中，很快就会上线。先去逛逛其他角落吧！',
  cta = '/',
  ctaLabel = '回到首页',
} = Astro.props;
---

<section class="mx-auto flex min-h-[60vh] max-w-[72rem] flex-col items-center justify-center px-4 py-24 text-center">
  <Divider class="mb-8 w-24 text-[var(--color-deco-pink)]" aria-hidden="true" />
  <h2 class="font-display text-2xl font-semibold text-[var(--color-text)]">{heading}</h2>
  <p class="mt-4 max-w-md text-[var(--color-text-muted)]">{body}</p>
  <a href={cta} class="mt-8 inline-flex items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-2.5 font-semibold text-[var(--color-primary-fg)] transition hover:bg-[var(--color-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2">{ctaLabel}</a>
</section>
```

**档案页调用（Copywriting 锁定 02-UI-SPEC）：** 分类档案 `heading="这个分类还没住进任何工具 (｡•́︿•̀｡)" cta="/tools" ctaLabel="返回工具库"`；标签档案 `heading="还没有工具打过这个标签～"` cta/ctaLabel 同上。

### N-3 · `src/components/PillRow.astro` — 分类 pill 行

**Analog:** `src/components/Header.astro` L28–43 `<nav>` + 主动 `aria-current` + `class:list` 切换模式 + 404 CTA button class 复用。

```astro
---
interface Pill { href: string; label: string; active?: boolean }
interface Props {
  pills: Pill[];
  scrollable?: boolean;
  'class'?: string;     // Tailwind v4 透传 class（Astro 自动透 props.class）
}
const { pills, scrollable = true, class: className = '' } = Astro.props;
---

<nav aria-label="分类" class={scrollable ? `overflow-x-auto ${className}`.trim() : className}>
  <ul class="flex items-center gap-2">
    {pills.map((p) => (
      <li key={p.href} class="shrink-0">
        <a
          href={p.href}
          aria-current={p.active ? 'page' : undefined}
          class:list={[
            'inline-flex min-h-11 items-center rounded-[var(--radius-full)] px-4 text-sm font-semibold transition-colors',
            p.active
              ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)]'
              : 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)]',
          ]}
        >{p.label}</a>
      </li>
    ))}
  </ul>
</nav>
```

**主页调用：** 首项固定 `{ href: '/tools', label: '全部工具', active: true }` + categories.map 生成剩余 pill。**分类档案调用：** 所有 category pill 由 `Astro.url.pathname` 与 pill.href 比较判定 active（参考 Header.astro L6 `isActive` 模式；active 判定由 page 计算传入，组件本身不接触 URL）。

### N-4 · `src/components/TagCloud.astro` — 标签云

**Analog:** PillRow 派生（chip 视觉复 PillRow pill class，但 `wrap` 不横滚）。

```astro
---
interface TagChip { href: string; label: string; count?: number; active?: boolean }
interface Props { tags: TagChip[]; 'class'?: string }
const { tags, class: className = '' } = Astro.props;
---

<nav aria-label="标签" class={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
  {tags.map((t) => (
    <a
      href={t.href}
      aria-current={t.active ? 'page' : undefined}
      class:list={[
        'inline-flex min-h-[32px] items-center gap-1 rounded-[var(--radius-full)] px-3 text-sm transition-colors',
        t.active
          ? 'bg-[var(--color-primary)] font-semibold text-[var(--color-primary-fg)]'
          : 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)]',
      ]}
    >
      <span aria-hidden="true">#</span>{t.label}
      {t.count != null && <span class="text-xs opacity-70">({t.count})</span>}
    </a>
  ))}
</nav>
```

**命中区 ≥32px**（D-04 便携性）；`#` 文本 `aria-hidden`（RESEARCH TOOL-04 条目）。

### N-5 · `src/components/ToolDetailNav.astro` — 底部 nav

**Analog:** `src/components/Footer.astro` L1–16（Divider 区间隔线 + 简单布局）。仅详情页 1 处使用但仍抽组件（避免 N-6 `[slug].astro` 过 70 CPL；底部 nav 复用 EntryCard）。

```astro
---
import Divider from './deco/Divider.astro';
import EntryCard from './EntryCard.astro';
import { slugOf } from '../lib/tools';      // 详情页导入 lib 派生函数
interface Props {
  backHref?: string;
  backLabel?: string;
  related?: any[];                          // 由 getRelated 返回
  category?: string;
}
const { backHref = '/tools', backLabel = '← 返回工具库', related = [], category } = Astro.props;
const showRelated = related.length > 0;
---

<footer class="mt-16">
  <a href={backHref} class="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">{backLabel}</a>

  {showRelated && (
    <section class="mt-8">
      <h2 class="font-display text-lg font-semibold text-[var(--color-text)]">同分类的其他工具</h2>
      <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {related.map((t) => (
          <EntryCard
            href={`/tools/${slugOf(t.data.title)}`}
            externalUrl={t.data.url}
            icon="ph:wrench"
            title={t.data.title}
            description={t.data.summary}
          />
        ))}
      </div>
    </section>
  )}
</footer>
```

**D-11 不足整区 hidden：** `showRelated = related.length > 0` 守卫整区显隐。`slugOf` 导入见 M-2。

### N-6 · `src/pages/tools/[slug].astro` — 详情页

**Analog:** `src/pages/index.astro`（BaseLayout 组装）+ `src/layouts/BaseLayout.astro` L4–14 SEO props。MDX `<Content />` 无现有代码（按 RESEARCH §2 Astro 7 `entry.render()` 官方 API）。

```astro
---
import type { RenderResult } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import Breadcrumb from '../../components/Breadcrumb.astro';
import TagCloud from '../../components/TagCloud.astro';
import ToolDetailNav from '../../components/ToolDetailNav.astro';
import { Icon } from 'astro-icon/components';
import { getAllTools, getRelated, slugOf } from '../../lib/tools';

export async function getStaticPaths() {
  const tools = await getAllTools();
  // R-2 唯一性 assert（build 期强制报错，避免同名 title 静默覆盖）
  const slugs = tools.map((t) => slugOf(t.data.title));
  if (new Set(slugs).size !== slugs.length) {
    const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
    throw new Error(`[tools] duplicate slug: ${[...new Set(dupes)].join(', ')}`);
  }
  return tools.map((t) => ({
    params: { slug: slugOf(t.data.title) },   // D-09 encodeURIComponent；Astro 自动 decode
    props: { entry: t },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();     // RESEARCH §2 —— MDX 唯一干净渲染路径
const { title, url, summary, tags, category } = entry.data;
const related = await getRelated(category, slugOf(title), 2);
const seoDescription = summary;               // 详情页 description 自动取 summary
---

<BaseLayout
  title={`${title} · 工具库`}                 // D-02 discretionary 中段；BaseLayout 自动补 `· 初曦的窝`
  description={seoDescription}
>
  <Header />
  <main class="mx-auto max-w-[72rem] px-4 py-12 md:px-6">
    <Breadcrumb items={[
      { href: '/', label: '首页' },
      { href: '/tools', label: '工具库' },
      { label: title },
    ]} />

    {/* Hero */}
    <header class="mt-8">
      <div class="flex items-start justify-between gap-4">
        <h1 class="font-display text-3xl font-semibold text-[var(--color-text)]">{title}</h1>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${title} 外链`}
          class="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] transition hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          <Icon name="ph:arrow-square-out" class="size-5" aria-hidden="true" />
        </a>
      </div>
      <p class="mt-2 text-sm text-[var(--color-text-muted)]">{summary}</p>
      <p class="mt-1 text-xs text-[var(--color-text-muted)]">
        {category}
      </p>
    </header>

    {/* 标签 chip 行 */}
    <div class="mt-3">
      <TagCloud tags={tags.map((ta) => ({ href: `/tools/tag/${ta}`, label: ta }))} />
    </div>

    {/* MDX 正文 */}
    <article class="prose mt-12">
      <Content />
    </article>

    {/* 底部 nav（D-11） */}
    <ToolDetailNav
      backHref="/tools"
      backLabel="← 返回工具库"
      category={category}
      related={related}
    />
  </main>
  <Footer />
</BaseLayout>
```

**Ponytail 强制 import 清单：**
- `RenderResult` type（RESEARCH §2 原型契约）
- `getRelated` / `slugOf` / `getAllTools` 从 `lib/tools` 导入（M-2 新增函数）
- N-1 Breadcrumb / N-4 TagCloud / N-5 ToolDetailNav 三个新建组件
- `astro-icon` `ph:arrow-square-out` 复用 M-3 外链按钮视觉 class 完全一致（V-5 grep 验收安全不变量）

**空内容回退（D-12 / 02-UI-SPEC）：** 如 MDX body 为空（frontmatter 有、body 为空），`<Content />` 渲染为空；planner 可在 `<article>` 内加 fallback `{bodyEmpty && <p>这篇介绍还没写完…</p>}`（可选，Ponytail 默认不加，等真实 seed 验证）。

### N-7 · `src/pages/tools/category/[category].astro` — 分类档案

**Analog:** `src/pages/index.astro` Section 过滤 + Header.astro L6 `isActive` 判定。数据读取经 lib `getToolsByCategory`，不再页面内直接 `getCollection`。

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Header from '../../../components/Header.astro';
import Footer from '../../../components/Footer.astro';
import EntryCard from '../../../components/EntryCard.astro';
import Breadcrumb from '../../../components/Breadcrumb.astro';
import EmptyState from '../../../components/EmptyState.astro';
import PillRow from '../../../components/PillRow.astro';
import { getAllTools, slugOf } from '../../../lib/tools';

export async function getStaticPaths() {
  const tools = await getAllTools();
  const cats = [...new Set(tools.map((t) => t.data.category))];
  return cats.map((category) => ({
    params: { category },                     // Astro 自动 decode；与 slugOf(title) 同体系
    props: {
      items: tools.filter((t) => t.data.category === category),
      category,
      totalCategories: cats,
    },
  }));
}

const { items, category, totalCategories } = Astro.props;
---

<BaseLayout title={`分类：${category}`} description={`分类「${category}」下的全部工具`}>
  <Header />
  <main class="mx-auto max-w-[72rem] px-4 py-12 md:px-6">
    <Breadcrumb items={[
      { href: '/', label: '首页' },
      { href: '/tools', label: '工具库' },
      { label: `分类：${category}` },
    ]} />

    {/* 分类 pill 行 —— 主动作当前 pill（参考 Header.astro L6 isActive 笔法） */}
    <PillRow
      class="mt-8"
      pills={[
        { href: '/tools', label: '全部工具', active: Astro.url.pathname === '/tools' },
        ...totalCategories.map((c) => ({
          href: `/tools/category/${c}`,
          label: c,
          active: c === category,
        })),
      ]}
    />

    <h1 class="mt-8 font-display text-2xl font-semibold text-[var(--color-text)]">
      分类：{category}
    </h1>
    <p class="mt-2 text-sm text-[var(--color-text-muted)]">（{items.length} 个工具）</p>

    {/* 复用主页网格 */}
    {items.length === 0
      ? <EmptyState
          heading="这个分类还没住进任何工具 (｡•́︿•̀｡)"
          cta="/tools"
          ctaLabel="返回工具库"
        />
      : <section class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {items.map((t) => (
            <EntryCard
              href={`/tools/${slugOf(t.data.title)}`}
              externalUrl={t.data.url}
              icon="ph:wrench"
              title={t.data.title}
              description={t.data.summary}
            />
          ))}
        </section>
    }
  </main>
  <Footer />
</BaseLayout>
```

### N-8 · `src/pages/tools/tag/[tag].astro` — 标签档案

**Analog:** 同 N-7 结构，数据集换为 tag 聚合，标题/面包屑/空状态 Copywriting 换标签口 吻。

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Header from '../../../components/Header.astro';
import Footer from '../../../components/Footer.astro';
import EntryCard from '../../../components/EntryCard.astro';
import Breadcrumb from '../../../components/Breadcrumb.astro';
import EmptyState from '../../../components/EmptyState.astro';
import TagCloud from '../../../components/TagCloud.astro';
import { getAllTools, slugOf } from '../../../lib/tools';

export async function getStaticPaths() {
  const tools = await getAllTools();
  const tagMap = new Map<string, typeof tools>();   // RESEARCH §1 聚合写法
  for (const t of tools) for (const tag of t.data.tags) {
    const list = tagMap.get(tag) ?? [];
    list.push(t);
    tagMap.set(tag, list);
  }
  return [...tagMap.entries()].map(([tag, items]) => ({
    params: { tag },
    props: { items, tag },
  }));
}

const { items, tag } = Astro.props;
// 全量标签 chip 需要（含当前 tag active）
const tools = await getAllTools();
const tagCounts = new Map<string, number>();
for (const t of tools) for (const tag of t.data.tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
const tags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).map(([ta]) => ta);
---

<BaseLayout title={`标签：${tag}`} description={`打过「${tag}」标签的全部工具`}>
  <Header />
  <main class="mx-auto max-w-[72rem] px-4 py-12 md:px-6">
    <Breadcrumb items={[
      { href: '/', label: '首页' },
      { href: '/tools', label: '工具库' },
      { label: `标签：${tag}` },
    ]} />

    {/* 标签云（当前 tag 主动） */}
    <TagCloud class="mt-8" tags={tags.map((ta) => ({
      href: `/tools/tag/${ta}`,
      label: ta,
      count: tagCounts.get(ta),
      active: ta === tag,
    }))} />

    <h1 class="mt-8 font-display text-2xl font-semibold text-[var(--color-text)]">
      标签：{tag}
    </h1>
    <p class="mt-2 text-sm text-[var(--color-text-muted)]">（{items.length} 个工具）</p>

    {items.length === 0
      ? <EmptyState
          heading="还没有工具打过这个标签～"
          cta="/tools"
          ctaLabel="返回工具库"
        />
      : <section class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {items.map((t) => (
            <EntryCard
              href={`/tools/${slugOf(t.data.title)}`}
              externalUrl={t.data.url}
              icon="ph:wrench"
              title={t.data.title}
              description={t.data.summary}
            />
          ))}
        </section>
    }
  </main>
  <Footer />
</BaseLayout>
```

**数据归一验证（RESEARCH §1 + R-6）：** seed raycast.mdx 现有 tags `["效率","macOS","启动器"]` 经 M-1 transform 后变为 `["效率","macos","启动器"]`；planner 落地后须同步 seed tags 为小写以保持肉眼可读；标签档案 URL 以 transform 后值为准。

---

## 3. Ponytail Pattern Selection (component 复用决策链)

| 新建 | 为什么取 / 为什么不取 | 来源 |
|------|----------------------|------|
| **Breadcrumb** | 详情 + 分类 + 标签 三处面包屑结构重复；抽组件避免 3 处 `<nav><ol>` scrawl | 404 单组件最小化 |
| **EmptyState** | 主页/分类/标签 3 处空状态共用 Section+Cta+Divider 视觉；Copywriting 只换 heading/cta | tools/index.astro 迁出 01 占位 |
| **PillRow** | 主页 + 分类档案 2 处 pill 行重复；可横滚 + `aria-current` active | Header.astro 导航 模式复用 |
| **TagCloud** | 主页 + 标签档案 2 处 chip 云重复；wrap 不横滚 vs PillRow 区分 | PillRow 派生 |
| **ToolDetailNav** | 仅详情页 1 处使用，但仍抽组件——避免 MDX 页面过 70 CPL + 底部 nav 复用 EntryCard | Footer.astro + EntryCard |
| ❌ 不抽"工具 库泛型壳" | RESEARCH ponytail 注：仅分类+标签 2 处结构雷同 → 倾向抽 `_ToolboxPage.astro` 私有壳。planner 自定。取 6 个最小组件优于 1 个泛型壳；代码量相当、泛型壳参数接口反而更多定义。 | planner discretion |

---

## 4. 强制验收 grep 脚本（planner 落地 build 后执行）

按 RESEARCH §TOOL-05 / STRIDE T-01-03-02 + R-3 双层链接 a11y：

```bash
# V-5 外链 rel 不变量
nohup bash -c 'SRC=$(grep -rl 'target="_blank"' src/ | wc -l); REL=$(grep -rl 'rel="noopener noreferrer"' src/ | wc -l); echo "target=$SRC rel=$REL"; [ "$SRC" = "$REL" ] || echo "MISMATCH: 存在未配 rel 的外链"' &

# R-3 禁止嵌套 <a>（should find zero nested occurrences inside <a ...> blocks；简化为 grep 检查 EntryCard 内层 <a> 内不含子 <a>）
npx astro check                                      # V-6 anime 集合零 schema warning
npx astro sync                                       # M-1 改 schema 后必跑
npm run build                                        # V-8 新路由 → sitemap 自 动收录 /tools/**
```

验收标准详见 RESEARCH §Validation Architecture V-1..V-8。a11y grep 仅作辅助，V-5 主 要依赖 `astro check` + PLAN REVIEW 肉眼核对每处 `<a target="_blank">` 同一行出现 `rel="noopener noreferrer"`。

---

## 5. 数据流契约（所有页面遵守）

| 规则 | 来源 |
|------|------|
| 所有页面**经 lib 读取**，不直接 `getCollection` | 01-REARCH Pattern 1 / D-07 |
| `slugOf(title)` **单一出口**，pages + components 共用，不内联 encodeURIComponent | RESEARCH §D-09 |
| anime 集合 + lib/anime.ts **零改动** | 02-CONTEXT §decisions + RESEARCH §7 |
| 主题 FOUC 脚本 + 暗色 + 字体 preload **动不得** | global.css / BaseLayout.astro L21–26 是 PITFALLS P3 不动点 |
| Tailwind v4 `@theme` token + `.dark` 覆盖**只追加不覆写** | global.css 头尾结构不可整体替换 |
| transform 归一化 seed 同步为**小写 tags** | R-6 缓解 |
| `getRelated` 不足 2 → `hidden` | D-11；props `related=[]` 时 ToolDetailNav 隐藏整区 |

---

## 6. Risk 注册

| ID | 缓解锚定 |
|----|----------|
| R-1 CJK slug URL 不对称 | `slugOf` 只在 params 生成 + `<a href>` 一次性用，不二次 encode（M-2 单一出口 保障）|
| R-2 同名 slug 覆盖 | N-6 `getStaticPaths` build 期唯一性 assert（已嵌入上述代码段）|
| R-3 双层 `<a>` 嵌套 a11y 回归 | 取 M-3 外层 `<article>` + 内层整卡 `<a>` + absolute 兄弟外链 `<a>`，禁止嵌套；V-5 grep 强校验 |
| R-4 EntryCard 改造破坏 Phase 1 | 入口卡不传 `externalUrl` → 不渲染按钮；planner 验收含「首页与 Phase 1 html diff 等价断言」|
| R-5 anime 集合误改 | Edit scope 严格限定 tools schema block；`git diff --stat` 只动 content.config.ts 一行 |
| R-6 seed tags 含大写 | planner 落地前更新 raycast.mdx tags 为小写（`["效率","macos","启动器"]`），与 transform 后一致 |
| R-7 MDX 远程图白名单 | v1 走本地图或 cover field；详情页暂不嵌外部图。planner 不扩展 remotePatterns |

---

## No Analog Found

- **MDX `<Content />` 渲染（N-6 `[slug].astro`）**：现有代码无示例。按 RESEARCH §2 Astro 7 `entry.render()` 官方 API 落地，唯一干净路径。无替代。

---

*Phase: 02 — 工具库（核心）*
*Patterns mapped: 2026-07-15*
*Confidence: HIGH — 全部复用 01 HIGH 核验稳定的 Astro 7 API、lib 读 取收口、BaseLayout/EntryCard 既有组件；零新依赖；Ponytail 取 6 单一职责组件，不抽泛型壳（planner 自定）。*
