# Project State

**Project:** 二次元个人网站（工具库 + 追番记录）
**Last updated:** 2026-07-14

## Project Reference

- **Core Value:** 工具库要好用——能清晰地分类、浏览、快速找到之前记录的工具，并为每个工具保留可长可短的图文说明
- **Current Focus:** Phase 1 — 站点地基与二次元外壳
- **Mode:** mvp（垂直 MVP）
- **Stack:** Astro 7 + Tailwind v4 (@tailwindcss/vite) + @astrojs/mdx + Preact + @astrojs/sitemap，静态部署 Vercel/Netlify

## Current Position

- **Phase:** 1 / 3
- **Plan:** None yet（待 `/gsd:plan-phase 1`）
- **Status:** Roadmap 已创建，待规划 Phase 1
- **Progress:** [░░░] 0/3 phases complete

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases complete | 0/3 |
| Requirements delivered | 0/17 |
| Current phase | 1 — 站点地基与二次元外壳 |

## Accumulated Context

### Key Decisions
- 采用 Astro + Tailwind CSS 静态站，改文件 + git 自动部署（无后台/无数据库）
- Tailwind v4 经 `@tailwindcss/vite`（CSS-first），不用弃用的 `@astrojs/tailwind`
- 内容用 Content Layer API（`content.config.ts` + glob loader + Zod）
- 番剧 schema 分层（客观元数据组含 bgmId 预留 + 追番状态组永远手动），数据读取收口 `lib/anime.ts`，为 Bangumi API 迁移铺路
- 主题初始应用走 `<head>` 内联同步脚本防 FOUC；岛屿最小化，默认全静态 `.astro`
- 工具库优先级高于追番（核心价值）

### Todos
- 待 `/gsd:plan-phase 1` 分解 Phase 1

### Blockers
- None

### Open Questions
- Bangumi API 具体字段（collection.status 枚举 / rating 结构）在未来集成阶段二次核对
- 内容规模拐点（何时上 Pagefind 全文搜索）待实际增长评估

## Session Continuity

**Last session:** 2026-07-14 — 初始化项目并创建 roadmap（3 阶段，17/17 需求覆盖）

**Next action:** `/gsd:plan-phase 1` — 规划「站点地基与二次元外壳」

---
*State initialized: 2026-07-14*
