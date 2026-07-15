---
phase: 3
slug: anime-tracker
status: draft
shadcn_initialized: false
preset: none
created: 2026-07-15
---

# Phase 3 — UI Design Contract（追番记录）

> Visual and interaction contract for「追番记录」—— v1 最后一章。
> 范围：ANIME-01..05。在 Phase 1 视觉基线上新建 AnimeCard / StatusPill / RatingStar / 详情 Hero 等组件，实现番剧列表主页（封面网格 + 状态 pill 行）、详情页（封面+元信息卡两栏 + MDX 下方）、状态静态筛选页（零 JS）的全套视觉与交互契约。
> 本阶段**零 Preact 岛屿**（状态筛选走构建期静态页，主题沿用 Phase 1 原生 `<script>`）。
> 配色/字体/圆角/shadow/动效/a11y 基线**全部复用 Phase 1**，不重定义。仅新增状态标签配色（watching/done/plan）+ 评分 star 配色（1 个新 `--color-star` token）。

---

## Design System（继承 Phase 01，仅声明差异/新增）

Phase 01 的 Design System 全部直接复用。详见 `.planning/phases/01-foundation-shell/01-UI-SPEC.md`。

| Property | Value |
|----------|-------|
| Tool | none（同 Phase 01；纯 `.astro`，无 shadcn） |
| Component library | none —— 复用 Phase 01 + 既有 `EntryCard` / `Breadcrumb` / `EmptyState` / `PillRow` / `TagCloud` / `deco/*`, 新建 `AnimeCard` / `StatusPill` / `RatingStar` |
| Icon library | `astro-icon` + Iconify Phosphor（`ph:`）；本阶段新增 `ph:star`（评分星级）、`ph:film-strip`（番剧模块图标，备用） |
| Font | `--font-display`（Fredoka + ZCOOL 回退）/ `--font-body`（系统栈）— 标题/卡片标题用 display，正文/进度/评论用 body |
| Island framework | **无**。状态筛选走静态页，无客户端状态，不引 Preact / nanostores |

---

## Spacing Scale（完全复用 Phase 01）

| Token | Value | Phase 3 新用法 |
|-------|-------|--------------------|
| xs (4px) | 图标与文字间距 | star 与评分数字间 gap |
| sm (8px) | 紧凑元素间距 | 状态标签 pill 内边距、卡片内 meta 行 gap |
| md (16px) | 默认元素间距、安全内距 | 页面左右 `px-4`、卡片封面与右侧信息间距 |
| lg (24px) | 组件块间距 | 卡片内边距 `p-4`/`p-5`、状态 pill 行与网格间距、封面与元信息卡在两栏中的 gap |
| xl (32px) | 卡片外间距 | 网格 `gap-6` → `gap-8(lg)`，两栏封面↔元信息间距 |
| 2xl (48px) | 主要区块分隔 | summary line 上方间距、底部「返回追番列表」上方间距 |
| 3xl (64px) | 页面级留白 | Footer 前 `mt-24`（沿用 Phase 01） |

Exceptions: 交互触控目标最小 **44px** (`min-h-11 min-w-11`) — 整 AnimeCard `<a>`、状态 pill、面包屑链接命中区。卡片封面图自身为整卡可点一部分，封面 alt 文本指向番剧中文名。

---

## Typography（在 Phase 01 4 角色上新增 Anime 相关角色）

复用 Phase 1 的 Body / Label / Heading / Display。本阶段**新增 3 个语义角色**：

| Role | Size | Weight | Line Height | Font | Phase 3 用途 |
|------|------|--------|-------------|------|-------------|
| Anime title (card) | 18px (`text-lg`) | 600 | 1.3 | display | 卡片内番剧名（标题日文/中文优先展示 titleCn，一行溢出 ellipsis） |
| Anime detail (h1) | 28px (`text-[1.75rem]`) | 600 | 1.2 | display | 详情页大标题（同 Phase 2 工具 detail h1 规格） |
| Meta | 13px | 400 | 1.4 | body | 状态/集数/进度短评摘要、面包屑分隔符、summary line |

规则继承 Phase 01：正文永不用 display；≤14px 不花体；暗色主题下同样对比度 ≥ AA。

---

## Color（仅新增状态标签 3 色 + star 配色，其余完全复用 Phase 01 调色板）

