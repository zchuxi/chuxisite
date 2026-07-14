# Walking Skeleton — 初曦的窝（二次元个人网站）

**Phase:** 1
**Generated:** 2026-07-14

## Capability Proven End-to-End

访客能打开一个已部署到 Vercel 的静态站点首页，看到从 Markdown 种子内容（经 Zod schema 校验）渲染出的站名与内容，切换亮/暗主题（首屏无 FOUC、刷新保留），且站点输出 sitemap.xml —— 从「改内容文件 → git push → 构建校验 → CDN 上线 → 浏览器渲染+主题交互」全链路打通。

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Astro 7.0.9（`output:'static'`，`--template minimal --typescript strict`） | 已定栈；静态优先、默认零 JS；免 Vercel 适配器 |
| 样式 | Tailwind v4（`@tailwindcss/vite`，CSS-first `@theme`，无 config.js） | 令牌驱动、暗色靠 `.dark` 作用域重定义变量 |
| 数据层 | Content Layer（`glob` loader）+ Zod schema，页面经 `lib/tools.ts`/`lib/anime.ts` 薄封装读取，不直接 `getCollection` | 构建期类型安全校验；番剧数据源可插拔（预留 Bangumi）|
| 番剧 schema | 分层：客观元数据组（`bgmId?` 预留 / `titleCn` / `cover` …）+ 追番状态组（`status` / `myRating?` / `progress` …） | 未来 Bangumi API 覆盖元数据组不重写页面（P1）|
| 主题 | class 策略 + `<head>` `is:inline` 阻塞脚本（防 FOUC）+ 原生 `<script>` 切换按钮，localStorage 记忆 | 绘制前定主题、零框架、无岛屿（P3/P6）|
| 图标 / 字体 | astro-icon + `@iconify-json/ph`；Fredoka（fontsource 变体）+ ZCOOL KuaiLe（pyftsubset 子集）仅标题用 | 零运行时 SVG；CJK 字体子集避免 >1MB（P5）|
| Deployment target | Vercel（git push 自动构建，默认 `xxx.vercel.app` 域名，首次部署后回填 `site`） | D-04/D-05；免运维 |
| Directory layout | 就地仓库根（`.`）；`src/{content.config.ts, content/, layouts/, pages/, components/, lib/, styles/, assets/}` + `public/` | 避免嵌套多套 node_modules（ARCHITECTURE）|

## Stack Touched in Phase 1

- [x] Project scaffold（Astro 7 + Tailwind v4 + MDX + sitemap + astro-icon；`npm run build` 绿）
- [x] Routing — `/`（首页）+ `/tools`、`/anime` 占位 + `/404`
- [x] Data — Content Layer + Zod 校验 2 条种子（tools ×1、anime ×1），经 `lib/*` 读取渲染到页面（构建期「读」；「写」= 维护者改 .mdx + git push 触发重建）
- [x] UI — 主题切换按钮（原生 `<script>` 写 localStorage + toggle `.dark`）
- [x] Deployment — Vercel 生产部署，`site` 回填真实域名

> 注：静态站无运行时数据库写；「一次真实写」由「新增/修改 Markdown → git 提交 → 自动构建部署」这一内容管道满足（成功标准 4）。

## Out of Scope (Deferred to Later Slices)

- 工具卡片网格 / 详情页 / 分类页 / 标签页 / 外链安全强化 → Phase 2（TOOL-01..05）
- 追番列表 / 状态筛选 / 评分进度短评 / 详情页 → Phase 3（ANIME-01..05）
- 客户端搜索、组合筛选（v2 SEARCH）、RSS / 最近更新（v1.x FEED）、统计（v2 STAT）、Bangumi API 自动拉取（v2 API-01，本阶段仅 schema/config 预留）
- 自定义域名（首次上线用默认域名后再接）
- Preact 岛屿 / nanostores / pagefind（本阶段零依赖，P8）

## Subsequent Slice Plan

- **Phase 2 — 工具库（核心）：** 在既有 `tools` 集合 + `lib/tools.ts` 上加卡片网格、图文详情页、分类/标签静态页、外链 `rel="noopener noreferrer"`。
- **Phase 3 — 追番记录：** 在既有 `anime` 分层 schema + `lib/anime.ts` 上加列表、状态筛选、评分/进度/短评、详情页；数据层已为 Bangumi 换源预留。
