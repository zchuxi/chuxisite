# Phase 3: 追番记录 - Context

**Gathered:** 2026-07-15
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段交付**追番记录** — v1 最后一章：访客能浏览追番列表（封面卡 + 状态/评分/进度）、按观看状态（在看/做完/想看）筛选、进入详情页查看完整信息/评分/进度/短评。数据层按「客观元剧元数据组 + 追番状态组」分层（bgmId 等预留），为日后 Bangumi API 接入铺路。覆盖 ANIME-01..05。

**在范围内**：番剧列表主页（封面网格 + 状态 pill 筛选入口）、番剧详情页（封面大图 + 元信息卡 + MDX 心得 + 底栏回列表）、状态静态筛选页（/anime/status/:status）、AnimeCard 新建、状态标签/评分星星/进度展示组件、路由（/anime、/anime/[slug]、/anime/status/:status）。

**不在范围内**：Bangumi API 真实拉取（v2）、搜索/全文检索（v2 SEARCH）、客户端状态编辑/评分录入 UI（v1 仅手动 .mdx 录入）、RSS/统计/最近更新（v2）。
</domain>

<decisions>
## Implementation Decisions

### 状态筛选（ANIME-02 按观看状态筛选）
- **D-01:** 状态筛选走**静态筛选页**：`/anime/status/:status`，`getStaticPaths` 预生成（枚举 `watching|done|plan`），零 JS。与工具库 `/tools/category` 对称，P8 静态优先。
- **D-02:** URL 用**小写英文 enum 值**：`/anime/status/watching|done|plan`。页内中文标题（「在看」「做完」「想看」）。
- **D-03:** 筛选入口放**列表页顶部状态 pill 行**（仿工具库 PillRow）：全部 / 在看 / 做完 / 想看，点击跳 `/anime/status/:status`。

### 番剧卡片与列表（ANIME-01 封面卡显示）
- **D-04:** 新建 **AnimeCard**（不复用 EntryCard，因信息结构差异大）：封面图（固定 aspect-ratio poster 比例，cover 缺失走占位 block 回退，类似 Hero Blob）+ 标题 + 状态小标签 + 评分星级 + 进度文字。整卡可点进入详情。
- **D-05:** 列表网格 **1→2→3 列**（mobile 1 / md 2 / lg 3），容器 `max-w-[72rem]` 居中，与工具库视觉统一。
- **D-06:** 卡上展示**全部 5 项**：封面 + 标题 + 状态标签 + 评分星级 + 进度（「N/M 话」或等价）。

### 详情页（ANIME-03 评分/进度/短评 + ANIME-04 完整信息）
- **D-07:** 详情页**两栏顶部 + MDX 下方**：左封面大图（poster 比例）、右侧标题 + 状态 + 评分 + 集数 + 进度 + 短评摘要；MDX 正文（可长可短图文，`<Content />` 渲染 + `.prose`）在下。底栏「返回追番列表」。
- **D-08:** 评分展示 **star 图标 + 数字**（如 ★☆☆☆☆ 9/10）；进度展示**文字「看到 N / 共 M 话」**。与卡上一致。

### 路由与 v2 预留（ANIME-04/05）
- **D-09:** 路由三件套：列表 `/anime`、详情 `/anime/[slug]`（slug 派生自 titleCn，与工具库同）、筛选 `/anime/status/:status`。目录式 `[slug]/index.astro`（Windows 避 bracket 文件名，Phase 2 已验证）。
- **D-10:** v2 Bangumi 仅** schema + config 已预留**（bgmId? + remotePatterns lain.bgm.tv），本阶段**不写拉取脚本**。v2 再加 `lib/anime-remote.ts`。

