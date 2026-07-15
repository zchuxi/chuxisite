---
phase: 01-foundation-shell
reviewed: 2026-07-15
depth: standard
files_reviewed: 23
reviewer: claude
findings:
  critical: 0
  warning: 3
  info: 5
  total: 8
status: issues_found
---

# Phase 1 Foundation Shell — Code Review

标准深度审查 23 个源文件。构建通过（`astro build` 0 错误、`astro check` 0 错误，仅两条 Zod 已弃用 hint，与本阶段无关）。数据层、亮/暗主题、`site`/sitemap/OG 管线的实现与 REQUIREMENTS / UI-SPEC 合同整体对齐，没有阻断问题。下面按 WARN → INFO 列出。

---

## Warnings

### W-01 · 空状态 / 404 页 CTA 触控目标不足 44px（无障碍）

**文件**: `src/pages/tools/index.astro:14-18`、`src/pages/anime/index.astro:14-18`、`src/pages/404.astro:18-22`
**问题**: 「回到首页」按钮只有 `px-6 py-2.5`，没有 `min-h-11`。`py-2.5`（上下 10px）+ `text-sm` 行高约 20px ≈ 总高超不过 40–42px，边界 44×44。UI-SPEC §A11y 明确要求交互触控目标 ≥44px；本页缺失会危及移动端点按。
**修复**: 三个页面的 CTA 链接统一加上 `min-h-11`：
```astro
class="... min-h-11 inline-flex items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-2.5 font-semibold text-[var(--color-primary-fg)] ..."
```
（`EntryCard`、Hero、Header、ThemeToggle 已是 `size-11`/`min-h-11`，只有这三处漏接。）

### W-02 · BaseLayout 注释承诺「字体 preload 在前」却无 preload 链接

**文件**: `src/layouts/BaseLayout.astro:31`
**问题**: `global.css` 头注释与 BaseLayout 注释都提到「字体 preload 在前」；UI-SPEC §Typography 锁定「`substr集 + preload + font-display: swap`」。但 `<head>` 中没有 `<link rel="preload" as="font" crossorigin>`，字体直到首次渲染才加载，标题区布局会受 CLS/字体回退影响（Headless 无真实 FOUC，但视觉跳动可感知）。
**修复**: 在 `<meta charset>` 之后加入两条 preload（self-hosted woff2 + `@font-source` 任一硬编码字面）。因为 `font-family` 断言 `ZCOOL KuaiLe` 用子集 woff2、Fredoka 走 `@font-source`，需与 `global.css` 路径一致：
```astro
<link rel="preload" as="font" href="/fonts/zcool-subset.woff2" type="font/woff2" crossorigin />
```
Fredoka 来自 `@font-source-variable` 包（多 uuid 文件），无需逐条preload；自托管子集这一块值得预加载。

### W-03 · `astro:assets` `cover` 仅声明未在页面消费，种子数据也未补图

**文件**: `src/content.config.ts:15,30`
**问题**: `tools.cover`、`anime.cover` 都是 `image().optional()` / `z.union([image(), url()]).optional()`，但当前没有任何 `tools/index.astro` / `anime/index.astro`（为空壳占位页）消费 Image，种子也未上传图（只统计数）。这是功能缺口而非 bug，但 UI-SPEC §Hero/Entrycard 占位 blob 是正确占位；仅提醒）——本次阶段故意把图后置，**不作为失败**，但应在 Phase 1 结束前补最小覆盖：任意一张本地 cover 能走 `astro:assets` + `image()` schema 路径，否则 schema / 包在构建期不会执行；`remotePatterns` for `lain.bgm.tv` 也不会被验证。
**修复**: 在 review 后补一张试拍 cover，或在 `anime/index.astro`（真实列表页）启用 `Astro.props` 前，保持现状并在 SUMMARY 跟踪。

---

## Info (non-blocking)

### I-01 ·「防 FOUC」内联脚本已是 `<head>` 首个子元素
`src/layouts/BaseLayout.astro:21-26`。`is:inline`、阻塞、在绘制前 `<html>` 加 `.dark`，与 UI-SPEC §Theme 对齐。亮/暗分支用 `?? matchMedia('(prefers-color-scheme: dark)')` 回退（class 策略非 media），正确。

### I-02 · ThemeToggle 仅写 `localStorage` 主题偏好，无敏感数据
`src/components/ThemeToggle.astro:16-22`。只记录 `'dark'`/`'light'`，零信任风险。脚本是 module defer，按钮 `id="theme-toggle"` 唯一。✓。

### I-03 · 装饰 SVG 全部 `aria-hidden` + `focusable=false`
`src/components/deco/{Blob,Divider,Heart,Star}.astro` 四个组件都带 `aria-hidden="true"`；绝对定位元素另加 `pointer-events-none`。Hero/404 漂浮星点同样 ✓。内嵌 Logo 星星在链接中也被隐藏，链接可访问名仅为「初曦的窝」。✓。

### I-04 · 数据层合同：页面都经 lib 收口，未直调 `getCollection`
`src/pages/index.astro` 仅用 `getAllTools()`/`getAllAnime()`，`src/lib/{tools,anime}.ts` 是唯二的 `getCollection` 入口 ⚠️。P1 番剧 Bangumi API 可插拔的收合同履行。`progress.default(0)` / `tags.default([])` 按 schema 运行时升位，✓。

### I-05 · `motion-safe:` 已编译生效
`EntryCard.astro` hover 上浮 与 箭头 translate 都包在 `motion-safe:` 下，编译产出含对应 `@media (prefers-reduced-motion:no-preference)` 包裹的 keyframe 动画，✓。Hero/Blob 内部动效同样包 `@media (prefers-reduced-motion: reduce){animation: none}`，✓。

---

## 关键通过项（未写入 findings 但核查通过）

- **Tailwind v4 `@theme`**: `--font-display/--font-body/--radius-*`/`--color-*`/`--shadow-soft` 完整覆盖 UI-SPEC 调色板，暗色覆盖写在 `:where(.dark)` 而非第二 `@theme`，路径正确；`--shadow-soft` 暗色透明度降到 0.15 抗发灰 ✓。
- **防 FOUC 脚本 + ThemeToggle 双源互相不冲突**：初回由内联脚本根据 `localStorage` 决策，切换由 button script 接管，`localStorage.setItem` 保持一致。
- **`site` / sitemap / canonical / OG**：`site: 'https://chuxisite.vercel.app'` + sitemap + `canonical` + OG `og:url`/`og:image` 都用 `new URL(... , Astro.site)` 构造，同一来源，无错配。
- **`<html lang="zh-CN">`，`og:type=website`，`twitter:card=summary_large_image`**：三位 meta 齐活。
- **`classes.config.ts` 用 `glob({ base, pattern })` loader + `image()` + Zod**，无旧 `content/config.ts` 无 loader 反模式（CLAUDE.md 禁止的已避）。
- **`image.remotePatterns` 已预铺 `lain.bgm.tv`**：P4 路径预备正确。
- **`astro check` / `astro build`**：0 error, 0 warning, `sitemap-index.xml` 落地，四页 `/` `/tools/` `/anime/` `/404.html` 都生成。

---

## 小结

阶段内「地基 + 二次元外壳」落地稳：主题、SEO/OG、A11y 装饰隐藏、数据层合同全部到位，关键路径已验证。需处理 **W-01（CTA 触控目标≥44px）** 才能发布；W-02（字体 preload）与 W-03（cover 消费）为体验/覆盖率提升灯，建议同一批次跟进。
