# Phase 1 Plan Outline — 站点地基与二次元外壳

**Phase:** 1 (01-foundation-shell)
**Mode:** mvp（垂直切片）
**Generated:** 2026-07-14
**Plans:** 3

## Phase Goal (User Story)

**As a** 访客，**I want to** 打开一个已部署上线、鲜艳可爱二次元风格、响应式、可切换亮/暗主题的站点首页，并从首页进入工具库/追番两大入口，**so that** 我能快速了解这个站点、进入两大模块，且站点可被搜索引擎收录。

## Plans

| Plan ID | Objective | Wave | Depends On | Requirements |
|---------|-----------|------|------------|--------------|
| 01-01 | Walking Skeleton：脚手架 Astro 7 + Tailwind v4 + MDX + preact + @astrojs/sitemap + astro-icon；建立 BaseLayout、`content.config.ts`（tools + anime 分层 schema，per CONTEXT 蓝本）、`lib/tools.ts`/`lib/anime.ts` 薄数据层；预置 1–2 条工具 + 1–2 条番剧种子内容并经 Zod 校验渲染；主题系统（`<head>` `is:inline` 防 FOUC + 原生 `<script>` 切换按钮 + localStorage 记忆）；最小首页渲染；部署 Vercel 并回填 `site`（含 2 个人工检查点：Vercel 部署授权 + 首屏无 FOUC 人工验证） | 1 | none | INFRA-01, INFRA-02, INFRA-04 |
| 01-02 | 二次元视觉外壳 + 首页落地页：Tailwind `@theme` 令牌（亮/暗配色、圆角、阴影、装饰字体 Fredoka + ZCOOL KuaiLe 子集），Header/Nav/ThemeToggle/Footer 组件，装饰性 SVG；首页 Hero（大插画占位 + 回退）+ IntroBlock 站点简介 + 2× EntryCard 链接 `/tools` `/anime`；全站响应式（移动端/桌面无错位）。所有取值以 01-UI-SPEC.md 为准 | 2 | 01-01 | INFRA-03, INFRA-05, INFRA-07 |
| 01-03 | 导航占位页 + SEO：`/tools`、`/anime` 带空状态文案的可导航占位页（文案见 UI-SPEC）、`/404`；BaseLayout SEO meta（title 模式「{页面} · 初曦的窝」/ description / Open Graph / canonical，依赖 `site`）；@astrojs/sitemap 生成 sitemap.xml；默认 OG 图 | 2 | 01-01 | INFRA-06 |

## Requirement Coverage Check

- INFRA-01 → 01-01 ✓
- INFRA-02 → 01-01 ✓
- INFRA-03 → 01-02 ✓
- INFRA-04 → 01-01 ✓
- INFRA-05 → 01-02 ✓
- INFRA-06 → 01-03 ✓
- INFRA-07 → 01-02 ✓

All INFRA-01..07 mapped. 0 orphaned.

## Wave Structure

- **Wave 1:** 01-01（Walking Skeleton，建立所有下游依赖的地基）
- **Wave 2:** 01-02、01-03（并行；files_modified 无重叠——01-02 拥有 `styles/`、`components/`、`pages/index.astro`；01-03 拥有 `pages/tools`、`pages/anime`、`pages/404.astro`、BaseLayout SEO 块、sitemap 配置）

## OUTLINE COMPLETE — 3 plans