**不新增任何旧 token 的使用映射**。仅追加：

### 状态标签配色（3 色，复用已有主色/成功色/装饰粉）

| 状态 | 使用 token | 视觉色 | 说明 |
|------|-----------|--------|------|
| watching（在看） | `--color-primary` / `--color-primary-fg` | 青蓝 | 激活填充底 + 白/深字，与工具库分类 pill active 同规格 |
| done（做完） | `--color-success` / 同色 `color-mix` 染底（~10%）绿 | 成功绿 | 填充态；卡片内小标签用染底 + success 文字 |
| plan（想看） | `--color-deco-pink` 作染底（~12%）| 装饰粉 | 卡片小标签用染底 + deco-pink 文字（粉色已定义为装饰用，这里用于表达「期待/想补」的情绪，语义清晰不混淆） |

设计上的理由：watching 是当前进行中 → 主色（最重要），done 已完成 → 成功绿，plan 尚待 → 粉色「期待感」。三色对比度在亮/暗主题下均 ≥ AA 用于标签文字（标签文字都用与各底色配套的前景色或深色字）。

### Star 配色（1 个新增 token）

| Token | Light | Dark | 说明 |
|-------|-------|------|------|
| `--color-star` | `#F5A524` | `#F5C266` | 评分 star 点亮色（暖金色）。空 star 用 `--color-border` 勾边色。star+数字态（如 9/10）整体与 body 同色，star 本身取 `--color-star` |

**Accent reserved for** (acc 10% 依然指 `--color-primary`)：主 CTA 按钮填充、激活/悬浮导航链接、焦点环、正文链接、状态 pill watching active 填充、AnimeCard 整卡 hover 描边（phasis 风格）。

**新增 token 实现方式**：在 `src/styles/global.css` `@theme` 块追加 `--color-star`（亮/暗 2 色），`:where(.dark)` 块追加暗色覆盖。不另开组件级 token。

---

## Layout & Grid（D-05 / D-07 / D-09）

### 全局容器

与 Phase 01/02 一致：`max-w-[72rem]` 居中，左右安全内距 `px-4` → `md:px-6`。

### 列表/筛选页垂直骨架（自上而下）

```
<BaseLayout>
  <Header />
  <main>
    [summary line]    "共 {N} 部 · 慢慢补番中～"   ← y-4
    [status pills]    PillRow：全部/在看/做完/想看          ← y-8（可用 overflow-x-auto 横滚保护）
    [anime grid]      1→2→3 列封面卡片                  ← y-12（空则 EmptyState）
  </main>
  <Footer />
</BaseLayout>
```

- 区块间竖直 rhythm：summary→pills `mt-6`，pills→grid `mt-8`。
- Footer 前间距 `mt-24`。

### 详情页垂直骨架（D-07 / D-08，md+ 切换）

```
<BaseLayout>
  <Header />
  <main>
    [breadcrumb]       "首页 / 追番 / {titleCn}"        ← y-4
    [detail hero]      两栏：左封面（poster 2:3）+ 右标题/状态/评分/集数/进度/comment    ← y-8
    [MDX body]         .prose 可长可短图文（空则显示「这篇番感还没写…」）              ← mt-12
    [back nav]         「← 返回追番列表」              ← mt-12
  </main>
  <Footer />
</BaseLayout>
```

响应式规则：
- **≥ md（768px）**：两栏 — 左封面 `w-2/5`（固定 poster ratio 2:3），右元信息 `w-3/5`；封面与右侧卡片间距 `gap-8`。
- **< md**：单栏 — 封面在上（`max-w-[12rem]` 居左或居中），元信息在下 `mt-6`。

### AnimeCard 封面网格（D-04 / D-05）

| 断点 | 列数 | gap |
|------|------|-----|
| < md (默认) | 1 列 | `gap-6`（24px）|
| ≥ md (768px) | 2 列 | `gap-6` |
| ≥ lg (1024px) | 3 列 | `gap-8`（32px）|

实现：`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8`。

封面 poster ratio：**2:3**（aspect-[2/3]），固定比例、封面缺失走占位回退（见 Components）。

---

## Copywriting Contract（中文，继承 Phase 01/02 语气：友好软萌、克制颜文字）

