# Phase 2: 工具库（核心）- Context

**Gathered:** 2026-07-15
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段交付**工具库的核心浏览能力**，让项目核心价值端到端成立：访客能以卡片网格浏览所有工具、进入独立图文详情页、按分类与标签筛选浏览，并安全跳转外链。覆盖 TOOL-01..05（地图已在 ROADMAP/REQUIREMENTS 锁定，本阶段不新增能力）。

**在范围内**：工具库主页（卡片网格 + 分类/标签入口）、工具独立详情页（MDX 图文 + 外链）、分类静态页、标签静态页、面包屑/计数/空状态档案页组件复用、卡片→详情 + 外链（target=_blank + rel=noopener）跳转闭环、底栏相关工具导航、标签 schema transform 归一化。

**不在范围内**：搜索/全文检索（v2 SEARCH，此时内容几十条不值得）、列表视图切换（本阶段纯网格）、最近更新/RSS/统计（FEED/STAT）、评分/短评（自定义心得走 MDX 正文，不结构化）、Bangumi 接入、Preact/nanostores 岛屿（本阶段仍零有状态依赖；分类/标签均用静态页）。
</domain>

<decisions>
## Implementation Decisions

### 卡片浏览与布局（TOOL-01 卡片显示）
- **D-01:** 工具库主页为**纯卡片网格**，不复设列表视图切换；复用 Phase 1 的 `EntryCard.astro`（图标圆底 + display 标题 + 描述 + 箭头 + radius-xl + shadow-soft）保持全站视觉一致。
- **D-02:** **固定排序、不加排序控件**：沿用 `getAllTools()` 现有按 `title` localeCompare('zh') 排序。v1 无排序 UI（用户可在 lib 层改种子序）。
- **D-03:** 响应式 **1→2→3 列**（移动端 1、md 2、lg 3），max-w 容器居中。
- **D-04:** 卡片**整卡可点**进入详情页(`/tools/[slug]`)；卡片内设一个**独立外链图标按钮**（`target="_blank"` + `rel="noopener noreferrer"` + `aria-label="{工具名} 外链"`），点击 stopPropagation 避免触发整卡跳转。

### 分类 / 标签筛选（TOOL-03 分类 / TOOL-04 标签）
- **D-05:** **分类走静态页**：`/tools/category/[category]`，经 `getStaticPaths` 预生成；列出该分类下所有工具。符合 Phase 1 研究蓝图与 P8 静态优先。
- **D-06:** **标签走静态页**：`/tools/tag/[tag]`，`getStaticPaths` 预生成；工具多 tag 则出现在多张标签页。**不设客户端勾选过滤 island**。
- **D-07:** 标签值为**自由录入** + schema `.transform()` 归一化（去重 / trim / 小写），避免「js/JS/Js」分裂；不约束枚举。
- **D-08:** 分类/标签档案页一律**复用主页网格 + BaseLayout**，仅替换数据集/标题（如「分类：效率工具（N 个工具）」）/面包屑（`工具库 / 分类 / 效率工具`）/空状态。

### 详情页导航与组织（TOOL-02 图文详情）
- **D-09:** 详情路由 **`/tools/[slug]`**，slug 派生自 `title`（非 ASCII 走 URL-encode / 唯一性由 planner 校验处理），`getStaticPaths` 预生成。
- **D-10:** 卡片 `href` = 详情页（整卡主体 + 工具名点击进入），外链按钮 `target=_blank` 跳转外部站点（TOOL-05 锁死 noopener）。
- **D-11:** 详情页底部 nav：**「返回工具库」链接 + 同 category 相关 1-2 个工具卡片**（按 category 查闭环）。相关工具由 `lib/tools.ts` 暴露一个「同分类」读取函数。
- **D-12:** MDX 正文（使用心得/优缺点/截图）走 Astro **`<Content />` 渲染**，允许嵌入 `Image`/MDX 组件；schema 不做结构化字段，心得/优缺点以普通 Markdown（h2/h3/列表/图）撰写。

### 工具库主页骨架（索引页组织）
- **D-13:** 主页自上而下：**Header + 说明行（一句站点说明 + 当前工具总数）+ 分类 pill 行（链接到各分类页）+ 标签云（链接到各标签页）+ 全部工具网格 + Footer**。
- **D-14:** **不分页**，一页全列出 `getAllTools()`（v1 几十条量级）。分页属 v2，此时不加。