### Claude's Discretion
- **D-04 封面 poster 比例**（2:3 或 4:5）— planner 按 01-UI-SPEC 图片规范选。
- **D-08 star 实现**（Iconify ph:star 填充/半空/空 vs 纯 CSS）— executor 按 astro-icon 可用性选。
- 状态标签配色（watching/done/plan 各一色）— 取 01-UI-SPEC 调色板。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 既有设计契约与数据层
- `.planning/phases/01-foundation-shell/01-UI-SPEC.md` — 配色/圆角/shadow/字体令牌、EntryCard 规格、Copywriting Contract、Layout 响应式断点、a11y 基线
- `.planning/phases/01-foundation-shell/01-CONTEXT.md` — anime schema 分层设计（D-07 蓝本：bgmId?/titleJa?/titleCn/cover/episodes?/airDate? + status/myRating/progress/comment/draft）、数据层收口 lib/anime.ts
- `src/content.config.ts` — 现有 anime schema（本阶段不改字段，仅消费）
- `src/lib/anime.ts` — getAllAnime() 状态排序收口（本阶段列表/详情/筛选均经此读取）

### 既有组件与页面模式（复用）
- `src/components/EntryCard.astro` — 双层链接模式（article.relative + 整卡 a + 绝对外链 a）参考
- `src/components/Breadcrumb.astro` / `EmptyState.astro` / `PillRow.astro` / `TagCloud.astro` — Phase 2 新建，直接复用
- `src/pages/tools/category/[category]/index.astro` + `tag/[tag]/index.astro` — 静态档案页模式（getStaticPaths + 复用网格 + PillRow active aria-current + EmptyState）
- `src/pages/tools/[slug]/index.astro` — MDX `<Content />` + `.prose` + 底栏模式

### 阶段目标与需求
- `.planning/ROADMAP.md` §「Phase 3: 追番记录」— 目标 + 4 条成功标准
- `.planning/REQUIREMENTS.md` §「追番记录（Anime）」— ANIME-01..05

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/anime.ts` — getAllAnime() 状态排序（watching→plan→done），本阶段所有页面经此读取
- `src/components/{Breadcrumb,EmptyState,PillRow,TagCloud,EntryCard,Header,Footer,ThemeToggle}.astro` — 外壳与档案组件复用
- `src/components/deco/{Star,Heart,Divider,Blob}.astro` — 装饰 SVG（Blob 可作封面占位回退）
- `src/styles/global.css` — @theme 令牌 + 手搓 `.prose`（Phase 2 已加）；本阶段追加 star/状态标签样式

### Established Patterns
- 页面经 `lib/anime.ts` → getAllAnime() 读取，不直接 getCollection（换源插拔，bgmId 预留 Bangumi）
- 静态档案页 getStaticPaths + 复用网格 + PillRow active aria-current + EmptyState（Phase 2 验证）
- 目录式动态段 `[slug]/index.astro`（Windows 避 bracket 文件名）
- astro-icon（ph: prefix）— 状态/评分/装饰用 ph:star / ph:film-strip 等
- Tailwind v4 @theme 令牌 + @custom-variant dark + :where(.dark) 重定义

### Integration Points
- 新页面 `src/pages/anime/index.astro`（迁出 Phase 1 占位）、`[slug]/index.astro`、`status/[status]/index.astro`
- 新组件 `src/components/AnimeCard.astro`（封面图卡）
- `src/lib/anime.ts` 可选扩展：getAnimeByStatus(status) / getRelatedAnime(category) 等读取函数（基于 getAllTools 模式）
- `src/styles/global.css` 追加状态标签 / star 样式

</code_context>

<specifics>
## Specific Ideas

用户未给特定参照站点；按初曦的窝品牌与 01-UI-SPEC 二次元视觉基线执行。Copywriting 严格使用 01-UI-SPEC 锁定文案（空状态、SEO 标题 `{页面} · 初曦的窝` 等）。

封面图缺失回退：参考 Phase 1 Hero 的 deco/Blob 占位（固定比例 + 青粉渐变 + 浮动星心，切真图 CLS≈0）。

</specifics>

<deferred>
## Deferred Ideas

- Bangumi API 真实拉取脚本（lib/anime-remote.ts）— v2
- 客户端评分/进度/状态编辑 UI — v2（v1 仅手动 .mdx 录入）
- 搜索/全文检索 — v2 SEARCH
- RSS / 最近更新 / 统计 — v2 FEED/STAT

</deferred>

---

*Phase: 03-追番记录*
*Context gathered: 2026-07-15*
