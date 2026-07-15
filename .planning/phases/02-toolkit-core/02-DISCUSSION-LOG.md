# Phase 2: 工具库（核心）- Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-15
**Phase:** 02-toolkit-core
**Areas discussed:** layout, filtering, detail, index-page

---

## 布局与视图（Layout）

### Q1: 工具库主页浏览布局？

| Option | Description | Selected |
|--------|-------------|----------|
| 纯卡片网格（推荐） | 复用现有 EntryCard，响应式 1→2→3 列网格。与落地页视觉统一，零新组件。 | |
| 网格+列表视图切换 | 加视图切换按钮（网格↔列表），需最小岛屿或纯 CSS。成功标准里写了「列表形式」则可选；会引入客户端状态。 | |
| Claude 决定 | 我按成功标准与现有组件判断：若标准明确要求两种就做切换，否则纯网格。 | ✓ |

**User's choice:** 纯卡片网格（推荐）
**Notes:** 直接拍板推荐项。

### Q2: 卡片网格带排序控件吗？

| Option | Description | Selected |
|--------|-------------|----------|
| 固定排序，不加控件（推荐） | 沿用 getAllTools() 现有排序，主页零交互。最简；想改排序可后续加。 | ✓ |
| 加排序下拉 | 标题序 / 最近加 等切换，需小岛屿或纯 JS。几十条内容时意义不大（v1 可不做）。 | |
| Claude 决定 | 我按 v1 内容量判断：几十条以下不加排序控件。 | |

**User's choice:** 固定排序，不加控件（推荐）
**Notes:** —

### Q3: 响应式列数？

| Option | Description | Selected |
|--------|-------------|----------|
| 1→2→3 列（推荐） | 移动端 1、平板 2（md）、桌面 3（lg）列。配合 max-w 容器居中。 | ✓ |
| 1→2→3→4 列 | 大屏 4 列更紧凑，但卡片过窄可能截断描述。 | |
| Claude 决定 | 我按卡片最小可读宽度判断，通常 1→2→3。 | |

**User's choice:** 1→2→3 列（推荐）
**Notes:** —

### Q4: 外链在卡片上如何展示与点击？

| Option | Description | Selected |
|--------|-------------|----------|
| 整卡可点 + 独立外链按钮（推荐） | 卡片点击进入详情页(TOOL-02)；卡片内再放一个小外链图标按钮，target=_blank + rel=noopener。 | ✓ |
| 仅整卡可点，外链在详情页 | 卡片简化，外链统一在详情页放。成功标准 1 要求卡片显示外链，可能不满足显式要求。 | |
| Claude 决定 | 我按成功标准 1 判断：卡片显示外链→取「整卡可点 + 独立外链按钮」。 | |

**User's choice:** 整卡可点 + 独立外链按钮（推荐）
**Notes:** —

---

## 分类 / 标签交互模型（Filtering）

### Q5: 分类如何浏览？

| Option | Description | Selected |
|--------|-------------|----------|
| 静态分类页（推荐） | /tools/category/[category]，getStaticPaths 预生成，零 JS。点选分类跳新页列出该分类下工具。 | ✓ |
| 首部分类过滤 | 首页加分类 tab/下拉，切分类就地过滤。需客户端状态（岛屿）。 | |
| Claude 决定 | 静态分类页（研究蓝图/P8 推荐）。 | |

**User's choice:** 静态分类页（推荐）
**Notes:** 符合 Phase 1 研究蓝图与 P8 静态优先。

### Q6: 标签如何筛选？

| Option | Description | Selected |
|--------|-------------|----------|
| 静态标签页（推荐） | /tools/tag/[tag]，getStaticPaths 预生成，tool 多 tag 多页。每张卡片的 tag 是链接。 | ✓ |
| 客户端勾选过滤 | 首页加 tag 复选框组（Toggle），勾选后纯 DOM show/hide 过滤卡片——无岛屿，仅一个 <script>。 | |
| 静态为主 + 先不放标签云 | 先建 /tools/tag/[tag] 静态页 + 卡片上 tag 可点；首页暂不列标签云/过滤。 | |

**User's choice:** 静态标签页（推荐）
**Notes:** —

### Q7: 标签值自由录入还是枚举约束？

| Option | Description | Selected |
|--------|-------------|----------|
| 自由录入（推荐） | 不约束标签枚举，维护者随手写；schema 加 .transform() 去重/小写/去空格，避免分裂。 | ✓ |
| 约束枚举 + 新标签需登记 | 维护一个允许标签表（如 content/tags.ts），schema 校验。更整洁但增加录入摩擦。 | |
| Claude 决定 | 自由录入 + transform 归一化。 | |

**User's choice:** 自由录入（推荐）
**Notes:** —

### Q8: 分类/标签档案页信息架构？

| Option | Description | Selected |
|--------|-------------|----------|
| 与工具库主页一致风格（推荐） | 复用同一个网格组件 + BaseLayout，只替换数据集。标题、面包屑、空状态。 | ✓ |
| Claude 决定 | 我复用主页网格 + BaseLayout，保持全站一致；仅标题/数据集/面包屑不同。 | |