| Element | Copy |
|---------|------|
| 主页 summary line | `共 {N} 部 · 慢慢补番中～` |
| 主页空状态 heading | `追番清单还空空如也～ (｡･ω･｡)` |
| 主页空状态 body | `还没录入任何番剧。先把最想补的番记下来吧～` + CTA `回到首页` |
| 状态筛选空状态 heading | `「{状态中文}」状态下暂无番剧 (｡•́︿•̀｡)` |
| 状态筛选空状态 body | `这个列表下暂时是空的，先去别的状态逛逛～` + CTA `返回追番列表` |
| 详情页无 MDX 正文 fallback | `这篇番感还没写，先看看基本信息吧…` |
| 404（slug 不存在） | 沿用 Phase 01 Error state 文案（整站共用，标题固定「诶呀，这一页走丢了 (｡•́︿•̀｡)」） |
| 状态 pill 中文映射 | watching → `在看`，done → `做完`，plan → `想看`；全部 pill 固定 `全部` |
| 返回追番列表链接 | `← 返回追番列表` |
| 进度显示格式 | `看到 {progress} / 共 {episodes} 话`（episodes 缺失时仅 `已看 {progress} 话`；plan 状态显示 `全 {episodes} 话 · 待补`） |
| 评分 star aria-label | `{titleCn} 评分 {myRating} / 10`（如「葬送的芙莉莲 评分 9 / 10」） |
| 封面 alt 文本 | `{titleCn} 番剧封面`（如 cover 缺失占位块 alt 为空 + aria-hidden） |
| Destructive confirmation | 本阶段无破坏性操作。沿用 Phase 01 预留模板。 |

SEO title 模式（沿用 BaseLayout）：
- 列表/筛选主页：`追番记录 · 初曦的窝`
- 状态筛选页：`{状态中文} · 追番记录 · 初曦的窝`（如「在看 · 追番记录 · 初曦的窝」）
- 详情页：`{titleCn} · 追番记录 · 初曦的窝`（可省略中段仅 `{titleCn} · 初曦的窝`，planner 决定；推荐显示中段保路径清晰）

---

## Component Inventory（states / 间距 / 响应式 / 复用标注）

### `AnimeCard.astro`（新组件，D-04 / D-05 / D-06）

**不复用 EntryCard**，信息结构差异大（封面图 vs 图标圆底；5 项信息 vs 3 项）。但参考 EntryCard 的 **双层链接模式**（外层 `article.relative` + 内层整卡 `<a>`）和 hover 上浮规格。

Props:
- `href: string` — 详情页路径 `/anime/${slug}`
- `cover?: ImageMetadata | string` — `astro:assets` 图或远程 URL（经 astro.config remotePatterns 过 lain.bgm.tv）
- `titleCn: string`
- `status: 'watching' | 'done' | 'plan'`
- `myRating?: number`（0-10，有则渲染 RatingStar）
- `progress: number`（默认 0）
- `episodes?: number`
- `draft?: boolean`（默认 false，草稿不渲染、由 getAllAnime 过滤）

结构（自上而下）：
1. **封面区**：`aspect-[2/3]` 固定比例，`rounded-[var(--radius-lg)]` 圆角裁切，封面 `object-cover + loading="lazy"` + `decoding="async"`。**封面缺失回退**：用 `deco/Blob` 风格占位（青粉渐变 + 中央 1 个装饰星/爱心浮动，`aria-hidden`），同 Hero Blob 占位范式，**CLS≈0**（固定比例保占位一致）。
2. **底部信息区**（`p-3` ~ `p-4`）：
   - `titleCn`（Anime title 角色、单行 ellipsis）
   - `StatusPill`（小标签，右下/右上角或紧接标题下方）
   - `RatingStar` + 数字（仅 myRating > 0 渲染）
   - 进度文字（N/M 话或等价）
3. **整卡 `<a href={href}>`** 包裹封面+信息区，命中区等于整卡；`aria-label` = `${titleCn}，状态 {状态中文}，评分 {myRating}/10`。

