status: issues_found
severity_high: 1
severity_medium: 2
severity_low: 2
---

# Phase 2 — Code Review（toolkit core）

**范围**：`src/components/*`、`src/lib/tools.ts`、`src/pages/tools/**`、`src/content.config.ts`、`src/styles/global.css`、`src/content/tools/raycast.mdx`
**深度**：standard · 静态 Astro 站点，信任边界 = 自建 .mdx（Zod 校验），关注点见任务说明。

---

## 发现一览

| # | 严重度 | 文件 | 主题 |
|---|--------|------|------|
| 1 | **HIGH** | `category/[category]`、`tag/[tag]` | CJK 分类/标签 param 未编码，与 `[slug]` 页 `slugOf` 不对称，构建期路径可能 404 |
| 2 | MEDIUM | `tag/[tag]/index.astro` | `getStaticPaths` 内已聚合 `tagMap`，页面体又 `getAllTools()` 重算一次，数据/逻辑重复 |
| 3 | MEDIUM | `EntryCard.astro` | 双 anchor 模式下整卡 `<a>` 与绝对定位外链按钮存在可访问性陷阱：整卡区域仍捕获点击/焦点，外链按钮嵌套在同一可点击平面内 |
| 4 | LOW | `tools/index.astro`、`category/[category]`、`tag/[tag]`（多页） | `PillRow`/`TagCloud` 的 `href` 用模板字符串裸拼 category/tag 但未用 `slugOf`，编码风格不统一（ASCII 无害，CJK 触发 #1） |
| 5 | LOW | `category/[category]/index.astro:68` | `<Footer />` 外裹了额外的 `<div class="mt-24">`，`tag/[tag]` 同层级未裹；布局风格不一致 |

---

## 详细说明

### 1. HIGH — CJK 分类/标签 param 未编码（路径 404 风险）

**文件**
- `src/pages/tools/category/[category]/index.astro`（L12–L24）
- `src/pages/tools/tag/[tag]/index.astro`（L12–L25）

**问题**
`[slug]` 页已用 `slugOf`（`encodeURIComponent`）派生 slug 并在 `getStaticPaths` 输出编码后的 param。但 category / tag 两页直接拿原始字符串放进 `params`：

```ts
// category/[category]/index.astro
const cats = [...new Set(tools.map((t) => t.data.category))];
return cats.map((category) => ({
  params: { category },          // ← 未编码
  ...
}));
```

当 `category` 含 CJK（如 raycast.mdx 的 `category: "效率工具"`）时，`encodeURIComponent("效率工具")` → `%E6%95%88%E7%8E%87%E5%B7%A5%E5...`，而裸字符串放进 `params` 会生成字面路径 `/tools/category/效率工具`。Astro 对 `getStaticPaths` 的 param 是否二次编码取决于具体版本/适配器——在部分托管平台上编码与解码不对称会导致 URL 匹配失败，用户访问 `/tools/category/%E6%95%88%E7%8E%87%E5%B7%A5%E5...` 时 404；或者反过来，构建产物路径与链接不一致。

任务说明里明确把「slug/param 编码对称」列为关键关注点，这里已经出现不对称。

**修复建议**
把 `slugOf` 抽出为更通用的 URL 片段编码工具（或复用同一个函数），统一三处 `params`：

```ts
import { slugOf } from '../../../../lib/tools';
return cats.map((category) => ({
  params: { category: slugOf(category) },
  ...
}));
```

并在消费端 / 链接端同样编码（见 #4）。

---

### 2. MEDIUM — `tag/[tag]` 数据/逻辑重复计算

**文件**：`src/pages/tools/tag/[tag]/index.astro`（L12–L25、L29–L35）

**问题**
`getStaticPaths` 已经遍历全部工具构建了 `tagMap`（tag → items[]），但页面主体又独立调一次 `getAllTools()` 重算 `tagCounts` 与 `tags`。两者逻辑重复：

