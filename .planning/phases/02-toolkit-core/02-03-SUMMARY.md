---
phase: 02
slug: toolkit-core
plan: 03
type: execute
wave: 2
requirements: [TOOL-01, TOOL-02, TOOL-03, TOOL-04, TOOL-05]
completed: 2026-07-15
---

# 02-03 · 四张工具库页面 — 交付摘要

## 交付内容

| 文件 | 作用 |
|---|---|
| `src/pages/tools/index.astro` | 工具库主页（summary line + 分类 pill + 标签云 + 1/2/3 列网格） |
| `src/pages/tools/[slug]/index.astro` | MDX 详情页（entry.render + Content + breadcrumb + hero 外链按钮 + ToolDetailNav） |
| `src/pages/tools/category/[category]/index.astro` | 分类档案（getStaticPaths + PillRow active + empty state） |
| `src/pages/tools/tag/[tag]/index.astro` | 标签档案（Map 聚合 + TagCloud active + empty state） |
| `src/components/PillRow.astro` | 补 `class` prop 转发 |
| `src/components/TagCloud.astro` | 补 `class` prop 转发 |

## 验收结果

- `npx astro check` 0 error（2 个 pre-existing warning 来自 content.config.ts，与本 plan 无关）
- `npm run build` 9 路由通过，含 `/tools`、`/tools/Raycast`、`/tools/category/效率工具`、`/tools/tag/{效率,macos,启动器}`
- V-5 `target="_blank"` 与 `rel="noopener noreferrer"` 数量 2/2 完全对齐（EntryCard absolute 外链 + [slug] hero 外链）
- V-8 sitemap 全收录 `/tools/**` 路由
- V-6 anime schema/content.config.ts 零改动
- `git push origin main` 成功（b474b45..daa0414）

## 关键决策

- **详情页 entry 渲染**：Astro 7 Content Layer 的 `CollectionEntry` 类型不暴露 `.render()` 方法，改用 `import { render } from 'astro:content'` 顶层函数。
- **PillRow/TagCloud class 透传**：组件原本不接受 `class` prop，补 `class?: string` 接口 + 拼接转发，避免页面侧包一层 div 破坏语义。
- **Windows 目录名 `[slug]` 创建**：Write 工具在 Git Bash 下把 `]` 从目录名剥离，改用 `mkdir -p` 先建目录再写 `index.astro`。

## 需求牵引

| Requirement | 落地 |
|---|---|
| TOOL-01 | 主页卡片网格 + D-02 固定排序 |
| TOOL-02 | `/tools/[slug]` 独立详情 + MDX + breadcrumb + 底部 nav |
| TOOL-03 | `/tools/category/[category]` 分类静态档案 |
| TOOL-04 | `/tools/tag/[tag]` 标签静态档案 + tags transform 归一化后聚合 |
| TOOL-05 | 所有外链 target=_blank + rel=noopener noreferrer + aria-label |

## 提交

- `daa0414` feat(02-03): 四张工具库页面 — 主页 + 详情 + 分类档案 + 标签档案
