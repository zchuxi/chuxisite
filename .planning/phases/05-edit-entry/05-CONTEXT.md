# Phase 5: 编辑已有条目 (追番 + 工具) - Context

**Gathered:** 2026-07-16
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段交付 **编辑已有条目的独立表单页**：维护者在 `/admin` 工作台点击条目卡片后跳转至独立编辑页，表单回填当前字段，修改后保存至 localStorage，自动返回工作台列表。覆盖 EDIT-03, EDIT-04。

**在范围内**：
- 独立路由页 `/admin/edit/anime/[slug]` 和 `/admin/edit/tools/[slug]`
- 服务端渲染（SSR）预填当前条目全部可编辑字段
- 追番表单：status (select) / progress (number) / myRating (number 0-10) / comment (textarea) / cover (URL text input)
- 工具表单：title (text) / url (URL text) / summary (textarea) / tags (chip add/remove) / category (select) / cover (URL text input) / body (textarea + 预览)
- 客户端校验：非法值高亮 + 不允许保存
- 编辑结果存 localStorage，保存后自动导航回 `/admin`
- `/admin` 列表页读取 localStorage 展示最新值
- cover 字段仅处理 URL 字符串；本地 image() 封面显示提示文字，不提供编辑

**不在范围内**：
- 新增条目（Phase 6）
- JSON 导出（Phase 7）
- 富文本 / WYSIWYG 编辑器
- 自动 git commit / push
- 搜索 / 筛选（v2）
- Preact / 框架运行时（延续原生 `<script>` 岛屿模式）

</domain>

<decisions>
## Implementation Decisions

### 编辑页 UI 架构
- **D-01:** 独立路由页，非 SPA hash 切换。`/admin/edit/anime/[slug]` 和 `/admin/edit/tools/[slug]` 各一个 `.astro` 页面。SSR 预填数据，刷新不丢失状态。
- **D-02:** 延续 Phase 4 的原生 `<script>` 岛屿模式（无 Preact），每个编辑页一个 `<script>` 块处理表单逻辑。

### 数据流
- **D-03:** 服务端通过 `getCollection` 按 slug 获取完整条目，序列化可编辑字段到 `define:vars`。不传递不可序列化的 `image()` 对象或 `render()`。
- **D-04:** cover 字段仅展示 URL 文本输入框。本地 image() 封面显示提示文字「当前封面为本地图片，编辑时自动保留原值」，输入框置灰/隐藏。

### MDX 正文编辑
- **D-05:** textarea + 简易 Markdown 预览。用 `marked`（从 CDN 加载）在 textarea 下方渲染实时预览。预览区只读。

### 保存机制
- **D-06:** 编辑结果存 `localStorage`，key = `chuxi_admin_edit_v1`，值为 `Record<type:slug, editedFields>`。
- **D-07:** 保存按钮写入 localStorage 后 `window.location.href = '/admin'` 返回列表。
- **D-08:** `/admin` 页面加载时读取 `chuxi_admin_edit_v1`，将编辑过的条目卡片上叠加「已编辑」标记（视觉指示器），卡片文本/状态反映最新值。

### 分类字段
- **D-09:** category 用 `<select>` 下拉选择。服务端从 `getAllTools()` 提取去重分类列表传入。保留一个"其他"备选。

### 标签编辑
- **D-10:** tags 用文本输入框 + 添加按钮 + chip 列表（每 chip 带 × 删除按钮）。添加后小写去重（对齐 schema transform）。初始值从 SSR 预填。

### 表单校验规则（对齐 Zod schema）
- **D-11:** status: `<select>` 限定 enum(watching/done/plan)，无需额外校验
- **D-12:** myRating: 数字输入 `min=0 max=10`，非数字/越界时高亮 + 禁止保存
- **D-13:** progress: 数字输入 `min=0`，非数字时高亮
- **D-14:** title/url/summary/category: 必填项为空时高亮 + 禁止保存（对齐 Zod schema 非 optional 字段）
- **D-15:** 校验高亮方式：输入框红色边框（`border-[var(--color-destructive)]`）+ 下方红色提示文字

