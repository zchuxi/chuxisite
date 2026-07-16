# Phase 4: Admin 外壳 + 密码守卫 + 条目浏览器 - Context

**Gathered:** 2026-07-16
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段交付 **v1.1 内容编辑 UI 的入口与导航壳**：隐藏路由 + 前端密码门禁 + 现有条目加载与浏览能力。维护者访问 `/admin`，输入正确密码后进入工作台，工作台顶部 Tab 切换「追番 / 工具」两类条目，点击卡片进入后续编辑（Phase 5/6），删除图标按钮触发二次确认后重导 JSON（不含被删条目）。覆盖 EDIT-01, EDIT-02。

**在范围内**：
- 隐藏路由 `/admin`（静态生成 + 客户端密码门禁）
- 前端密码验证（硬编码密码 + localStorage 会话保持）
- 密码错误行内提示（停留入口页、不 404、不暴露路由存在）
- 工作台壳：顶部 Tab 切换「追番 / 工具」
- 经 `getAllAnime()` / `getAllTools()` 收口加载条目
- 管理型卡片网格展现条目（复用 AnimeCard / EntryCard 视觉）
- 卡片操作：整卡点击进入编辑、删除图标按钮（二次确认弹窗）
- 删除 = 从列表移除后重新导出全份 JSON（与 EDIT-08 链路一致）

**不在范围内**：
- 实际编辑表单（Phase 5）
- 新增条目（Phase 6）
- JSON 导出格式实现（Phase 7）
- 搜索 / 筛选（v2 SEARCH，YAGNI）
- 多用户 / 权限体系、密码加密、速率限制（单人站不需要）
- 自动 git commit / push（违背零后台，仍是手动）
- Preact / nanostores（本站首例有状态 UI，原生 <script> 岛屿足够）

</domain>

<decisions>
## Implementation Decisions

### 客户端技术选型（首例有状态 UI）
- **D-01:** 整段工作台包入**单个原生 `<script>` 岛屿**（Astro 直接支持，无需新运行时代码）。Phase 4/5/6 逻辑合计预计 <300 行原生 JS，Preact 的 useReducer/useState 优势不明显，YAGNI。
- **D-02:** 密码验证后的登录状态用 **localStorage** 保持（持久化，单人站够用，关浏览器仍保持。注意：公共设备需手动退出清 localStorage — 单人站可接受）。
- **D-03:** 密码**硬编码在 `<script>` 里**。单人站 + 公开只读站点，密码只是防偶然访问，非安全边界。无后端配合，构建后 JS 能看到但无实际攻击面。（若未来需要换密码，改硬编码值重新部署即可）。

### 密码守卫机制
- **D-04:** 管理后台路由 = **`/admin`**。直观、惯例。单人站不需要安全通过隐蔽性（security through obscurity）。
- **D-05:** 密码错误 = **停留入口页 + 行内提示**（如「密码错误」）。不跳转、不 404，体验好且不暴露 `/admin` 是否存在。
- **D-06:** 密码正确进入工作台后，顶部 **Tab 切换「追番 / 工具」**（两个条目类型）。Phase 5/6 编辑页复用同一工作台壳 → 统一体验、不重复造导航。

### 条目浏览器 UI
- **D-07:** 列表展现 = **管理型卡片网格**，复用现有 `AnimeCard.astro` / `EntryCard.astro` 视觉（用户熟悉），叠加管理操作按钮（删除图标角落）。响应式 1→2→3 列（mobile / md / lg），max-w 容器居中。与前台视觉统一。
- **D-08:** 工作台**仅类型 Tab 切换**，不加关键词搜索、状态筛选、分类筛选。搜索/筛选属 v2 SEARCH（SEARCH-01/02）。Phase 4 范围是浏览器定位与导航。YAGNI。
- **D-09:** 卡片操作：**整卡点击进入 Phase 5 编辑表单** + **卡片角落删除图标按钮**（点击弹出二次确认 modal/confirm；确认后从客户端列表移除该条目，后续导出 JSON 不含它）。
- **D-10:** 删除 = **导出不含该条目的 JSON**（编辑工作台维护一份客户端副本，删除后重新导出整份 JSON，维护者覆盖原 content/ 文件）。与 EDIT-08 链路一致，不引入新机制。

### Claude's Discretion
- **D-01a** 具体 `<script>` 岛屿挂载方式（inline `<script>` vs `<script>` Astro 处理 + define:vars）— planner 按 Astro v7 文档选，优先 inline 简化。
- **D-07a** 管理型卡片的具体复用方式（复用 AnimeCard/EntryCard 组件叠加操作按钮 vs 新建 AdminCard）— executor 按组件 API 决策；优先复用。
- **D-09a** 二次确认弹窗实现（原生 `window.confirm` vs 自定义 modal）— executor 按视觉一致性选。
- **D-04a** 密码错误提示文案与视觉样式 — executor 按 01-UI-SPEC 配色。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 设计契约（视觉/交互/文案唯一契约）
- `.planning/phases/01-foundation-shell/01-UI-SPEC.md` — 配色 token（亮/暗）、圆角、阴影、字体策略、EntryCard 规格、卡片网格响应式 1→2→3 列、SEO title 模式、空状态文案、a11y 基线。**MUST read before planning。**

