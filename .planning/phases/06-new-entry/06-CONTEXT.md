# Phase 6: 新增条目 + frontmatter 生成 - Context

**Gathered:** 2026-07-16
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段交付 **新增条目的独立表单页 + frontmatter 自动生成与导出**：维护者在 `/admin` 工作台点击「新增」按钮进入空白表单，填写必填字段后自动生成与 Zod schema 对齐的 frontmatter，支持预览、复制、下载 JSON。覆盖 EDIT-05, EDIT-06, EDIT-07。

**在范围内**：
- 独立路由 `/admin/new/anime` 和 `/admin/new/tools`
- 空白表单（字段与 Phase 5 编辑页一致，起始无值）
- 标题输入时实时自动派生 slug（`encodeURIComponent(titleCn/title)`），可手动覆盖
- slug 冲突检测（与现有条目 + 已填 slug 对比）
- 「生成」按钮 → 校验表单 → 生成 frontmatter YAML 字符串
- frontmatter 预览面板（只读展示）
- 复制到剪贴板按钮
- 下载 .json 文件（结构与 content.config.ts Zod schema 一致，含 body 字段）
- `/admin` 工作台「追番」「工具」网格上方各加一行新增按钮

**不在范围内**：
- JSON 放入 `src/content/` 后的 git push 流程（仍手动，与 Phase 7 一致）
- 富文本 / WYSIWYG 编辑器
- 自动 git commit / push
- 搜索 / 筛选（v2）

</domain>

<decisions>
## Implementation Decisions

### 入口
- **D-01:** 「新增追番」按钮放在追番网格上方独立行；「新增工具」按钮同理。样式为普通 filled primary 按钮，与工作台风格一致。

### 路由
- **D-02:** 独立路由 `/admin/new/anime` 和 `/admin/new/tools`。不继承编辑页的 `[slug]` 动态段，无 `getStaticPaths`。

### Slug
- **D-03:** 标题输入时实时自动派生 slug（`encodeURIComponent(titleCn)` 用于 anime，`encodeURIComponent(title)` 用于 tools），在表单中只读展示 slug 预览区域。
- **D-04:** 提供可编辑的 slug 输入框，默认值 = 自动派生值，允许手动覆盖。
- **D-05:** 客户端侧冲突检测：SSR 注入现有 slugs 列表到 `define:vars`，输入 slug 时实时检查是否已存在。冲突时高亮提示「该 slug 已存在」。

### Frontmatter 生成
- **D-06:** 表单底部「生成 frontmatter」按钮 → 触发全字段校验 → 通过后生成 frontmatter YAML 字符串 + JSON 对象。
- **D-07:** 生成的 frontmatter 展示在预览面板（`<pre>` 只读区域），同时提供「复制」和「下载 JSON」按钮。
- **D-08:** JSON 下载使用 Blob URL，触发浏览器下载 `.json` 文件。文件命名 = `{slug}.json`。
- **D-09:** JSON 结构完全对齐 Zod schema：字段名、类型、可选/必填、默认值、transform 规则（tags 小写去重、progress 默认 0 等）。
- **D-10:** JSON 包含 `body` 字段（MDX 正文字符串，可能含换行）；序列化时 JSON 多行 string 用 `\n` 转义。

### 表单字段（对齐 Zod schema）
- **D-11:** 追番新表单：titleCn (required) / titleJa (optional) / status (select, required) / progress (number, default 0) / episodes (optional) / myRating (number 0-10, optional) / comment (textarea, optional) / cover (URL text, optional) / airDate (date, optional) / body (textarea, optional MDX 正文)
- **D-12:** 工具新表单：title (required) / url (required, Zod schema 无 optional) / summary (required) / tags (chip add/remove, optional) / category (select, required) / cover (URL text, optional) / body (textarea, optional MDX 正文)
- **D-13:** `url` 和 `summary` 按 Zod schema 为必填（EDIT-06 的「可选」描述在实现时以 schema 为准）。

### 校验规则（继承 Phase 5 模式）
- **D-14:** 同 Phase 5 校验：非法值红色边框 + 错误提示，「生成」按钮在任一校验失败时禁用。
- **D-15:** status 用 `<select>` 限 enum，默认无选中（placeholder 提示「请选择」）。
- **D-16:** airDate 用 `<input type="date">`。

### Claude's Discretion
- **D-01a:** 新增按钮的具体文案与 CSS class（参照 admin-tab 视觉风格）
- **D-06a:** frontmatter 的 YAML 格式细节（`---` 包裹 + 字段序列化顺序）
- **D-07a:** 预览面板样式（参照 form-preview 或 `<pre>` 代码块）
- **D-08a:** slug 冲突检测的视觉样式（红色边框 + 提示文字）

</decisions>

<canonical_refs>
## Canonical References

### 继承自 Phase 5
- `src/pages/admin/edit/anime/[slug]/index.astro` — 编辑表单字段模式、校验逻辑、脚本结构
- `src/pages/admin/edit/tools/[slug]/index.astro` — tags chip、category select、body textarea 模式
- `src/pages/admin/index.astro` — 工作台（新增按钮可参照 admin-tab 按钮组布局）
- `src/styles/global.css` — 表单样式（form-input/form-select/form-chip 等）、edit-badge
- `src/content.config.ts` — Zod schema（字段类型、默认值、transform）
- `src/lib/anime.ts` / `src/lib/tools.ts` — 数据读取收口

### SSR 数据注入（define:vars）
```typescript
// Anime new page:
const existingSlugs = (await getAllAnime()).map((a) => slugOf(a.data.titleCn));

// Tools new page:
const existingSlugs = (await getAllTools()).map((t) => slugOf(t.data.title));
```

### localStorage 结构
```typescript
// 新增的条目暂存（与编辑共享同一 key）
const EDIT_KEY = 'chuxi_admin_edit_v1';
// 新增条目的 key 仍然可用，slug 在生成前是临时值
```

### Frontmatter 生成格式
```yaml
---
titleCn: "葬送的芙莉莲"
titleJa: "葬送のフリーレン"
status: "watching"
progress: 0
episodes: 28
myRating: 8
comment: ""
cover: ""
draft: false
---

正文内容放这里
```
字段顺序按 schema 定义顺序，`draft: false` 始终输出。JSON 格式同理。

</canonical_refs>

<deferred>
## Deferred Ideas

- 富文本编辑器（WYSIWYG）— 维护者熟悉 MDX，YAGNI
- 批量新增 — 单人站单条新增足够
- 模板预设（如「新番模板」「工具模板」）— 未来有需要再考虑

</deferred>

---

*Phase: 06-新增条目 + frontmatter 生成*
*Context gathered: 2026-07-16*
