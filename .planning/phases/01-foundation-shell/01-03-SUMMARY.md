---
phase: 01-foundation-shell
plan: 03
subsystem: seo-shell
tags: [astro, seo, og, twitter-cards, canonical, sitemap, placeholder, 404, astro-icon]

# Dependency graph
requires:
  - 01-01 (site config + @astrojs/sitemap + BaseLayout scaffold)
  - 01-02 (BaseLayout fullTitle seam + deco/{Star,Heart,Divider,Blob} 复用)
provides:
  - BaseLayout 统一 SEO/OG/canonical head (title/description/ogImage?)
  - /tools 与 /anime 可导航空状态占位页
  - /404 错误状态页
  - public/og-default.png 站点级默认 OG 兜底图 (1200×630)
affects: [01-01, 01-02, 工具库-phase2, 追番-phase3]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "baseLayout 统一 head: canonical via new URL(Astro.url.pathname, Astro.site); og 通过 ?? '/og-default.png' 回退"
    - "SEO 块置于 is:inline 防 FOUC 脚本+charset+viewport+favicon+title 之后,不动既有结构"
    - "占位页与 404 走 BaseLayout 默认 title 路径 (fullTitle seam 留给首页)"
    - "装饰 SVG 与 Blob 同源 motion-safe / prefers-reduced-motion 动效收敛"

key-files:
  created:
    - src/pages/tools/index.astro
    - src/pages/anime/index.astro
    - src/pages/404.astro
    - public/og-default.png
  modified:
    - src/layouts/BaseLayout.astro

key-decisions:
  - "ogImage 默认 '/og-default.png' 经 new URL 与 site 拼接,构建期产绝对 URL"
  - "placeholder PNG 用纯 Zlib 自定义 1200×630 纯色 (#17B6D6) 脚本生成,占位质量,真实 OG 由 owner 后补"
  - "404 复用既有 Star 做漂浮装饰 (aria-hidden / motion-safe),未引入新组件"

requirements-completed: [INFRA-06]

# Metrics
duration: ~25min
completed: 2026-07-15
---

# Phase 01 Plan 03: 导航占位页与全站 SEO Summary

**在 01-02 统一 BaseLayout 上叠加全站 SEO/OG/canonical 块,并落地 /tools、/anime 空状态占位页 + /404 错误页,使首页两入口卡可导航不 404、站点可被搜索引擎收录**

## Performance

- **Started:** 2026-07-15
- **Completed:** 2026-07-15
- **Tasks:** 3 (全自动,无 checkpoint)
- **Files created/modified:** 5 (4 created + 1 modified)

## Accomplishments

- **Task 1**: BaseLayout.astro 扩展 `description?` / `ogImage?` props,head 追加 description、canonical、og:type/title/description/url/image、twitter:card/title/description/image。ogImage 缺失回退 `/og-default.png` 并经 Astro.site 拼成绝对 URL。生成 1200×630 纯主色占位 PNG。
- **Task 2**: `src/pages/tools/index.astro` 与 `src/pages/anime/index.astro`——共用 BaseLayout,UI-SPEC 逐字空状态("这里还空空如也～ (｡･ω･｡)" + 正文 + "回到首页" CTA),--font-display heading,主色填充 CTA。`<title>` 分别命中「工具库 · 初曦的窝」「追番记录 · 初曦的窝」。
- **Task 3**: `src/pages/404.astro`——UI-SPEC 逐字 404 文案 ("诶呀,这一页走丢了 (｡•́︿•̀｡)" + 正文 + 回首页 CTA),SVG Star 漂浮装饰 (aria-hidden,motion-safe)。构建产出 `dist/404.html` + `dist/sitemap-index.xml`(4 pages 总 total)。

## Task Commits

1. **Task 1: BaseLayout SEO head + 默认 OG 兜底图** - `5ce4c37` (feat)
2. **Task 2: /tools & /anime 占位页** - `305eb4f` (feat)
3. **Task 3: 404 错误页 + sitemap 验证** - `34e3450` (feat)

