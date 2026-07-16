---
phase: "03"
slug: "anime-tracker"
plan: "03-03"
type: standard
wave: 2
status: completed
requirements_covered:
  - ANIME-01
  - ANIME-02
  - ANIME-03
  - ANIME-04
  - ANIME-05
files_modified:
  - src/components/AnimeDetailHero.astro
  - src/pages/anime/[slug]/index.astro
  - src/pages/anime/status/[status]/index.astro
depends_on:
  - 03-01
  - 03-02
---

# 03-03 Summary — AnimeDetailHero + 详情页 + 状态筛选页

**Status:** completed
**Duration:** ~1 小时

## What was done

### Task 1 — `src/components/AnimeDetailHero.astro` (新建)

详情页两栏右栏元信息卡（03-02 AnimeCard 负责左栏卡片；本组件负责右栏元信息垂直流，左栏封面由页面模板放置）。

- Props 直接接收 entry 字段（titleCn, titleJa?, status, myRating?, progress, episodes?, airDate?, comment?），ponytail 不膨胀。
- 5-star **icon 模式内联**：`Math.round(myRating/2)` 映射点亮星数，`ph:star` size-4 + `star-fill`/`star-empty`，数字 span `rating-num`。`myRating` 缺 / ≤0 不渲染。
- 容器：`rounded-xl bg-surface shadow-soft border border-border`。
- aria-label `{titleCn} 评分 {myRating} / 10`。
- 元数据网格条件渲染（episodes / airDate）。
- 进度文案 Copywriting 锁定（三形态）。
- comment 引用样式（border-l-2 border-primary）。

### Task 2 — `src/pages/anime/[slug]/index.astro`（目录式动态段新建）

- `getStaticPaths` 经 `getAllAnime()` 枚举；唯一性校验用**未编码 titleCn**（dupes 抛错）。
- ⚠️ **重要修正**：CJK slug 在 Astro 路由匹配时已被解码，`params.slug` 必须传未编码的 `titleCn`（不能用 `slugOf`），否则 `NoMatchingStaticPathFound`。Phase 2 工具库因标题 ASCII 而躲过此问题。
- 两栏 Hero（md+）：左封面 `md:w-2/5`（`<Image>`/远程 `<img>` + eager + fetchpriority high；缺失走 Blob 占位浮动星心，aria-hidden，aspect-[2/3] 保 CLS≈0）+ 右列 `md:w-3/5` `<AnimeDetailHero>`。<md 单栏封面 + Hero 在下。
- MDX `<Content />` 走 `.prose`；body 为空（`!entry.body?.trim()`）显示 fallback `这篇番感还没写，先看看基本信息吧…`。
- 底栏 `<a href="/anime">← 返回追番列表</a>`。
- SEO title `{titleCn} · 追番记录 · 初曦的窝`（经 BaseLayout 拼接）。
- 数据访问**全部经** `getAllAnime` / `slugOf`，无 `getCollection`。
- 404：getStaticPaths 枚举全部合法 slug，Astro 未匹配走整站 404。

### Task 3 — `src/pages/anime/status/[status]/index.astro`（目录式动态段新建）

- `getStaticPaths` 枚举 `['watching','done','plan']`，**另起字面数组**（ponytail：Astro 7 Vite 打包分离 getStaticPaths 上下文，顶层 const `STATUSES` 报 `STATUSES is not defined`——即便在模块级定义）。
- 经 `getAnimeByStatus(status)` 读取。
- Breadcrumb（首页 / 追番 / {状态中文}）、PillRow（全部 + 三状态，当前 `aria-current="page"`）、h1 `{label} · 追番记录`、数量行。
- 网格 1→2→3 列网格同 `/anime/index.astro`；空则 EmptyState（heading `「{状态中文}」状态下暂无番剧 (｡•́︿•̀｡)`、CTA `返回追番列表`）。
- 零 JS、零 Preact 岛屿、零客户端状态。
- 数据访问**全部经** `getAnimeByStatus` / `slugOf`。

## Verification Results

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npx astro check` | ✅ 0 errors, 0 warnings, 3 hints |
| `npm run build` exit 0 | ✅ 13 pages |
| Detail HTML 含 h1/StatusPill/5-star+数字/元数据网格/progress | ✅ |
| Detail HTML 含 fallback (frieren body 仅 1 句「后劲很大的一部。」经 MDX 渲染) | ✅ `.prose` 存在 |
| Detail HTML 含 「← 返回追番列表」href=/anime | ✅ |
| Detail HTML 含 Blob 占位 (cover absent) | ✅ aria-hidden |
| Detail HTML 含 `loading="eager" fetchpriority="high"` | ✅ |
| Breadcrumb 末项 `aria-current="page"` | ✅ |
| Status HTML 含 PillRow active `aria-current="page"` | ✅ 3 处（breadcrumbs + active pill + active anime card aria-label） |
| Status 空状态 (plan 无条目) 显示 EmptyState 锁定文案 | ✅ |
| Slug 唯一性校验 dupes 抛错 | ✅ grep `duplicate slug` |
| AnimeDetailHero 含 `aspect-[2/3]` | ❌ 左壁封面由**页面模板**放置，组件不含（correct per ponytail 决策） |
| 数据访问不经 `getCollection` | ✅ grep 通过 |

## Requirement Traceability

| Requirement | Coverage |
|-------------|----------|
| ANIME-01 浏览追番列表 | 详情入口由 AnimeCard `/anime` 列表页承载（03-02） |
| ANIME-02 按状态筛选 | 静态筛选页 `/anime/status/:status` + PillRow active aria-current |
| ANIME-03 详情页完整信息/评分/进度/短评 | AnimeDetailHero + MDX .prose body; 5-star icon + 数字; progress N/M 话 |
| ANIME-04 手动录入 + 数据层分层 | schema 不动，全部消费 status/progress/myRating/episodes/airDate/comment |
| ANIME-05 接 Bangumi 不重写页面 | 经 `lib/anime.ts` getAnimeByStatus/getAllAnime；schema bgmId/remotePatterns 不动 |

## Key Decisions (runtime discoveries)

1. **CJK slug 路由匹配**：Astro 解码 URL 段后匹配 `params`，`getStaticPaths` 必须传未编码 titleCn。修正对 Phase 2 工具库是 no-op（ASCII），但对中文标题是必须项。
2. **AnimeDetailHero 不负责左栏封面**：pons 只传字段、由页面模板处 理左栏 `<figure>`（ponytail 避免 props 膨胀）。
3. **getStaticPaths 内部字面数组**：顶层 const 在 Astro 7 Vite 打包后作用域隔离失败，改用字面数组。

## Notable Ponytail Simplifications

- 不复写「相关番剧」底栏（getRelatedAnime）—— v1 无 ponytail 需求，back nav 单链接。
- 不引入 EmptyState 作 MDX fallback（用简单 `<p>`）—— 单处使用、组件 props 无法构成复用。
- 不复用精简数字版 RatingStar 于 Hero（5 独立 star 视觉太重展示，单处内联实现）。
- `slugOf` 在 anime/page 中被 `getAllAnime` 取代（slug 派生由 `getStaticPaths` 内部处理，页面模板不需要外调 `slugOf`）。