- getStaticPaths: `tagMap` 用于产出路径
- 主体: 再次 `getAllTools()` 用于「标签云」侧栏

结果是同一数据在请求周期内被读两遍、filter 两遍；且未来若 tag 编码规则变化，需同时改两处才能保持一致。

**修复建议**
把「全部标签 + 计数」的聚合抽到 `lib/tools.ts` 暴露如 `getAllTagStats()`，`getStaticPaths` 和页面都从同一函数取数据；或在 `getStaticPaths` 里把 tagStats 作为 props 传给页面（构建期只算一次）。后者最省：

```ts
// getStaticPaths 一次性算完
const tagStats = computeTagStats(tools); // [{tag,count}]
return [...tagMap.entries()].map(([tag, items]) => ({
  params: { tag: slugOf(tag) },
  props: { items, tag, tagStats },
}));
```

---

### 3. MEDIUM — EntryCard 双 anchor a11y 陷阱

**文件**：`src/components/EntryCard.astro`（L18–L70）

**问题**
设计意图是「整卡可点 + 右上角独立外链按钮」，两 `<a>` 平级无嵌套，结构正确。但存在两个可访问性问题：

1. **整卡 `<a>` 的点击区域覆盖了外链按钮位置**。整卡 `<a>` 用 `p-6 pr-10`，右侧虽缩进 `pr-10` 但并未真正让出 `absolute right-3 top-3` 那个 44×44 按钮的热区；当外链按钮出现时，该重叠区域既是整卡链接的热区又是按钮热区，屏幕阅读器会把它读成两个可激活区域，键盘焦点顺序也混乱。
2. **外链按钮缺少可见文本**。`aria-label={`${title} 外链`}` 依赖 title 动态生成，但标签文本「外链」语义过弱，读屏用户只知道「某名称 外链」——应改为更明确的「在新窗口打开xxx」或至少「访问 xxx 官网」。

**修复建议**
- 让整卡 `<a>` 的 padding 真正在右侧让出按钮空间（例如外链存在时追加 `pr-14` 之类），避免热区重叠；或改用 grid 布局让两 `<a>` 分占不同栅格区域不重叠。
- 改进 `aria-label`：`aria-label={`访问 ${title} 官网（新窗口）`}`。

---

### 4. LOW — category/tag 链接未统一走编码工具

**文件**
- `src/pages/tools/index.astro`（L32、L37）
- `src/pages/tools/category/[category]/index.astro`（L39）
- `src/pages/tools/tag/[tag]/index.astro`（L51–L54）
- `src/pages/tools/[slug]/index.astro`（L52）

**问题**
多处模板字符串裸拼动态路径片段：

```ts
href={`/tools/category/${c}`}   // c 含 CJK 时与 #1 同样隐患
href={`/tools/tag/${ta}`}       // tag 来自 schema，已 trim+toLowerCase，但仍可能含 CJK
```

而 `[slug]` 页走 `slugOf`。编码工具不统一，ASCII-only 的 tag（如 `macos`）没事，CJK tag（如 `效率`）就会和 category 一样踩 #1 的坑。

**修复建议**
复用同一个编码函数：

```ts
href={`/tools/category/${slugOf(c)}`}
href={`/tools/tag/${slugOf(ta)}`}
```

并把 `slugOf` 重命名或封装为通用的 `urlFragmentOf`，语义更清晰。

---

### 5. LOW — Footer 包裹 div 不一致

**文件**：`src/pages/tools/category/[category]/index.astro:68`

**问题**
`category/[category]` 页 `<Footer />` 外套了 `<div class="mt-24">`，而 `tag/[tag]` 与 `[slug]` 页的 `<Footer />` 没有这层包裹。三者布局风格不统一，额外的 div 可能制造多余的间距或破坏 Footer 根元素的样式选择器（如 `.dark footer` 之类的后代选择器）。

**修复建议**
统一：要么三页都裹，要么都不裹。选一种即可。

---

## 验证点（已确认 OK）

