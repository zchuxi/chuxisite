# Requirements: v1.1 内容编辑 UI

**Defined:** 2026-07-16
**Milestone:** v1.1 内容编辑 UI
**Core Value:** 工具库要好用——能清晰地分类、浏览、快速找到之前记录的工具，并为每个工具保留可长可短的图文说明。
**v1.1 Editing Value:** 维护内容应像浏览内容一样简单——在站内编辑、导出 JSON、放进 content/、git push，链路不断。

## v1 Requirements（v1.0 — 已归档）

v1.0 的 17 条需求（INFRA-01..07, TOOL-01..05, ANIME-01..05）已于 2026-07-16 全部验证通过。
归档见 `.planning/milestones/v1.0-REQUIREMENTS.md`。

## v1.1 Requirements（Active）

### 访问控制 (Access)

- [ ] **EDIT-01**: 用户在隐藏路由输入正确密码后可进入编辑界面；密码错误或未输入则留在入口页，不暴露任何编辑能力 — *Phase 4*
- [ ] **EDIT-02**: 编辑界面加载时读取现有内容集合（经 lib/anime.ts / lib/tools.ts 收口），展示可编辑条目列表 — *Phase 4*

### 内容编辑 (Edit)

- [ ] **EDIT-03**: 维护者可编辑已有追番条目，字段包括：状态（在看 / 看完 / 想看）、观看进度（看到第 N 话 / 共 M 话）、评分（0-10）、短评、封面 URL — *Phase 5*
- [ ] **EDIT-04**: 维护者可编辑已有工具条目，字段包括：名称、一句话描述、外链 URL、标签列表、分类、正文（可长可短的图文内容）— *Phase 5*

### 新增条目 (Create)

- [ ] **EDIT-05**: 维护者可在站内新增追番条目，表单带必填校验（名称、状态为必填；集数、评分可选）— *Phase 6*
- [ ] **EDIT-06**: 维护者可在站内新增工具条目，表单带必填校验（名称、分类为必填；描述、链接、标签可选）— *Phase 6*
- [ ] **EDIT-07**: 新建条目时自动生成合规 frontmatter（slug 派生自名称、默认状态/空字段、字段类型与 content.config.ts Zod schema 一致）— *Phase 6*

### 数据导出 (Export)

- [ ] **EDIT-08**: 编辑/新增结果可下载为 JSON 文件，格式完全匹配 content.config.ts schema；下载后放进 src/content/anime/ 或 src/content/tools/ 即可触发既有 git → Vercel 部署链路 — *Phase 7*

## v1.2+ Requirements（已确认但推迟）

来自原 REQUIREMENTS.md v2 与 v1.1 范围之外的能力。

### 搜索与筛选增强 (Search)

- **SEARCH-01**: 工具库客户端即时文本搜索（Fuse.js 或 Pagefind）
- **SEARCH-02**: 分类 + 标签 + 搜索组合联动筛选

### 内容流 (Feed)

- **FEED-01**: RSS 订阅（新增工具 / 追番更新）
- **FEED-02**: 「最近更新」/ 时间线视图

### 追番增强 (Stat)

- **STAT-01**: 番剧统计概览（已看数 / 平均分等）
- **STAT-02**: 番剧按年份 / 季度 / 类型聚合浏览

### 外部集成 (API)

- **API-01**: Bangumi API 自动拉取番剧封面与元数据

## Out of Scope

显式排除，记录以防范围蔓延。

| Feature | Reason |
|---------|--------|
| 服务端编辑 / 数据库 | 仍坚守静态站 + 改文件定位；编辑 UI 只是客户端辅助工具，产出仍是文件 |
| 自动 git commit / push | 半自动方案：维护者手动把导出的 JSON 放进 content/ 并 git push；自动化需后端或 GitHub Actions，违背零后台 |
| 多用户 / 权限体系 | 单人站，一个密码足够；多人协作是未来议题 |
| 富文本编辑器（WYSIWYG） | 正文仍用 Markdown；维护者熟悉 MDX 工作流；WYSIWYG 是过度工程 |
| 内容版本历史 / 撤销 | 依赖 git 本身做版本回溯；UI 内撤销超出 v1.1 范围 |
| 实时保存到云端 | 违背静态站定位；本地编辑 + 导出即够 |

## Traceability

v1.1 需求到 roadmap 阶段的映射。

 | Requirement | Phase | Status |
 |-------------|-------|--------|
 | EDIT-01 | Phase 4 | Pending |
 | EDIT-02 | Phase 4 | Pending |
 | EDIT-03 | Phase 5 | Pending |
 | EDIT-04 | Phase 5 | Pending |
 | EDIT-05 | Phase 6 | Pending |
 | EDIT-06 | Phase 6 | Pending |
 | EDIT-07 | Phase 6 | Pending |
 | EDIT-08 | Phase 7 | Pending |

**Coverage:**
- v1.1 requirements: 8 total
- Mapped to phases: 8/8 ✓
- Unmapped: 0

---
*Requirements defined: 2026-07-16*
*Last updated: 2026-07-16 — v1.1 roadmap created, traceability filled*