**User's choice:** 与工具库主页一致风格（推荐）
**Notes:** —

---

## 详情页导航与组织（Detail）

### Q9: 工具详情页 URL 方案？

| Option | Description | Selected |
|--------|-------------|----------|
| /tools/[slug]（推荐） | slug 派生自 title（去中文/转拼音或 URL-encode）。Astro getStaticPaths 预生成。 | ✓ |
| /tools/[id] 数字编号 | frontmatter 加 id，稳定但维护者需记编号。 | |
| Claude 决定 | 按研究蓝图：title 派生 slug + 唯一性校验。 | |

**User's choice:** /tools/[slug]（推荐）
**Notes:** 具体派生（拼音/URL-encode/冲突）交 planner。

### Q10: 卡片跳详情页的入口行为？

| Option | Description | Selected |
|--------|-------------|----------|
| 除外链按钮外整卡点击进入详情（推荐） | 卡片主体 + 工具名点击进入(/tools/[slug])；外链按钮独立 target=_blank。 | ✓ |
| Claude 决定 | 按布局决策：href = 详情页。 | |

**User's choice:** 除外链按钮外整卡点击进入详情（推荐）
**Notes:** —

### Q11: 详情页底部「相关工具/返回工具库」导航？

| Option | Description | Selected |
|--------|-------------|----------|
| 返回工具库 + 1-2 个同 category 相关（推荐） | 底部简单 nav：「返回工具库」链接 + 同分类的前/后 1-2 个工具卡片。 | ✓ |
| 仅返回工具库链接 | 最简底栏；相关工具后续再加。 | |
| Claude 决定 | 按 MVP 闭环意识取「返回工具库 + 同分类相关 1-2」。 | |

**User's choice:** 返回工具库 + 1-2 个同 category 相关（推荐）
**Notes:** —

### Q12: MDX 正文如何渲染？

| Option | Description | Selected |
|--------|-------------|----------|
| Render Content + MDX 组件（推荐） | Astro Content 渲染 MDX 正文，允许嵌入 Image/组件。心得/优缺点/截图以普通 MDX markdown 撰写。 | ✓ |
| Claude 决定 | 按 schema 蓝本：MDX 正文用 Content 渲染。 | |

**User's choice:** Render Content + MDX 组件（推荐）
**Notes:** —

---

## 索引页组织方式（Index Page）

### Q13: 工具库主页自上而下如何排？

| Option | Description | Selected |
|--------|-------------|----------|
| Header + 工具栏(计数/说明) + 全部工具网格 + Footer（推荐） | BaseLayout 包；一行说明+计数，下接网格列出 getAllTools()。分类/标签入口在说明行附近。 | ✓ |
| Header + 分类区(按 category 分区 heading) + 标签云 + 工具网格 | 按 category 分段展示 + 标签云入口。组织更丰富但遍历成本高。 | |
| Claude 决定 | 按 MVP 核心取「说明+计数+全部网格」，简洁优先。 | |

**User's choice:** Header + 工具栏(计数/说明) + 全部工具网格 + Footer（推荐）
**Notes:** —

### Q14: 分类/标签入口放在哪里？

| Option | Description | Selected |
|--------|-------------|----------|
| 分类一行链接 + 标签云（推荐） | 在「说明+计数」块里放「分类：效率开发设计…」一行 pill 链接跳 category 页；下面一个标签云跳 tag 页。 | ✓ |
| 仅顶部一个「分类/标签」二级导航 | 不打扰网格，统一跳一个筛选索引页。 | |
| Claude 决定 | 小型分类 pill 行 + 标签云中密度入口（v1 易扫）。 | |

**User's choice:** 分类一行链接 + 标签云（推荐）
**Notes:** —

### Q15: 工具库网格要分页吗？

| Option | Description | Selected |
|--------|-------------|----------|
| 不分页，一页全列出（推荐） | 几十条内一页加载没问题；静态全量，最简。分页属 v2。 | ✓ |
| 简单分页 | 每页 N 条 + 上/下页按钮，需参数路由或客户端。v1 过重。 | |
| Claude 决定 | v1 不分页，一页全列出。 | |

**User's choice:** 不分页，一页全列出（推荐）
**Notes:** —

---

## Claude's Discretion

以下选项用户采用「Claude 决定」或明确交由 planner：
- D-09 具体 slug 派生方案（拼音/URL-encode/重复冲突处理）
- D-11 相关工具的排序/选取策略（同 category 内按 title 序取前 2）
- EntryCard.astro 具体改造（加外链按钮 + href 指向详情 vs 外链）
- 「搜索」留作 v2（v1 不加搜索框）

## Deferred Ideas

全程未提出超出 Phase 2（TOOL-01..05）范围的能力，无推迟项。

---
*Phase: 02-toolkit-core*
*Discussion closed: 2026-07-15*