- ✅ **schema tags transform**：`z.array(z.string().transform(s => s.trim().toLowerCase())).transform(arr => [...new Set(arr)])` 正确完成 trim + 小写 + 去重；`getToolsByTag` 的 `target = tag.toLowerCase()` 与 schema 对齐。
- ✅ **`[slug]` 页编码对称**：`getStaticPaths` 用 `slugOf`、链接用 `slugOf`、`getRelated` 过滤也用 `slugOf(t.data.title)` 比较，三者一致；并附带了「重复 slug 构建期报错」保护，考虑周全。
- ✅ **`Content` 渲染 + `.prose`**：`render(entry)` 解构 `<Content />`，外层 `<article class="prose">`；`global.css` 手写了完整 `.prose` 样式，无 typography 插件（符合 P8 反过度工程）。
- ✅ **a11y 基线**：`aria-current="page"` 在 Breadcrumb/PillRow/TagCloud 正确使用；外链 `rel="noopener noreferrer"` 在 EntryCard 与 `[slug]` 页详情头都有；`focus-visible:ring` 与全局 `:focus-visible` outline 并存，焦点可见性 OK。
- ✅ **lib 收口**：页面一律经 `getAllTools` 读取，无直接 `getCollection` 散落；`slugOf` 统一出口，无内联 `encodeURIComponent`。
- ✅ **零改动 anime 集合**：`content.config.ts` 的 anime schema 本次无变更，未触碰。
- ✅ **EntryCard 双 anchor 无嵌套**：整卡 `<a>` 与外链 `<a>` 是兄弟节点，符合 TOOL-05 设计意图（虽热区重叠仍需修，见 #3）。

---

## 结论

整体实现干净、编码风格统一、数据层与渲染层职责分明。核心风险是 **#1 编码不对称**——唯一 HIGH——在含 CJK 分类/标签的真实数据（raycast.mdx 即含）上会暴露，建议上线前修复。其余为可维护性与 a11y 小修。

---

## Orchestrator Note（2026-07-15）：HIGH #1 假阳性判定

经实测，reviewer 标记的 #1（CJK param 未编码）为 **假阳性**，原始代码实际正确：

**证据链**：
1. **先编码 param → 构建失败**：将 `category/[category]` / `tag/[tag]` 的 `getStaticPaths` `params` 改为 `slugOf(category)`（编码值），同时 `href` 也编码 → `npm run build` 报 `NoMatchingStaticPathFound: … /tools/category/效率工具/`（解码请求路径找不到编码注册路径）。
2. **恢复解码值 → 构建 green**：还原 `params: { category }`（解码值）+ `href: /tools/category/${c}`（解码值）后 `npm run build` 通过 9 页，`dist/tools/category/效率工具/index.html` 真实生成，sitemap 自动产出编码 URL `category/%E6%95%88%E7%8E%87%E5%B7%A5%E5%85%B7/`。
3. **根因**：Astro 对 CJK 动态段的正确模式是 **params + href 均用解码值**，框架内部负责 URL 编码（反映在 sitemap 与实际访问路径中）。`[slug]` 页用 `slugOf`(编码) 成立是因为其真实种子数据 `Raycast` 是 ASCII、从未触发 CJK 路径匹配；reviewer 以 `[slug]` 为参照误判 category/tag 不对称。
4. **验证渲染**：确认构建产物中 CJK 分类页面的 Breadcrumb / PillRow / 网格 / EmptyState 均按解码值正常渲染，category `效率工具` 落地页存在且链接指向正确的编码 sitemap URL。

**处置**：还原为解码/解码一致组合（Astro 官方模式），CJK 路径实际可工作。#1 不再视为阻塞风险。revert 修复已一并提交。

**保留为 advisory 的项**：#2 (tag 页重复计算 getAllTools)、#3 (EntryCard 双 anchor 热区重叠 / a11y)、#4 (href 编码风格不统一 — 已恢复解码后不适用)、#5 (Footer 外层 div 包裹不一致)。均非阻塞，可在 v2 整理。