### 阶段目标与需求
- `.planning/ROADMAP.md` §「Phase 4: Admin 外壳 + 密码守卫 + 条目浏览器」— 目标 + 4 条成功标准
- `.planning/REQUIREMENTS.md` §「访问控制 (Access)」— EDIT-01, EDIT-02 完整需求

### 既有代码上下文（直接复用 / 对接）
- `src/components/AnimeCard.astro` — 追番卡片组件（封面 + 标题 + 状态 pill + 评分 + 进度）
- `src/components/EntryCard.astro` — 工具卡片组件（双层链接模式：article.relative + 整卡 a + 绝对外链 a；管理操作按钮叠加时参照此模式）
- `src/components/Header.astro` / `Footer.astro` / `src/layouts/BaseLayout.astro` — 外壳复用（BaseLayout 含防 FOUC is:inline 脚本 + SEO/OG/canonical + fullTitle 接口）
- `src/lib/anime.ts` — `getAllAnime()` 收口读取
- `src/lib/tools.ts` — `getAllTools()` 收口读取
- `src/styles/global.css` — Tailwind v4 @theme 令牌 + 手搓 `.prose`；本阶段追加管理卡片操作按钮样式

### 数据 schema
- `src/content.config.ts` — 现有 tools/anime 两集合 Zod schema（Phase 4 不改字段，仅消费 getAllXxx()）
- `src/content/anime/frieren.mdx` + `src/content/tools/raycast.mdx` — seed 数据样本，浏览器加载验证用
- `src/components/deco/{Star,Heart,Divider,Blob}.astro` — 装饰 SVG 复用（删除图标等可用 ph:trash）

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/AnimeCard.astro` — 追番卡片（封面 + 标题 + StatusPill + RatingStar + 进度文字，整卡可点）
- `src/components/EntryCard.astro` — 工具卡片（双层链接 + 44×44 外链按钮 min 国防部标准，整卡可点）；管理操作按钮叠加参照此模式
- `src/components/Header.astro` / `Footer.astro` / `BaseLayout.astro` — 外壳 + 防 FOUC
- `src/components/StatusPill.astro` / `RatingStar.astro` — 追番视觉
- `src/components/EmptyState.astro` — 空状态兜底（无条目时显示）
- `src/components/Breadcrumb.astro` — 面包屑（可复用到工作台顶部导航）
- `src/components/deco/{Star,Heart,Divider,Blob}.astro` — 装饰 SVG

### Established Patterns
- 数据读取 100% 收口 `getAllAnime()` / `getAllTools()`，禁止直接 getCollection（Phase 1 D-07 起）
- 卡片整卡可点 + 侧出绝对定位操作按钮（Phase 2 EntryCard 双层链接验证）
- 目录式动态段 `[slug]/index.astro`（Windows 避 bracket 文件名）
- Tailwind v4 @theme 令牌（--color-primary 等）+ @custom-variant dark + :where(.dark) 暗色重定义
- 亮/暗主题 is:inline 阻塞脚本 + ThemeToggle localStorage — **不得改、不得破坏 FOUC 防闪**
- astro-icon（ph: prefix）— 管理操作按钮用 ph:trash / ph:pencil / ph:plus 等装饰图标

### Integration Points
- 新页面 `src/pages/admin/index.astro` — 入口含密码门禁 + 工作台（客户端渲染，密码正确显示工作台；错误行内提示）
- 或拆为：`src/pages/admin/index.astro`（入口 + 密码） + `src/pages/admin/dashboard.astro`（工作台，Phase 5/6 复用） — planner 按 URL 设计决定
- 新组件（可选）：`src/components/AdminCard.astro` — 若复用 AnimeCard/EntryCard 不便叠加操作按钮则新建；仅当 executor 判断复用过复杂时启用
- `src/styles/global.css` 追加：管理卡片操作按钮样式 + 工作台 Tab 样式</code_context>

<specifics>
## Specific Ideas

- 站点品牌「初曦的窝」呼应青蓝晨曦主色调，工作台沿用 01-UI-SPEC 二次元视觉基线
- 删除操作图标建议用 ph:trash（astro-icon 已装） + 红色 hover 警示
- 二次确认弹窗建议用原生 `window.confirm`（最简单）或最小化自定义 modal（按 01-UI-SPEC 配色）
- Tab 切换样式参考 PillRow（已有 active aria-current 模式）
- Copywriting 严格使用 01-UI-SPEC 锁定文案；密码错误提示若 UI-SPEC 未覆盖，按简洁中文提示风格（「密码错误，请重试」）

</specifics>

<deferred>
## Deferred Ideas

None — 讨论全程未提出超出 Phase 4 范围的能力；所有决策均服务 EDIT-01, EDIT-02。

</deferred>

---

*Phase: 04-Admin 外壳 + 密码守卫 + 条目浏览器*
*Context gathered: 2026-07-16*
