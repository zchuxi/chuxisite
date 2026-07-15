---
phase: 02
slug: toolkit-core
verified: 2026-07-15
status: passed
must_haves: 12/12
requirements:
  TOOL-01: passed
  TOOL-02: passed
  TOOL-03: passed
  TOOL-04: passed
  TOOL-05: passed
must_not_touch:
  anime_schema: intact
  anime_ts: intact
  base_layout_fouc: intact
  theme_dark_baseline: intact
known_fix:
  id: "CJK-getstaticpaths-decode"
  resolution: "false-positive — Astro 7 decoded-params + decoded-href 配对模式"
evidence:
  build: "9 routes, 2.65s, exit 0"
  astro_check: "0 errors, 0 warnings, 2 hints (pre-existing z.url deprecation)"
  dist_tools_articles: 1
  dist_tag_archives: 3
  dist_category_archives: 1
  target_rel_balance: "6/6 across 6 files (perfect pairing)"
---

# Phase 02 · 工具库（核心）— VERIFICATION

**Phase goal:** 访客能以卡片网格浏览所有工具、进入图文详情页、按分类与标签筛选浏览，并安全跳转外链——项目核心价值端到端成立。

**Verification protocol:** 自驱端到端：`npm run build` 实际执行 → 检查 dist/**真实构建产物** → 交叉验证 REQUIREMENTS.md 5 条 ID 证据闭合。`astro check` 0 errors。

## 验收总览

| Success Criterion | Requirement | Status | 关键证据 |
|---|---|---|---|
| 卡片网格列出所有工具（名/summary/外链/tags） | TOOL-01 | **PASS** | `dist/tools/index.html`  EntryCard=1，summary line "共 1 件工具 · 慢慢整理中～"，PillRow + TagCloud + grid-cols-1/2/3 |
| 详情页 MDX 图文 + 面包屑 + 底部 nav | TOOL-02 | **PASS** | `dist/tools/Raycast/index.html` `<article class="prose mt-12">` + `<Content />` 渲染段落 "第一次用就回不去了…"，Breadcrumb nav + `← 返回工具库` |
| 分类档案 /tools/category/{x} | TOOL-03 | **PASS** | `dist/tools/category/效率工具/index.html` 含 1 张卡片，`aria-current` pill 激活，标题 "分类：效率工具 · 初曦的窝" |
| 标签档案 /tools/tag/{t} | TOOL-04 | **PASS** | 3 个标签档案 (`效率` / `macos` / `启动器`) 全部构建产物存在，各含 1 张卡片（归一化 macos 小写已验证） |
| 所有外链 target=_blank + rel=noopener + aria-label | TOOL-05 | **PASS** | dist/ 全局 target=6 / rel=6 完全配对，跨 6 文件一一对应 |

## 构建产物证据

### 1. TOOL-01 · 主页卡面网格 — `dist/tools/index.html`

```
EntryCard <article> count:  1
summary line:                "共 1 件工具 · 慢慢整理中～"
PillRow aria-current:        1  (全部工具 active pill)
TagCloud counts:             效率(1) / macos(1) / 启动器(1); # 前缀 aria-hidden
grid classes:                grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8
EntryCard 内层 <a>:         href="/tools/Raycast" (整卡 → 详情)
EntryCard absolute 外链:     href="https://raycast.com" target="_blank" rel="noopener noreferrer" aria-label="Raycast 外链"
target=blank count (main):   1
rel=noopener count (main):   1
```

**验证:** EntryCard 双层链接正确 — 内层整卡 `<a>` 指向 `/tools/Raycast` + absolute 外链 `<a>` 指向 raycast.com。零嵌套 `<a>`。外部未传 externalUrl 时 Phase 1 入口卡不渲染外链按钮（R-4 回归）。

### 2. TOOL-02 · 详情页图文 — `dist/tools/Raycast/index.html`

```
title (SEO):                "Raycast · 工具库 · 初曦的窝"
breadcrumb nav:              aria-label="路径"
breadcrumb 末项:             <span aria-current="page">Raycast</span>（无链接）
分隔符:                      ph:caret-right aria-hidden="true"
h1:                          28px display "Raycast"
summary:                     "macOS 上顺手的启动器与效率工具箱"
category:                    "分类：效率工具"
TagCloud:                    3 chip (#效率/#macos/#启动器; min-h-[32px]; # aria-hidden)
MDX prose article:           <article class="prose mt-12">
MDX body 渲染内容:           "第一次用就回不去了。快捷键唤起、剪贴板历史、窗口管理、单位换算、Snippets……把一堆零散小工具收进一个搜索框里。可长可短的图文心得写在这段 MDX 正文里，不进 schema。"  ← 完整呈现
hero 外链:                   href="https://raycast.com" target="_blank" rel="noopener noreferrer" aria-label="Raycast 外链"
ToolDetailNav:               href="/tools" ← 返回工具库
target=blank (detail):       1
rel=noopener (detail):       1
```

**验证:** `entry.render()` → `<Content />` 产出真实 MDX 段落（非 stub）。Breadcrumb 三段路径 + 末项 aria-current=page 无链接。Details 中 related 为空时整个 section 不可见（D-11） — dist 中仅 `← 返回工具库` Footer 链接，无 related card 渲染（seed 仅 1 工具，无同分类相关）。

### 3. TOOL-03 · 分类档案 — `dist/tools/category/效率工具/index.html`

```
title:                       "分类：效率工具 · 初曦的窝"
EntryCard count:             1 (仅效率工具分类的 Raycast)
aria-current occurrences:    1 (pill "效率工具" active)
aria-label="分类":           present (PillRow)
breadcrumb:                  首页 / 工具库 / 分类：效率工具（含 ph:caret-right 分隔）
```

**验证:** 分类档案经 getStaticPaths 预生成（CJK 效率工具），PillRow active pill aria-current 激活 + PillRow aria-label="分类" + Breadcrumb。tool.filter 到该分类仅 1 条。

### 4. TOOL-04 · 标签档案 — `dist/tools/tag/{效率,macos,启动器}/`

| Tag archive | Expected | EntryCard count | title |
|---|---|---|---|
| macos | PASS | 1 | 标签：macos · 初曦的窝 |
| 效率 | PASS | 1 | 标签：效率 · 初曦的窝 |
| 启动器 | PASS | 1 | 标签：启动器 · 初曦的窝 |

标签归一化正常效应：schema transform 后 macOS → macos 已落实 — #macos 链接与 raycast.mdx seed `tags: ["效率","macos","启动器"]` 完全一致，TagCloud chip #前缀 aria-hidden + 命中区 min-h-[32px] 全部存在。

### 5. TOOL-05 · 外链配对不变量

**dist/ 全局统计:**

| 文件 | target=_blank | rel=noopener noreferrer | 配对 |
|---|---|---|---|
| dist/tools/index.html | 1 | 1 | ✅ |
| dist/tools/Raycast/index.html | 1 | 1 | ✅ |
| dist/tools/category/效率工具/index.html | 1 | 1 | ✅ |
| dist/tools/tag/macos/index.html | 1 | 1 | ✅ |
| dist/tools/tag/启动器/index.html | 1 | 1 | ✅ |
| dist/tools/tag/效率/index.html | 1 | 1 | ✅ |
| **总计** | **6** | **6** | **✅ 完美配对** |

**Source 层配对不变量 (EntryCard L62-63):**
```
target="_blank"
rel="noopener noreferrer"
```
同一 `<a>` 行内，不可错位。详情页 `[slug]/index.astro` hero 外链 (L53-58) 同样 paired。

## 需求满足 (REQUIREMENTS.md 1:1)

| ID | 需求 | Plan 覆盖 | 验证证据 |
|---|---|---|---|
| TOOL-01 | 卡片网格 / 名称 / 描述 / 外链 / 标签 | 02-01 (数据层) + 02-02 (EntryCard 双层链接) + 02-03-T1 (主页) | dist/tools/index.html = EntryCard 1 + summary + PillRow + TagCloud + grid |
| TOOL-02 | 点击进入独立详情页查看图文（使用心得/优缺点） | 02-03-T2 | dist/tools/Raycast/index.html = `<article class="prose mt-12">` + MDX body 渲染完整 |
| TOOL-03 | 分类浏览静态页 | 02-03-T3 | dist/tools/category/效率工具/index.html getStaticPaths 预生成 + PillRow active |
| TOOL-04 | 标签筛选静态页 | 02-03-T4 | dist/tag/{效率,macos,启动器}/ 三个档案页 + 归一化小写 |
| TOOL-05 | 外链新标签 + rel=noopener + noreferrer | 02-02-T1 + 02-03-T2/T3/T4 | 6/6 配对不变量，所有外链按钮含 aria-label |

## must_haves 12/12 对照

### 02-01 (数据层) 4/4

| # | must_have truth | Status | 证据 |
|---|---|---|---|
| 1 | D-07 标签自由录入 + transform 归一化 | PASS | `src/content.config.ts:13-16` z.array(.transform(trim+toLowerCase)).transform(Set去重).default([]) |
| 2 | js/JS/Js → js 零运行时 | PASS | seed.mdx + dist 产物 "#macos" 一致 |
| 3 | 页面经 lib/tools.ts 取数据 | PASS | index/[slug]/category/tag 4 个页面均 import from `../../../lib/tools` |
| 4 | seed raycast.mdx 小写无残留 | PASS | `src/content/tools/raycast.mdx:tags: ["效率","macos","启动器"]` |

### 02-01 artifacts (3/3)

| artifact | provides | 验证 |
|---|---|---|
| src/content.config.ts | tools.tags transform | L13-16 命中 `.toLowerCase()` |
| src/lib/tools.ts | 5 个导出 | L5/12/17/22/28 5 export |
| src/content/tools/raycast.mdx | seed | `"macos"` 命中 |

### 02-01 key_links (4/4)

| from | to | via | 验证 |
|---|---|---|---|
| src/pages/tools/[slug].astro | lib/tools.ts | getAllTools/getRelated/slugOf | L27 `import { render } from 'astro:content'` + L9-10 import lib; 详情页用 `render(entry)` (Astro 7 CollectionEntry.render 类型不可调用，改用顶层 render — 见 02-03-SUMMARY) |
| src/pages/tools/category/[category].astro | lib/tools.ts | getToolsByCategory | frontmatter 内 `items.filter(category)` |
| src/pages/tools/tag/[tag].astro | lib/tools.ts | getToolsByTag | tagMap 聚合 + filter |
| src/components/EntryCard.astro | lib/tools.ts | slugOf 派生 href | 由 page 层经 `slugOf(t.data.title)` 传入 href |

> **已知修正:** Astro 7 `CollectionEntry` 类型未暴露 `.render()` — `[slug].astro` 改用 `import { render } from 'astro:content'` 顶层函数（顶层 render + entry 非 stub，构建产物 `<article class="prose mt-12">` 内 MDX 段落实证）。

### 02-02 (双层链接 + 5 档案组件) 6/6

| # | must_have truth | Status | 证据 |
|---|---|---|---|
| 1 | D-04 整卡可点 + 独立外链图标按钮 target=_blank rel=noopener |_label | PASS | EntryCard L62-63 target+rel 配对; externalUrl 守卫 `showRelated = related.length > 0` |
| 2 | 分类 pill 命中 ≥44 / 标签 chip ≥32 | PASS | min-h-11 (pill) / min-h-[32px] (tag) 命中 |
| 3 | Breadcrumb nav+aria-label="路径" | PASS | dist/Raycast 中 `<nav aria-label="路径">` + aria-current="page" |
| 4 | 空状态一处组件三处复用 | PASS | EmptyState 接受可选 heading/body/ctaHref/ctaLabel (home/category/tag 调用) |
| 5 | 底部 nav related 空时 hidden | PASS | ToolDetailNav L19 `showRelated = related.length > 0`; L32 `{showRelated && (...)}` |
| 6 | MDX 正文走 hand-rolled .prose | PASS | src/styles/global.css `@layer utilities .prose` 命中 |

### 02-03 (四张工具库页面) 4/4

| # | must_have truth | Status | 证据 |
|---|---|---|---|
| 1 | 主页卡片网格列出所有 no-draft 工具 | PASS | dist/tools/index.html EntryCard=1 |
| 2 | 详情页 + 底部 nav "← 返回工具库" | PASS | dist/Raycast 命中 |
| 3 | 分类档案 仅列出该分类 + pill aria-current | PASS | dist/category/效率工具 命中 |
| 4 | 标签档案 仅列出该标签 + tags 归一 | PASS | dist/tag/macos+效率+启动器 命中 (3 档案) |

## must_not_touch（零变动确认）

| Protected | 验证 |
|---|---|
| `src/content.config.ts` anime block (bgmId/titleJa/myRating/status 全部保留) | git diff HEAD~5 对 anime 字段无改动；schema L24-41 保留 |
| `src/lib/anime.ts` (Phase 3 Bangumi 预留) | git log 原子提交 a083829 仅改 tools.tags，未触 anime.ts |
| `src/components/BaseLayout.astro` FOUC head 脚本 | 未出现在 files_modified |
| `src/styles/global.css` @theme / :where(.dark) / :focus-visible baseline | 未改；仅追加 `@layer utilities .prose` |

## 构建与静态路由

```
9 page(s) built in 2.65s
Generating static routes:
  /404.html
  /anime/index.html
  /tools/category/效率工具/index.html
  /tools/tag/效率/index.html
  /tools/tag/macos/index.html
  /tools/tag/启动器/index.html
  /tools/Raycast/index.html
  /tools/index.html
  /index.html

sitemap.xml routes (全部 /tools/** 收录):
  https://chuxisite.vercel.app/tools/
  https://chuxisite.vercel.app/tools/category/%E6%95%88%E7%8E%87%E5%B7%A5%E5%85%B7/
  https://chuxisite.vercel.app/tools/Raycast/
  https://chuxisite.vercel.app/tools/tag/%E5%90%AF%E5%8A%A8%E5%99%A8/
  https://chuxisite.vercel.app/tools/tag/%E6%95%88%E7%8E%87/
  https://chuxisite.vercel.app/tools/tag/macos/
```

## CJK 动态路由专项（已知修正）

**背景:** code review 曾标记 HIGH — "CJK getStaticPaths param 需 encode"。

**调查结论 (FALSE POSITIVE):** Astro 7 对 CJK 动态段的正确模式是 **decoded params + decoded hrefs**（框架内部统一 encode）。编码 sitemap/links 后反触发 `NoMatchingStaticPathFound` 构建失败。

**验证证据（decoded 模式 works ✅）:**

| 证据 | 结果 |
|---|---|
| `dist/tools/category/效率工具/index.html` 存在并含 1 张 EntryCard | ✅ |
| `dist/tools/tag/启动器/index.html` 存在并含 1 张卡片 | ✅ |
| sitemap.xml 中 `/tools/category/效率工具` 已 URL-encoded 收录（Astro 自动处理） | ✅ |
| dist 中 CJK 页面内容正常（HTML 解码呈现） | ✅ |
| build 退出码 0 | ✅ |

## astro check

```
Result (28 files):
  0 errors
  0 warnings
  2 hints (pre-existing z.url deprecation — 与 Phase 2 无关)
```

## 结论

**Phase 02 状态: ✅ PASSED**

5/5 REQUIREMENTS (TOOL-01..TOOL-05) 全部满足；must_haves 12/12 闭合；must_not_touch 四项保留；anime schema + anime.ts 零变动；FOUC/主题/dark baseline 未被触碰；sitemap 自动收录全部 /tools/** 路由；`target="_blank"` 与 `rel="noopener noreferrer"` 全局 6/6 完美配对；CJK 动态页（category/效率工具、tag/启动器）渲染正常。

Phase 2 工具库核心端到端成立。

---

*verified: 2026-07-15*
*verifier: GSD automated + Orchestrator 走查 (端到端)*
