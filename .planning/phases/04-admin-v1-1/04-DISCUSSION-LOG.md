# Phase 4: Admin 外壳 + 密码守卫 + 条目浏览器 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-16
**Phase:** 04-Admin 外壳 + 密码守卫 + 条目浏览器
**Areas discussed:** 客户端技术选型, 密码守卫机制, 条目浏览器 UI

---

## 客户端技术选型

| Option | Description | Selected |
|--------|-------------|----------|
| 原生 <script> | 零新依赖，Astro 原生；Phase 4/5/6 合计 <300 行 JS，YAGNI | ✓ |
| Preact 岛屿 | roadmapper 建议，~4KB，React 兼容 API；需新装依赖 | |
| You decide | 让 Claude 按实际复杂度选 | |

**User's choice:** 原生 <script>（Recommended）
**Notes:** Phase 4 是本站首例有状态 UI，但逻辑简单，Preact 优势不明显。

---

| Option | Description | Selected |
|--------|-------------|----------|
| sessionStorage | 会话级（关 tab 即失效），刷新仍保持 | |
| localStorage | 持久化，关闭浏览器仍保持 | ✓ |
| 每次请求重输 | 最安全但体验差 | |

**User's choice:** localStorage
**Notes:** 持久化方便单人站使用；公共设备需手动退出清 localStorage。

---

| Option | Description | Selected |
|--------|-------------|----------|
| 硬编码在 <script> 里 | 最简单；单人站密码只是防偶然访问，非安全边界 | ✓ |
| 构建时 env 注入 | 不进代码库，稍复杂 | |
| You decide | 让 Claude 选 | |

**User's choice:** 硬编码在 <script> 里（Recommended）

---

## 密码守卫机制

| Option | Description | Selected |
|--------|-------------|----------|
| /admin | 直观惯例，不靠隐蔽性 | ✓ |
| /manage | 语义温和但非常规 | |
| 自定义隐蔽路径 | 如随机字符串，真正隐蔽时选 | |

**User's choice:** /admin（Recommended）

---

| Option | Description | Selected |
|--------|-------------|----------|
| 停留入口页 + 行内提示 | 不跳转不 404，体验好且不暴露路由存在 | ✓ |
| 返回 404 | 隐藏路由存在性但体验差 | |
| You decide | 让 Claude 选 | |

**User's choice:** 停留入口页 + 行内提示（Recommended）

---

| Option | Description | Selected |
|--------|-------------|----------|
| Tab 切换「追番 / 工具」 | 复用工作台壳，Phase 5/6 统一体验 | ✓ |
| 两个独立子路由 | /admin/anime 与 /admin/tools，URL 可直接分享 | |
| You decide | 让 Claude 选 | |

**User's choice:** Tab 切换「追番 / 工具」（Recommended）

---

## 条目浏览器 UI

| Option | Description | Selected |
|--------|-------------|----------|
| 管理型卡片网格 | 复用 AnimeCard/EntryCard + 操作按钮叠加，与前台视觉统一 | ✓ |
| 紧凑列表/表格 | 类似 WP/Ghost 后台，密度高但视觉与前台不一致 | |
| You decide | 让 Claude 选 | |

**User's choice:** 管理型卡片网格（Recommended）

---

| Option | Description | Selected |
|--------|-------------|----------|
| 仅类型 Tab | 不加搜索/筛选，YAGNI；v2 SEARCH 再做 | ✓ |
| 加关键词搜索 | 客户端过滤几十条内够用但超出 Phase 4 范围 | |
| 加状态/分类筛选 | 超出 Phase 4 范围 | |

**User's choice:** 仅类型 Tab（Recommended）

---

| Option | Description | Selected |
|--------|-------------|----------|
| 整卡点击编辑 + 删除图标 | 二次确认弹窗，与 Phase 5/6 衔接 | ✓ |
| 仅整卡点击 | 删除推迟 | |
| You decide | 让 Claude 选 | |

**User's choice:** 整卡点击进入编辑 + 删除图标按钮（Recommended）

---

| Option | Description | Selected |
|--------|-------------|----------|
| 导出不含该条目的 JSON | 与 EDIT-08 链路一致，不引入新机制 | ✓ |
| 仅标记删除 | 仍需导出步骤清除 | |
| 不做删除 | 仍走手动 git | |

**User's choice:** 导出不含该条目的 JSON（Recommended）

---

## Claude's Discretion

- `<script>` 岛屿挂载方式（inline vs Astro 处理 + define:vars）— 按 Astro v7 选
- 管理型卡片具体复用方式（复用 AnimeCard/EntryCard vs 新建 AdminCard）— 优先复用
- 二次确认弹窗实现（原生 window.confirm vs 自定义 modal）— 按视觉一致性选
- 密码错误提示文案与视觉样式 — 按 01-UI-SPEC 配色

## Deferred Ideas

None — 讨论全程未提出超出 Phase 4 范围的能力。
