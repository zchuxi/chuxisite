# Feature Research

**Domain:** 二次元风格个人内容站（工具库 directory + 追番记录 tracker），Astro 静态站
**Researched:** 2026-07-14
**Confidence:** HIGH（Astro 官方能力经 Context7 验证；功能取舍基于成熟的 directory / tracker 站点惯例）

## Feature Landscape

两个并列模块共享同一套「静态数据 + 卡片列表 + 筛选 + 详情页」骨架。工具库为核心优先级（见 PROJECT.md）。以下表格按模块合并归类。

### Table Stakes (Users Expect These)

用户默认应该存在的功能。缺失会让站点显得不完整。

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 工具卡片网格/列表浏览 | directory 站的基本呈现形态 | LOW | Astro Content Collection + `getCollection` 遍历渲染，纯静态无需 JS |
| 工具一句话描述 + 外链 + 标签 | 快速扫读判断是否点开 | LOW | frontmatter 字段；外链 `target="_blank" rel="noopener"` |
| 工具独立详情页（可长可短图文） | Core Value：为每个工具保留图文说明 | LOW | Markdown/MDX body + `getStaticPaths` 生成静态路由 |
| 按分类浏览 | directory 导航的第一层结构 | LOW | 分类字段 + `/category/[cat]` 动态页（getStaticPaths） |
| 按标签筛选 | 跨分类的横向发现 | LOW-MED | `/tags/[tag]` 静态标签页（Astro 官方 recipe）；或客户端即时多选筛选（island） |
| 追番状态记录（在看/看完/想看） | tracker 的核心语义 | LOW | 枚举字段；三态本质上就是三个筛选视图 |
| 按状态筛选番剧列表 | 追番站最常用的视图切换 | LOW | 状态 tab / 分组渲染，纯静态即可 |
| 番剧评分 | tracker 表达主观评价的标配 | LOW | 数值字段（建议 5 或 10 分制）；星标/数字展示 |
| 番剧封面 + 名称 + 集数 | 追番列表的视觉识别 | LOW | 手动录入 + 本地/远程图片；用 Astro `<Image>` 优化 |
| 短评 / 观看进度 | 记录回顾的核心内容 | LOW | 短评=Markdown 片段；进度=「看到第 N 话 / 共 M 话」字段 |
| 响应式 / 移动端适配 | 现代 Web 基本要求 | LOW | Tailwind 断点；卡片网格自适应列数 |
| 亮/暗主题切换 | 已决策；二次元站视觉预期 | LOW-MED | Tailwind `dark:` + localStorage 持久化 + 防闪烁内联脚本 |
| sitemap.xml | 公开只读站被搜索引擎收录的基础 | LOW | `@astrojs/sitemap` 官方集成，一行配置（已验证） |
| 基础 SEO meta（title/description/OG） | 公开站分享与收录 | LOW | 复用 layout 的 `<head>` 组件，per-page 传入 |

### Differentiators (Competitive Advantage)

非必需但能提升质感的功能，契合「工具库要好用」的 Core Value。

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 客户端即时文本搜索 | 工具变多后快速定位，是「好用」的关键 | MEDIUM | 小数据集用 Fuse.js 加载进 island；若详情正文需全文搜再上 Pagefind |
| 多条件组合筛选（分类+标签+搜索联动） | directory 站的高级发现体验 | MEDIUM | 单个 island 持有全量 JSON 数据，前端过滤；数据几百条内性能无忧 |
| 工具优缺点/使用心得结构化区块 | 比纯链接目录更有信息价值 | LOW | 详情页 frontmatter 加 `pros`/`cons`/`rating` 结构字段 |
| 番剧年份/季度/类型标签维度 | 追番归档的多维浏览 | LOW-MED | 复用标签系统；可做「按年份/季度」聚合页 |
| RSS 订阅（新增工具/追番更新） | 让感兴趣的人持续关注 | LOW | `@astrojs/rss` 官方集成（已验证），从 collection 生成 |
| 二次元风格视觉细节（配色/插画/动效） | 用户从一开始强调的重点，氛围=内容 | MEDIUM | Tailwind 主题 token；克制的 CSS 过渡；避免拖慢加载 |
| 「最近更新」/时间线视图 | 体现站点活跃度与记录连续性 | LOW | 按 `updated` 字段排序渲染 |
| 番剧统计概览（已看数/平均分等） | tracker 的成就感与回顾价值 | LOW | 构建期聚合 collection 数据，静态渲染 |
| 图片懒加载 + 优化 | 封面/截图多时的性能 | LOW | Astro `<Image>`/`<Picture>` 内建，几乎零成本 |