States:
- default：`border border-[var(--color-border)]`、`rounded-[var(--radius-lg)]`、`bg-[var(--color-surface)]`、`shadow-[var(--shadow-soft)]`、`transition-transform duration-150`。
- hover：`motion-safe:-translate-y-0.5`（上浮 2px）+ 边框变 `--color-primary` + 缩放封面（可选，cover `group-hover:scale-[1.02] ≤150ms`）；`prefers-reduced-motion: reduce` 下静止。
- focus-visible：2px `--color-primary` ring + 2px offset（跟随 radius-lg）。
- active：回位。

封面 alt：有图时 alt = `{titleCn} 番剧封面`；占位 alt 空 + aria-hidden。

---

### `StatusPill.astro`（新组件，D-06 卡片内小标签）

番剧卡片右上角/左上角的小圆角标签，标明 watching/done/plan。

Props:
- `status: 'watching' | 'done' | 'plan'`
- `showIcon?: boolean`（默认 false，纯文字更紧凑）

形态（沿用 01-UI-SPEC radius-sm + Label 12px）：
- `rounded-[var(--radius-sm)]`、`px-2 py-0.5`、`text-xs font-semibold`
- 配色使用状态表（watching → primary 染底 + primary 字；done → success 染底 + success 字；plan → deco-pink 染底 + deco-pink 字）
- 绝对定位在卡片封面右上角（`absolute right-2 top-2`、z-10），**不进入整卡 `<a>` 的嵌套**（否则冒泡问题），作为兄弟遮罩（类似 EntryCard 外链按钮的兄弟定位方案）。
- 标签无前缀 emoji（克制、保留信息密度）。

States: 静止（不整卡 hover 也保持可读）；不可点（已在 `<a>` 内，无需单独命中）；覆在封面上时加 `shadow-sm` 以保可读。

**PillRow（列表顶状态 pill 行）**：复用 Phase 2 的 `PillRow.astro`，pill label 为 `全部/在看/做完/想看`、href 指向 `/anime` 与 `/anime/status/:enum`。激活态 `aria-current="page"`。

---

### `RatingStar.astro`（新组件，D-08）

接受 `value: number`（0-10，整数）、渲染 star + 数字。

形态：
- 图标：astro-icon `ph:star`（填充/空状态）。**不支持半星**，用 5 star × 每 star = 2 分的方式映射：`score/2` 取整得点亮星数（9/10 → 4 颗亮 + 1 颗空，或 5 颗全亮——**design decision: ≥8 即全 5 星、6-7 → 4 星、4-5 → 3 星、2-3 → 2 星、1 → 1 星、0 / 无 rating 不渲染**）。推荐简化：**用一条文本 `★ {value}/10` 而非分 star**，star 仅在详情页 Hero 渲染独立 5 星视觉、卡片上为了紧凑仅显示数字「9/10」。**【DECISION NEEDED: 卡片上 star 形态——精简数字 vs 小星星；planner 见 Planner Notes】**。
- 颜色：填充 star `--color-star`（新 token）、空 star `--color-border`；数字文本用 body 色 `--color-text-muted` 小一号。
- aria-label：`{titleCn} 评分 {value} / 10`（整卡 `<a>` aria-label 已复述时，内部 star 可 `aria-hidden` 防重复朗读；**推荐渲染独立组件时 `aria-hidden`，由外层 a 的 aria-label 统一朗读**）。

---

### `AnimeDetailHero.astro`（新组件，D-07 / D-08 右栏元信息卡）

两栏右侧的元信息卡——封面区走后右栏纯信息垂直流。

Props: 直接接收 anime entry 字段（titleCn, titleJa?, status, myRating?, progress, episodes?, airDate?, comment?, cover 给左侧）。

结构（自上而下）：
1. h1 titleCn + 一行 muted titleJa（仅 titleJa 存在）
2. StatusPill
3. RatingStar + 数字评分
4. 元数据网格：`全 {episodes} 话`、`开播 {airDate 格式化 YYYY-MM-DD}`（可选字段缺失不渲染）
5. 进度文案（格式见 Copywriting）
6. comment 摘要（有则渲染，`text-sm text-[var(--color-text-muted)]`，引用样式或正文）

容器样式：`rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] border border-[var(--color-border)]`；两栏内左（封面）右（此 Hero 卡）间距 `gap-8`。

**左侧封面大图**：`aspect-[2/3] w-full rounded-[var(--radius-xl)] object-cover`，有远程/本地图走 `<Image>` + 显式宽高（防 CLS），缺失走 Blob 占位。置于 `<figure>`、`<figcaption sr-only>` = titleCn 封面。

