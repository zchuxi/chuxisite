# Phase 1: 站点地基与二次元外壳 - Context

**Gathered:** 2026-07-14
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段交付一个**可部署上线、响应式、可切换亮/暗主题、鲜艳可爱二次元风格的站点外壳 + 落地首页**，并定义**工具与番剧两个内容集合的类型安全数据模型**（Content Layer + Zod schema），输出 sitemap + 基础 SEO meta。覆盖 INFRA-01..07。

**在范围内**：脚手架与部署管道、BaseLayout/导航/页脚、主题系统（防 FOUC）、二次元视觉基线、首页（Hero + 简介 + 两大入口卡）、两个内容集合 schema、sitemap/SEO、`/tools` 与 `/anime` 的**可导航路由占位页（空状态样式）**、各 1–2 条种子示例内容以验证 schema 与构建管道。

**不在范围内**：工具卡片浏览/详情/分类标签页（Phase 2）、追番列表/状态筛选/评分进度短评/详情（Phase 3）、搜索、RSS、统计、Bangumi API 接入。首页不含「最近更新」（已推迟到 v1.x）。
</domain>

<decisions>
## Implementation Decisions

### 站点品牌（Branding）
- **D-01:** 站点名称 = **初曦的窝**。用于 Logo/Wordmark（配一个星星 ✦ 装饰，`aria-hidden`，per UI-SPEC）、浏览器标题、SEO。
- **D-02:** SEO title 模式 = `{页面标题} · 初曦的窝`（覆盖 UI-SPEC 中的占位「二次元小站」）。
- **D-03:** Hero 标语（氛围型）= **「工具、番剧、和一点点生活」**。可后续随时修改。

### 部署与站点 URL（Deploy）
- **D-04:** 部署平台 = **Vercel**（git push 自动构建，`output: 'static'` 免适配器）。
- **D-05:** 域名 = 先用 Vercel 默认生产域名（`xxx.vercel.app`）。`astro.config` 的 `site` 先填该生产 URL，**首次部署确定域名后回填/更新**；自定义域名日后再接。sitemap/canonical/OG 均依赖 `site`，必须设置一个有效值。

### 种子示例内容 & 首页入口（Seed & Homepage）
- **D-06:** Phase 1 预置**工具 1–2 条 + 番剧 1–2 条真实示例内容**，用于验证 schema 校验与构建管道、并让首页不空。用户日后直接改这些文件。
- **D-07:** 首页两个入口卡**可点击**，分别链接到 `/tools` 与 `/anime`。
- **D-08:** `/tools` 与 `/anime` 在本阶段做成**带空状态文案的可导航占位页**（空状态文案见 UI-SPEC）。完整的浏览/筛选/详情 UI 属 Phase 2/3；本阶段只保证外壳可导航、路由不 404。

### Claude's Discretion
用户未选择「数据模型字段」灰区，授权我按研究蓝本（STACK.md/ARCHITECTURE.md）落定，记录如下默认，planner 可据此细化：
- **工具 schema**：`title` / `url`(url) / `summary`(一句话) / `tags`(string[]) / `category`(单个 string，单选) / `cover`(image() 可选) / `draft`(默认 false)。工具的「优缺点/使用心得」放 MDX 正文，不做结构化字段（保持轻量，v1）；工具评分不在需求内，不加。
- **番剧 schema**：按研究的**分层设计**——客观元数据组 `bgmId?`(number,预留) / `titleJa?` / `titleCn` / `cover`(image|url,兼容本地/远程) / `episodes?` / `airDate?`；追番状态组 `status`('watching'|'done'|'plan') / `myRating?`(0–10) / `progress`(默认 0) / `comment?` / `draft`。
- **数据访问**：页面经 `lib/tools.ts` / `lib/anime.ts` 薄封装读取，不直接 `getCollection`（保番剧换源可插拔，per ARCHITECTURE）。
- `astro.config` 预配 `image.remotePatterns`（如 `lain.bgm.tv`）为 Bangumi 远程封面铺路，即使本阶段未用。
- 主题切换按钮实现优先原生 `<script>`（非 Preact 岛屿），主题初始化走 `<head>` 内联阻塞脚本。
- 装饰字体（Fredoka + ZCOOL KuaiLe）子集化 + preload，仅用于标题。
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 设计契约（最高优先，本阶段视觉/交互/文案的唯一契约）
- `.planning/phases/01-foundation-shell/01-UI-SPEC.md` — 已批准的 UI 设计契约：配色 token（亮/暗）、圆角、字体策略、间距、Hero 规格与占位回退、主题防 FOUC 方案、文案（含空状态/404）、SEO/OG 契约、组件清单、无障碍规则。**MUST read before planning。**

### 项目与需求
- `.planning/PROJECT.md` — 项目定位、核心价值、关键决策
- `.planning/REQUIREMENTS.md` §站点基础设施 — INFRA-01..07 需求原文
- `.planning/ROADMAP.md` §Phase 1 — 目标与 5 条成功标准

### 技术研究（栈、schema 蓝本、构建顺序、坑）
- `.planning/research/SUMMARY.md` — 栈总览、表桩、坑、建议构建顺序
- `.planning/research/STACK.md` — Astro 7 / Tailwind v4 / MDX / Preact 具体版本与 `content.config.ts` schema 蓝本、Tailwind v4 暗色策略
- `.planning/research/ARCHITECTURE.md` — 目录布局、`lib/*` 薄数据层、可插拔番剧数据源、建议构建顺序
- `.planning/research/PITFALLS.md` — P1 数据层分层、P2 版本迁移、P3 主题 FOUC、P4 图片优化、P5 CJK 字体成本、P6/P7 岛屿/筛选过度工程、P8 过度工程
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 无现存代码（greenfield）。本阶段即建立基础，供 Phase 2/3 复用。

### Established Patterns
- 待本阶段建立的、后续阶段依赖的基础：`BaseLayout.astro`、`content.config.ts`（两集合 schema）、`lib/tools.ts` / `lib/anime.ts` 薄数据层、Tailwind v4 `@theme` token（颜色/圆角/间距/字体）、主题系统、组件（Header/Nav/ThemeToggle/EntryCard/Footer）。

### Integration Points
- 首页入口卡 → `/tools`、`/anime` 路由（本阶段占位，Phase 2/3 填实）。
- 内容集合 schema 是 Phase 2（工具浏览）与 Phase 3（追番）的共同地基。
</code_context>

<specifics>
## Specific Ideas

- 站点名「初曦的窝」呼应青蓝晨曦主色调。
- 视觉/交互/文案的所有具体取值以 `01-UI-SPEC.md` 为准，不在此重复。
- 首次部署后需回填 `site` 的真实 Vercel 域名。
</specifics>

<deferred>
## Deferred Ideas

- **首页「最近更新」/ 时间线** — v1.x（FEED-02），本阶段首页不做。
- **工具库客户端搜索、组合筛选** — v2（SEARCH-01/02）。
- **自定义域名接入** — 首次上线用默认域名后再接。
- **Bangumi API 自动拉取** — v2（API-01）；本阶段仅在 schema/config 层预留。

None beyond the above — 讨论未越界。
</deferred>

---

*Phase: 1-站点地基与二次元外壳*
*Context gathered: 2026-07-14*