### Anti-Features (Commonly Requested, Often Problematic)

对个人静态只读站刻意不做，避免范围蔓延与运维负担。

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| 用户账号 / 登录 | 「网站都有登录」惯性 | 需服务端+数据库，违背静态站定位；单人站无意义 | 无账号；维护者用 git 权限 |
| 评论系统 | 想要互动 | 需后端或第三方服务，带来审核/垃圾/隐私成本；v1 明确只读 | 预留位；未来可接 Giscus 等无服务方案 |
| 服务端全文搜索（Algolia/后端 API） | 「大站都这么搜」 | 个人小数据集杀鸡用牛刀，引入外部依赖与成本 | 客户端 Fuse.js / Pagefind，全静态 |
| 网页后台 CMS 编辑 | 想避免改文件 | 需服务端与数据库，违背「改文件+git」决策 | Content Collections + Markdown；可选 Astro 生态本地 CMS 界面 |
| v1 直接接 Bangumi API | 想自动拉封面元数据 | 过早外部依赖，拖慢 MVP；PROJECT.md 定为手动先行 | 手动录入，但数据层抽象好字段，预留 loader 接入位 |
| 分页无限滚动 | 「列表长要分页」 | 静态站几百条内一次性渲染+客户端筛选体验更好；无限滚动增复杂度 | 前端筛选/搜索收窄结果；量级过大再引入分页 |
| 复杂动画/重特效 | 强化二次元氛围 | 拖慢加载、损伤可访问性、移动端卡顿 | 克制的 CSS 过渡 + 少量点缀插画 |

## Feature Dependencies

```
内容数据模型（Content Collections + schema）
    └──requires──> 工具卡片浏览 / 番剧列表
                       └──requires──> 详情页（getStaticPaths）
                       └──requires──> 分类页 / 标签页 / 状态筛选
                                          └──enhances──> 客户端即时搜索/组合筛选

数据模型（含 updated 字段）──requires──> RSS / 「最近更新」/ 时间线
数据模型（含 rating/status）──requires──> 番剧统计概览
主题切换 ──independent──> 全站（正交，可任意阶段并行）
sitemap / SEO meta ──requires──> 稳定的路由结构（详情页先就位）
番剧数据层抽象 ──enables──> 未来 Bangumi API loader（无需重写页面）
```

### Dependency Notes

- **一切页面 requires 数据模型：** 先用 Astro Content Collections 定义工具与番剧的 schema（zod 校验字段），后续所有列表/详情/筛选/RSS 都从中派生。这是必须最先落地的地基。
- **搜索/组合筛选 enhances 分类标签页：** 静态标签/分类页先满足基础导航；客户端搜索是叠加在其上的体验增强，非前置依赖，可后置。
- **RSS/统计/时间线 require `updated`/`rating`/`status` 字段：** 在 schema 阶段就把这些字段设计进去，避免后期回填数据。
- **Bangumi 接入 enabled by 数据层抽象：** 只要页面消费的是抽象后的番剧数据结构（而非直接读死手填字段），未来把「手动录入」替换/补充为「API loader」即可平滑迁移——满足 PROJECT.md 的可扩展性约束。
- **主题切换与 SEO 正交：** 与内容功能无耦合，可并行开发；主题切换需内联防闪烁脚本这一实现细节。

## MVP Definition

### Launch With (v1)

验证概念所需的最小集合。工具库优先于追番（若只能做好一块选工具库）。

- [ ] Content Collections 数据模型（工具 + 番剧 schema） — 所有功能的地基
- [ ] 工具卡片网格浏览（描述/外链/标签/分类） — Core Value 呈现
- [ ] 工具详情页（Markdown 图文，可长可短） — Core Value 的核心
- [ ] 分类 + 标签筛选浏览 — 「好用」的基础导航
- [ ] 追番列表 + 状态筛选（在看/看完/想看） — tracker 核心
- [ ] 番剧评分 / 进度 / 短评 / 封面（手动录入） — tracker 记录内容
- [ ] 响应式布局 — 移动端可用
- [ ] 亮/暗主题切换 — 已决策的视觉预期
- [ ] 二次元视觉风格基线（配色/排版） — 用户强调的重点
- [ ] sitemap + 基础 SEO meta — 公开只读站被收录