---

### 复用既有组件清单（不改）

| 组件 | 复用场景 |
|------|---------|
| `BaseLayout.astro` | 所有页面壳（传 title / description） |
| `Header.astro` / `Footer.astro` | 外壳 |
| `Breadcrumb.astro` | 详情页 / 状态筛选页路径 |
| `EmptyState.astro` | 列表/筛选/详情空状态（全 3 套文案见 Copywriting） |
| `PillRow.astro` | 列表页/筛选页顶部状态 pill 行（active=当前 status） |
| `deco/Blob.astro` | 封面缺失占位回退（青粉渐变 + 浮动星心，aria-hidden） |
| `deco/Star.astro` / `deco/Heart.astro` | Blob 占位内部装饰（aria-hidden） |
| `deco/Divider.astro` | EmptyState 顶部装饰、详情页 back nav 分割线（aria-hidden） |

---

## Interaction & Motion（D-04 / D-08 / 动画克制）

| 交互 | 规格 |
|------|------|
| AnimeCard 整卡 hover 上浮 | `translateY(-2px)`、`duration-150`、`motion-safe:` guard；封面内 `scale-[1.02]` 同步 ≤150ms（`prefers-reduced-motion: reduce` 下静止） |
| AnimeCard 整卡 href | 点击进入详情 `/anime/[slug]`（`slug` 派生 titleCn，与工具库同） |
| 状态 pill / PillRow | 整项可点，跳转静态筛选页 `/anime/status/:status`（零 JS） |
| 详情页 MDX 嵌入图 | `<Image>` 走 astro:assets、`rounded-[var(--radius-lg)]`、`loading="lazy"`、显式宽高 |
| 封面 | 列表卡 `loading="lazy" decoding="async"`；详情 Hero 首屏封面 `loading="eager" fetchpriority="high"`（LCP 关键路径） |
| 返回 / 面包屑 | 常规 `<a>` |
| 装饰浮动 (Blob 占位内部) | 沿用 Phase 1 `floaty` keyframes；`prefers-reduced-motion: reduce` 下静止 |

- 本阶段**零 Preact / nanostores 岛屿**。所有交互由原生 `<a>` + CSS `:hover`/`:focus-visible` 处理。
- View Transitions 沿用 Phase 1 BaseLayout 配置。

---

## Accessibility

| 项 | 契约 |
|----|------|
| 触控目标 | 整 AnimeCard（整卡 `<a>`）≥ 44px（由封面高度保证）；状态 pill 命中区 ≥44px；面包屑链接 ≥44px |
| 封面 alt | 有图 alt = `{titleCn} 番剧封面`；Blob 占位 alt 空 + `aria-hidden` |
| 评分 aria | RatingStar 本身 `aria-hidden`；外层整卡 `<a>` 或详情 Hero 综合 aria-label 朗读「评分 N/10」，避免重复 |
| 状态 pill | PillRow active `aria-current="page"`；卡片内 StatusPill 仅为视觉强调，无需 aria-label（整卡 aria-label 已涵盖状态）|
| 面包屑 | `<nav aria-label="路径">` + `<ol>`；当前项无链接 |
| 装饰 | Blob/Star/Heart/Divider 全部 `aria-hidden` + `pointer-events:none`；不进 Tab 序 |
| 焦点环 | `:focus-visible` 2px `--color-primary` + 2px offset，radius 跟随元素 |
| 对比度 | Phase 01 已锁；暗/亮双主题正文 ≥ AA 4.5:1；新增 `--color-star` 两主题对 `--color-surface` 均 ≥ 4.5:1（亮 #F5A524 / 暗 #F5C266 校验）；状态 pill 文字用配套前景色保 AA |

---

## Meta / SEO Contract（INFRA-06 延续）