### Claude's Discretion
- **D-09 具体 slug 派生方案**（拼音/URL-encode/重复冲突处理）—— planner 在研究/规划阶段选最稳方案，记录在 PLAN。
- **D-11 相关工具的排序/选取策略**（同 category 内按 title 序取前 2、或随机）—— lib/planner 自定。
- `EntryCard.astro` 的具体改造（加外链按钮 + href 指向详情 vs 外链）—— executor 按 D-04/D-09/D-10 落地。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 阶段目标与需求
- `.planning/ROADMAP.md` §「Phase 2: 工具库（核心）」— 目标、5 条成功标准（Plans TBD 由本讨论驱动）
- `.planning/REQUIREMENTS.md` §「工具库工具（Tool）」— TOOL-01..05 完整需求 + REQUIREMENTS matrix

### 设计契约与既有 schema
- `.planning/phases/01-foundation-shell/01-UI-SPEC.md` — 配色/圆角/shadow/字体令牌、EntryCard 规格、Copywriting Contract（空状态文案、SEO 标题模式 `{页} · 初曦的窝`）、Layout 响应式断点
- `.planning/phases/01-foundation-shell/01-CONTEXT.md` — D-07 工具 schema 蓝本（title/url/summary/tags[]/category/cover?/draft；心得走 MDX 正文不结构化）、数据层收口 `lib/tools.ts`
- `.planning/phases/01-foundation-shell/01-RESEARCH.md` — 静态分类页 + 客户端 DOM 过滤 v1 方案、P7/P8 不过度工程、Content Layer glob+image() 写法

代码上下文中的接口契约（`<interfaces>`）
- `src/content.config.ts` / `src/lib/tools.ts` — 现有两集合 schema 与 `getAllTools()` 读取收口；planner 扩展时不得破坏既有 anime 集合与 `bgmId` 预留

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/EntryCard.astro` — 圆底图标 + display 标题 + muted 描述 + arrow；本阶段加「整卡 href → 详情」+「外链按钮」复用，不再新建卡片组件
- `src/components/Header.astro` / `Footer.astro` / `src/layouts/BaseLayout.astro` — 外壳复用（BaseLayout 已含防 FOUC is:inline 脚本与可选 `fullTitle`，本阶段用普通 `title` 走 `初曦的窝` 后缀即可）
- `src/components/deco/*`（Star/Heart/Divider/Blob）— 装饰 SVG 复用
- `public/fonts/zcool-subset.woff2` + `@font-face` 子集 — 标题装饰字已就绪

### Established Patterns
- 页面经 `lib/tools.ts` → `getAllTools()` 读取，不直接 `getCollection`（换源可插拔，01-CONTEXT D-07）—— 本阶段分类/标签/详情都经 lib 读取，分类/标签页可暴露 `getToolsByCategory/getToolsByTag`
- `astro-icon`（`ph:` 前缀）已装，外链/图标按钮用 `ph:arrow-square-out` / `ph:tag` / `ph:folder`
- Tailwind v4 `@theme` 令牌（`--color-primary` 等）与 `@custom-variant dark`/`:where(.dark)` 已生效，分类 pill 行/标签云直接取令牌
- 亮/暗主题 `<head>` is:inline 脚本 + `ThemeToggle` localStorage —— 本阶段不得改、不得破坏 FOUC 防闪

### Integration Points
- 新页面 `src/pages/tools/index.astro`、`src/pages/tools/[slug].astro`（详情）、`src/pages/tools/category/[category].astro`、`src/pages/tools/tag/[tag].astro` 接入既有 BaseLayout + lib 读取
- `src/lib/tools.ts` 扩展：在 `getAllTools()` 基础上增 `getToolsByCategory(category)` / `getToolsByTag(tag)` / `getRelated(category, exclude)`；返回值与排序保持一致
- `src/content.config.ts`：tags 加 `.transform()` 归一化；**不得改动 anime 集合**（Phase 3 保留）
- 外链 `target="_blank" rel="noopener noreferrer"` 必须统一（TOOL-05 / STRIDE T-01-03-02）

</code_context>

<specifics>
## Specific Ideas

用户未给特定参照站点或「我想让它像 X」类锚点；按 Phase 1 已确定的初曦的窝品牌与 UI-SPEC 二次元视觉基线执行即可。Copywriting 严格使用 01-UI-SPEC 锁定文案（空状态、SEO 标题 `{页面} · 初曦的窝`、Hero 标语等）。

</specifics>

<deferred>
## Deferred Ideas

None — 讨论全程未提出超出 Phase 2 范围的能力；所有决策均服务 TOOL-01..05。

</deferred>

---

*Phase: 02-工具库（核心）*
*Context gathered: 2026-07-15*