### Add After Validation (v1.x)

核心跑通后叠加，多为「让工具库更好用」的增强。

- [ ] 客户端即时文本搜索（Fuse.js） — 触发：工具数量增长到扫读困难时
- [ ] 分类+标签+搜索组合联动筛选 — 触发：单一维度筛选不够用
- [ ] RSS 订阅 — 触发：有外部读者希望持续关注
- [ ] 「最近更新」/ 时间线视图 — 触发：想体现记录连续性
- [ ] 番剧统计概览 — 触发：追番数据积累到有回顾价值

### Future Consideration (v2+)

达到稳定后再考虑，多涉及外部依赖或互动。

- [ ] Bangumi API 自动拉取封面/元数据 — 手动录入验证功能后再接，减少初期外部依赖
- [ ] Pagefind 详情正文全文搜索 — 详情页正文积累够多、文本搜索需求超出字段级时
- [ ] 无服务评论（Giscus 等） — 若确有互动需求且愿承担第三方依赖
- [ ] 更丰富的二次元动效/插画点缀 — 在不损伤性能与可访问性前提下

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Content Collections 数据模型 | HIGH | LOW | P1 |
| 工具卡片浏览 + 详情页 | HIGH | LOW | P1 |
| 分类/标签筛选 | HIGH | LOW | P1 |
| 追番状态筛选 + 评分/短评/封面 | HIGH | LOW | P1 |
| 响应式 + 亮/暗主题 | HIGH | LOW-MED | P1 |
| 二次元视觉基线 | HIGH | MEDIUM | P1 |
| sitemap + SEO meta | MEDIUM | LOW | P1 |
| 客户端文本搜索 | HIGH | MEDIUM | P2 |
| 组合筛选联动 | MEDIUM | MEDIUM | P2 |
| RSS 订阅 | MEDIUM | LOW | P2 |
| 最近更新 / 时间线 | MEDIUM | LOW | P2 |
| 番剧统计概览 | MEDIUM | LOW | P2 |
| Bangumi API 接入 | MEDIUM | MEDIUM-HIGH | P3 |
| Pagefind 全文搜索 | LOW-MED | MEDIUM | P3 |
| 评论系统 | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | 工具 directory 站（如各类「工具集/导航站」） | 追番站（如个人 AniList/Bangumi 导出页） | Our Approach |
|---------|--------------|--------------|--------------|
| 浏览形态 | 卡片网格 + 分类侧栏 | 封面网格 + 状态 tab | 两模块共用卡片网格骨架，各自筛选维度 |
| 搜索 | 服务端/Algolia | 站内库搜索 | 客户端 Fuse.js（小数据集），零后端 |
| 数据来源 | 后台 CMS/数据库 | API 同步 | 改文件 + Content Collections，手动录入 |
| 评分/进度 | 无 | 有（源自平台） | 手动 frontmatter 字段，schema 预留 |
| 互动 | 评论/收藏 | 评论/点赞 | 刻意不做（v1 只读），预留无服务方案 |
| SEO | 强（引流目标） | 弱（多为私人） | 中：sitemap+meta+RSS，兼顾公开可见 |

## Sources

- Astro 官方文档（Context7 `/withastro/docs`）— RSS recipe（`@astrojs/rss`、`pagesGlobToRssItems`）、`@astrojs/sitemap` 集成、动态标签页 `getStaticPaths` 惯例 — HIGH
- Astro Content Collections / Islands 架构能力 — 契合「Markdown + 改文件」维护与局部交互（PROJECT.md 约束）— HIGH
- Pagefind（静态全文搜索）与 Fuse.js（客户端模糊搜索）为静态站两大成熟搜索方案 — 训练知识，稳定通用 — MEDIUM（未在线二次核验版本）
- Directory / tracker 站点通用功能惯例（分类/标签/状态/评分/卡片网格）— 领域惯例综合 — MEDIUM

---
*Feature research for: 二次元个人内容站（工具库 + 追番记录）*
*Researched: 2026-07-14*