### 导航回列表后的列表更新
- **D-16:** `/admin` 页面初始化时遍历 `chuxi_admin_edit_v1`，为有编辑记录的卡片添加「已编辑」角标，替换卡片上的 title/status/progress 等显示文本为最新值（仅视觉，不影响 SSR 原始数据）。

### Claude's Discretion
- **D-01a:** 编辑页复用 BaseLayout + Header + Footer 外壳（同 Phase 4）
- **D-03a:** 序列化字段的具体键名清单（见下方 Canonical References）
- **D-05a:** 预览区样式（prose 类复用）
- **D-06a:** localStorage 具体 merge/覆盖策略（编辑时全量替换，删除时移除 key）
- **D-10a:** tag chip 的视觉样式（参考已有组件风格）

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 设计契约
- `.planning/phases/01-foundation-shell/01-UI-SPEC.md` — 配色 token、表单样式基线
- `.planning/phases/04-admin-v1-1/04-PATTERNS.md` — 原生 `<script>` 岛屿模式、localStorage pattern、admin CSS 类

### 阶段目标与需求
- `.planning/ROADMAP.md` §「Phase 5: 编辑已有条目」
- `.planning/REQUIREMENTS.md` §「内容编辑 (Edit)」— EDIT-03, EDIT-04

### 既有代码上下文
- `src/pages/admin/index.astro` — 工作台页面，卡片 href 需从 `#edit/...` 改为真实路由 `/admin/edit/...`
- `src/lib/anime.ts` — `getAllAnime()` + `slugOf()`
- `src/lib/tools.ts` — `getAllTools()` + `slugOf()`
- `src/content.config.ts` — Zod schema（字段类型、必填/可选、默认值、transform 规则）
- `src/components/AnimeCard.astro` / `EntryCard.astro` — 卡片组件
- `src/layouts/BaseLayout.astro` — 外壳（含 head slot、防 FOUC）
- `src/styles/global.css` — Tailwind v4 token + admin CSS 类

### 数据 schema 序列化到客户端

**Anime 编辑字段（`define:vars` 形状）：**
```typescript
{
  id: string;
  slug: string;
  type: 'anime';
  titleCn: string;
  titleJa: string;        // SSR 值，编辑时只读展示
  status: 'watching' | 'done' | 'plan';
  progress: number;
  episodes: number | '';   // '' 表示 SSR 无值（optional）
  myRating: number | '';   // '' 表示未评分
  comment: string;
  cover: string;           // URL 字符串，如非 URL 则为空字符串 ''
  hasLocalCover: boolean;  // true = 本地 image()，不可编辑
  airDate: string;         // ISO date string 或 ''
}
```

**Tools 编辑字段（`define:vars` 形状）：**
```typescript
{
  id: string;
  slug: string;
  type: 'tools';
  title: string;
  url: string;
  summary: string;
  tags: string[];
  category: string;
  categories: string[];     // 所有现有分类（dropdown options）
  cover: string;            // URL 字符串或 ''
  hasLocalCover: boolean;
  body: string;             // entry.body (MDX 原文)
}
```

### localStorage 结构
```typescript
const EDIT_KEY = 'chuxi_admin_edit_v1';
// stored value:
{
  'anime:葬送的芙莉莲': { /* edited fields, same shape as above */ },
  'tools:Raycast': { /* edited fields */ },
}
```

</canonical_refs>

<specifics>
## Specific Ideas

- 编辑页底部「保存」「取消」两个按钮：保存 = 写 localStorage + 跳转 /admin；取消 = 直接跳转 /admin
- 编辑页加载时检查 localStorage 是否有该条目的编辑草稿，如有则用草稿预填（而非 SSR 原始值），支持编辑中意外刷新的恢复
- `/admin` 列表页「已编辑」标记：卡片右上角小蓝点或小铅笔图标（参考 ph:pencil）
- 预览区使用与详情页一致的 `.prose` 类样式
- `marked` CDN: `https://cdn.jsdelivr.net/npm/marked/lib/marked.umd.min.js`

</specifics>

<deferred>
## Deferred Ideas

- 编辑历史 / undo（git 自身处理）
- 自动保存草稿（仅保存按钮触发，无定时自动保存）
- 多条目批量编辑（v2 议题）

</deferred>

---

*Phase: 05-编辑已有条目 (追番 + 工具)*
*Context gathered: 2026-07-16*