- `BaseLayout.astro` 已输出 title / OG / canonical。本阶段针对 3 类页面传 title (模式见 Copywriting)。
- 详情页 ogImage 可用 `cover`（本地 image() 输出优化图）；列表页用站点级兜底 OG 图（沿用 Phase 1）。
- Sitemap 新增 `/anime/**`、`/anime/status/**`、`/anime/[slug]` 自动收录（`@astrojs/sitemap` 构建期）。
- Slug 派生：同 Phase 2 工具库路径（基于 `titleCn` URL-encode）；`getStaticPaths` 必须唯一性校验（dupes 抛出）—— planner 在 PLAN/实现中落地。
- 详情页 canonical 与 `getStaticPaths` 输出一致（planner 校验）。

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| — | 无（未使用 shadcn / 第三方 registry；纯 `.astro` + Iconify Phosphor 图标，构建期内联 SVG） | not applicable |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS — 3 套 Empty State + 4 条 Copywriting + SEO title 模式 + aria-label 模式全部可验证
- [ ] Dimension 2 Visuals: PASS — 组件层级（article > a + figure + StatusPill + RatingStar + 进度）、封面占位 CLS 策略、Hero 两栏断点可验证
- [ ] Dimension 3 Color: PASS — 仅 1 个新增 token `--color-star`（亮/暗双值 AA 校验）；状态标签复用 primary/success/deco-pink
- [ ] Dimension 4 Typography: PASS — 仅新增 Anime title card 18px / detail h1 28px / meta 13px 共 3 角色；≤14px 不用 display
- [ ] Dimension 5 Spacing: PASS — 复用 Phase 1 8 点网格（xs:4 / sm:8 / md:16 / lg:24 / xl:32 / 2xl:48 / 3xl:64）；触控 ≥44px
- [ ] Dimension 6 Registry Safety: PASS — 无 third-party registry, 纯 `.astro` + Iconify Phosphor

**Approval:** pending（待 gsd-ui-checker 校验）

---

## Requirement Traceability（ANIME-01..05 → 契约条目）

| Requirement | 映射的契约条目 |
|-------------|--------------|
| ANIME-01 浏览追番列表，每部以封面卡显示名称、集数、评分、状态 | `AnimeCard` 组件（封面 + titleCn + StatusPill + RatingStar + 进度）+ summary line + 1→2→3 列网格 |
| ANIME-02 按观看状态筛选列表 | PillRow 状态 pill + 静态筛选页 `/anime/status/:status`（getStaticPaths，零 JS）+ 状态标签 active `aria-current=page` |
| ANIME-03 进入详情页查看完整信息、评分、进度 N/M 话与短评 | `AnimeDetailHero` 两栏（封面图 + 元信息卡含 RatingStar/进度/comment）+ MDX .prose 正文 + back nav |
| ANIME-04 维护者手动录入，数据层分层（bgmId 等预留） | 数据层不动（schema 已锁）；`AnimeCard`/Hero 消费 status/progress/myRating/episodes/airDate/comment 字段 |
| ANIME-05 接 Bangumi API 不重写页面 | 数据访问经 `lib/anime.ts getAllAnime()` 不直接 getCollection；cover remotePatterns 已含 lain.bgm.tv（无新增契约条目） |

---

## Planner Notes（planner 需落地的几项，仅提示）

1. **D-09 slug 派生方案**：默认 URL-encode(titleCn)（如 Phase 2 工具库），冲突追加 `-2`；planner 在 PLAN 明确唯一性校验测试。
2. **[DECISION] 卡片 star 形态**：推荐卡片上**精简数字 `9/10`** 而非 5 star 视觉（卡片空间有限、5 star 冗余）；详情页 Hero 可渲染 **5 独立 star 图标 + 数字** 作为更重展示。planner 落地后更新本 spec 对应条目。
3. **[DECISION] StatusPill 卡片内定位**：推荐封面右上角 absolute（`right-2 top-2`），不进入整卡 `<a>` 嵌套（类似 EntryCard 外链按钮兄弟定位方案）。planner 落地后确认。
4. **[DECISION] RatingStar 映射规则**：默认 `score/2` 取整得点亮星数（9/10 → 4 星 + 1 空星；5/10 → 2 星 + 3 空星等）。planner 可改为更宽松（如 ≥8 全 5 星）但需在 PLAN 写明。
5. **[DECISION] 详情页 title 中段**：推荐含中段 `{titleCn} · 追番记录 · 初曦的窝`（路径可读）。
6. `[DECISION NEEDED]` 见下「DECISION NEEDED 列表」。
7. 全部决策 D-01..D-14 已锁定在 03-CONTEXT.md，planner 与 executor 不得推翻；本契约仅是它们的视觉翻译。
