# Phase 3: 追番记录 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-15
**Phase:** 03-anime-tracker
**Areas discussed:** filtering, card-list, detail, routing

---

## 状态筛选模型（Filtering）

### Q1: 观看状态筛选做法？

| Option | Description | Selected |
|--------|-------------|----------|
| 静态筛选页（推荐） | /anime/status/:status，getStaticPaths 预生成，零 JS。与工具库对称。 | ✓ |
| 客户端 tab 切换 | 顶部 tab 切换 + 纯 DOM show/hide。 | |
| Claude 决定 | 静态筛选页（P8）。 | |

**User's choice:** 静态筛选页（推荐）

### Q2: 筛选 URL 形式？

| Option | Description | Selected |
|--------|-------------|----------|
| /anime/status/:status（小写英文值） | 与 schema enum 对齐 watching\|done\|plan。 | ✓ |
| Claude 决定 | 英文路径 + 页内中文标题。 | |

**User's choice:** /anime/status/:status（小写英文值）

### Q3: 筛选入口？

| Option | Description | Selected |
|--------|-------------|----------|
| 列表页顶部状态 pill 行（推荐） | 仿工具库 PillRow。 | ✓ |
| Claude 决定 | 状态 pill 入口。 | |

**User's choice:** 列表页顶部状态 pill 行（推荐）

---

## 番剧卡片与列表布局（Card & List）

### Q4: 卡片形态？

| Option | Description | Selected |
|--------|-------------|----------|
| 封面图卡（推荐） | AnimeCard：cover image 固定比例 + 占位回退。 | ✓ |
| 纯文本卡（改造 EntryCard） | ph:icon 替代封面。 | |
| Claude 决定 | 封面图卡。 | |

**User's choice:** 封面图卡（推荐）

### Q5: 网格列数？

| Option | Description | Selected |
|--------|-------------|----------|
| 1→2→3 列（推荐） | 与工具库一致。 | ✓ |
| 1→2→2 列 | 桌面 2 列更醒目。 | |
| Claude 决定 | 1→2→3。 | |

**User's choice:** 1→2→3 列（推荐）

### Q6: 卡上元信息？

| Option | Description | Selected |
|--------|-------------|----------|
| 封面+标题+状态标签+评分星级+进度（推荐） | 全 5 项。 | ✓ |
| 封面+标题+状态+评分（无进度） | 更克制。 | |
| Claude 决定 | 全 5 项。 | |

**User's choice:** 全 5 项

---

## 详情页结构（Detail）

### Q7: 详情页排版？

| Option | Description | Selected |
|--------|-------------|----------|
| 封面大图+侧边元信息卡+下方 MDX 心得（推荐） | 两栏顶部 + MDX 下方。 | ✓ |
| 标题顶头+封面+正文流（简洁） | 单栏垂直流。 | |
| Claude 决定 | 两栏 + MDX。 | |

**User's choice:** 封面大图+侧边元信息卡+下方 MDX 心得（推荐）

### Q8: 评分/进度形式？

| Option | Description | Selected |
|--------|-------------|----------|
| 评分星级+数字，进度 N/M 话（推荐） | 与卡上一致。 | ✓ |
| Claude 决定 | 评分+进度文字。 | |

**User's choice:** 评分星级+数字，进度 N/M 话（推荐）

---

## 路由与 v2 Bangumi（Routing）

### Q9: 路由方案？

| Option | Description | Selected |
|--------|-------------|----------|
| /anime + /anime/[slug] + /anime/status/:status（推荐） | 三路由平行工具库。 | ✓ |
| Claude 决定 | 三路由。 | |

**User's choice:** /anime + /anime/[slug] + /anime/status/:status（推荐）

### Q10: v2 Bangumi 预留程度？

| Option | Description | Selected |
|--------|-------------|----------|
| 仅 schema + config 已预留，不写拉取脚本（推荐） | P8 反过度工程。 | ✓ |
| 额外预留 fetcher 接口形状 | 写 interface + config 声明。 | |
| Claude 决定 | 仅预留。 | |

**User's choice:** 仅 schema + config 已预留，不写拉取脚本（推荐）

---

## Claude's Discretion

- D-04 封面 poster 比例（planner 按 01-UI-SPEC 选）
- D-08 star 实现（astro-icon vs CSS）
- 状态标签配色（取 01-UI-SPEC 调色板）

## Deferred Ideas

- Bangumi API 真实拉取（lib/anime-remote.ts）— v2
- 客户端评分/进度/状态编辑 UI — v2
- 搜索/全文检索 — v2
- RSS/最近更新/统计 — v2

---
*Phase: 03-anime-tracker*
*Discussion closed: 2026-07-15*
