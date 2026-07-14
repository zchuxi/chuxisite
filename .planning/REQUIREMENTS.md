# Requirements: 二次元个人网站（工具库 + 追番记录）

**Defined:** 2026-07-14
**Core Value:** 工具库要好用——能清晰地分类、浏览、快速找到之前记录的工具，并为每个工具保留可长可短的图文说明

## v1 Requirements

初始发布的需求。每条映射到 roadmap 阶段。工具库为核心优先级。

### 站点基础设施（Infra）

- [ ] **INFRA-01**: 站点采用 Astro + Tailwind 静态架构，内容以文件（Markdown/MDX）维护，git 提交后自动部署到 Vercel/Netlify
- [ ] **INFRA-02**: 定义工具与番剧两个内容集合的类型安全数据模型（Content Layer + Zod schema），番剧 schema 分客观元数据组与追番状态组，预留 Bangumi API 字段（bgmId 等）
- [ ] **INFRA-03**: 全站响应式布局，移动端可正常浏览
- [ ] **INFRA-04**: 用户可在亮色 / 暗色主题间切换，选择被记住，且首屏加载无主题闪烁（FOUC）
- [ ] **INFRA-05**: 全站呈现鲜艳可爱型二次元视觉风格（配色 / 排版基线）
- [ ] **INFRA-06**: 站点生成 sitemap.xml，并为每个页面输出基础 SEO meta（title / description / Open Graph）
- [ ] **INFRA-07**: 首页为二次元风格落地页，展示站点简介与工具库 / 追番两大模块入口

### 工具库（Tool，核心）

- [ ] **TOOL-01**: 用户可以卡片网格 / 列表形式浏览所有工具，每张卡片显示名称、一句话描述、外链、标签
- [ ] **TOOL-02**: 用户可点击工具进入独立详情页，查看可长可短的图文内容（使用心得、截图、优缺点）
- [ ] **TOOL-03**: 用户可按分类浏览工具（分类静态页）
- [ ] **TOOL-04**: 用户可按标签筛选工具（标签静态页）
- [ ] **TOOL-05**: 工具外链在新标签页打开，并带 `rel="noopener noreferrer"`

### 追番记录（Anime）

- [ ] **ANIME-01**: 用户可浏览追番列表，每部番剧以封面卡片显示名称、集数、评分、状态
- [ ] **ANIME-02**: 用户可按观看状态（在看 / 看完 / 想看）筛选番剧列表
- [ ] **ANIME-03**: 每部番剧可记录评分、观看进度（看到第 N 话 / 共 M 话）与短评
- [ ] **ANIME-04**: 用户可进入番剧详情页查看完整信息与短评
- [ ] **ANIME-05**: 番剧封面与元数据（名称 / 集数等）支持手动录入，数据层预留后续 Bangumi API 接入而无需重写页面

## v2 Requirements

已确认但推迟到未来发布，不在当前 roadmap 中。

### 搜索与筛选增强（Search）

- **SEARCH-01**: 工具库客户端即时文本搜索（Fuse.js）
- **SEARCH-02**: 分类 + 标签 + 搜索组合联动筛选

### 内容流（Feed）

- **FEED-01**: RSS 订阅（新增工具 / 追番更新）
- **FEED-02**: 「最近更新」/ 时间线视图

### 追番增强（Stat）

- **STAT-01**: 番剧统计概览（已看数 / 平均分等）
- **STAT-02**: 番剧按年份 / 季度 / 类型聚合浏览

### 外部集成（API）

- **API-01**: Bangumi API 自动拉取番剧封面与元数据

## Out of Scope

显式排除，记录以防范围蔓延。

| Feature | Reason |
|---------|--------|
| 用户账号 / 登录 | 需服务端 + 数据库，违背静态站定位；单人站无意义 |
| 评论系统 | 需后端或第三方服务，带审核 / 垃圾 / 隐私成本；v1 明确只读（未来可接 Giscus 等无服务方案） |
| 服务端全文搜索（Algolia 等） | 个人小数据集过度工程，引入外部依赖与成本 |
| 网页后台 CMS 编辑 / 数据库 | 违背「改文件 + git、无后台」的核心决策 |
| 分页无限滚动 | 静态站几百条内一次性渲染 + 前端筛选体验更好 |
| 复杂动画 / 重特效 | 拖慢加载、损伤可访问性与移动端体验 |
| 移动端原生 App | Web 优先，响应式即可 |

## Traceability

各阶段覆盖哪些需求。roadmap 创建时填充。

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | TBD | Pending |
| INFRA-02 | TBD | Pending |
| INFRA-03 | TBD | Pending |
| INFRA-04 | TBD | Pending |
| INFRA-05 | TBD | Pending |
| INFRA-06 | TBD | Pending |
| INFRA-07 | TBD | Pending |
| TOOL-01 | TBD | Pending |
| TOOL-02 | TBD | Pending |
| TOOL-03 | TBD | Pending |
| TOOL-04 | TBD | Pending |
| TOOL-05 | TBD | Pending |
| ANIME-01 | TBD | Pending |
| ANIME-02 | TBD | Pending |
| ANIME-03 | TBD | Pending |
| ANIME-04 | TBD | Pending |
| ANIME-05 | TBD | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 0（roadmap 待创建）
- Unmapped: 17 ⚠️

---
*Requirements defined: 2026-07-14*
*Last updated: 2026-07-14 after initial definition*