## Decisions Made

- **OG image 统一走 site 拼接**:`new URL(ogImage ?? '/og-default.png', Astro.site)`,避免相对路径 OG 被社交爬虫忽略;占位图纯主色,真实 OG 由 creator 日后提供同名文件替换,零代码改动。
- **防 FOUC 脚本与 fullTitle seam 严格保留**:is:inline 主题脚本仍是第一个 head 子元素;fullTitle override 逻辑(home 用)未触碰,仅 additive 扩展 description/ogImage。
- **404 装饰复用 Star 组件**:不新建组件,aria-hidden + focusable=false + motion-safe 动效收敛至 `prefers-reduced-motion` 静止。

## Deviations from Plan

### Auto-fixed Issues

本计划无 Rule 1/2/3 类偏差——UI-SPEC Copywriting Contract 文案逐字可用,BaseLayout 扩展为 additive 改动(仅加 prop,未改既有),无需自动修复。

### Intentional Deviations (预授权,计划明文允许)

**1. 占位 OG 图为脚本生成的纯色 PNG**
- **计划预设**:plan 明确 "若无法生成真实 PNG,用脚本生成 1200×630 纯色占位;真实 OG 由 owner 后补"。
- **实现**:Node 脚本(Zlib + 手写 PNG 块签名)生成 1200×630 纯色 `#17B6D6` PNG,4500 bytes。
- **升级路径**:owner 后补同名文件 `public/og-default.png` 即可,HEAD 代码无需变更。

## Known Placeholders (有意,非缺陷)

- **og-default.png 为纯色占位**:不含站名/logo 文字,仅主色。计划允许此阶段占位质量,真实 OG 由 owner 提供。
- **/tools、/anime 仅空状态**:完整浏览/筛选/详情属 Phase 2/3,本阶段仅保证可导航不 404。
- **无显式 Header/Footer 包裹占位页与 404**:占位/错误页选择只包 BaseLayout(SEO)而不套全站 nav,属刻意 UX 选择(用户本就是空状态,回首页 CTA 比完整导航更聚焦);后续 Phase 可统一加壳。

## Verification Results

- `npm run build` 退出 0,4 pages 构建完成 (index + tools + anime + 404)。
- dist/index.html 命中: `og:title` ×1、`rel="canonical"` ×1、`twitter:card` ×1、`og:image` → `https://chuxisite.vercel.app/og-default.png`。
- dist/tools/index.html:`<title>工具库 · 初曦的窝</title>` + 「这里还空空如也」×1 + `href="/"` 回首页。
- dist/anime/index.html:`<title>追番记录 · 初曦的窝</title>` + 「这里还空空如也」×1 + `href="/"` 回首页。
- dist/404.html:`<title>页面走丢了 · 初曦的窝</title>` + 「这一页走丢了」+ 「好像不存在」+ `href="/"`。
- dist/sitemap-index.xml 存在 (4 条 URL)。
- 首页 (01-02 landing) 未触动:build 后 dist/index.html 仍然完整包含 Hero 标语与 2× EntryCard。

## Self-Check: PASSED

- **创建文件** 4/4 FOUND:src/pages/tools/index.astro、src/pages/anime/index.astro、src/pages/404.astro、public/og-default.png (经 Glob + 文件系统确认)。
- **已提交哈希** (3 个独立原子 commit):`5ce4c37`(T1)、`305eb4f`(T2)、`34e3450`(T3)——三笔均存在于 git log。
- **验收标准逐项**:
  - BaseLayout head 输出 site+title/description/OG/canonical,防 FOUC 脚本与 fullTitle seam 保留 ✅
  - /tools、/anime 占位页用 BaseLayout 默认 title ✅
  - /404 错误页 ✅
  - public/og-default.png ≈ 1200×630 ✅
  - build 退出 0;tools/anime/404 路由与 sitemap 入库 ✅
  - index.astro (01-02) 未触动 ✅
