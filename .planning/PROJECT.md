# 二次元个人网站（工具库 + 追番记录）

## What This Is

一个二次元风格的个人网站，用来记录和展示两类内容：好用的**软件/网站工具**，以及**追番记录**。以自己整理、回顾为主，但做成公开可访问，顺便让感兴趣的人也能看到。内容通过修改文件 + git 部署维护，无后台、无数据库。

v1.0 已上线（https://chuxisite.vercel.app），全站静态、可切亮/暗双主题、响应式，工具库与追番双模块端到端可用。

## Current Milestone: v1.1 内容编辑 UI

**Goal:** 在静态站内提供密码守卫的编辑界面，让维护者不必手写 MDX/JSON 即可管理追番与工具内容；编辑结果导出为 schema 兼容的 JSON 放进 content/，走既有 git 部署链路。

**Target features:**
- 隐藏路由 + 前端密码守卫（/admin 类）
- 追番记录编辑（状态 / 进度 / 评分 / 短评 / 封面）
- 工具条目编辑（名称 / 描述 / 链接 / 标签 / 分类 / 正文）
- 新增条目（新番剧 / 新工具）
- 导出 JSON 直插 content/（匹配 content.config.ts schema）
- 既有「改文件 → git push → Vercel」链路不变，编辑 UI 只替代手写这一环

## Core Value

工具库要好用——能清晰地分类、浏览、快速找到之前记录的工具，并为每个工具保留可长可短的图文说明。这是即使其他一切都不做也必须成立的部分。

（v1.0 验证：卡片列表 + MDX 详情 + 分类/标签档案 + 安全外链，核心循环跑通，价值主张成立。）

## Requirements

### Validated

（v1.0 全部验证通过）

- ✓ 工具库：以卡片列表/网格浏览工具，每个工具带链接、一句话描述、标签 — v1.0
- ✓ 工具库：每个工具有独立详情页，支持可长可短的图文内容（使用心得、截图、优缺点）— v1.0
- ✓ 工具库：支持按分类/标签筛选与浏览 — v1.0
- ✓ 追番记录：记录番剧的状态（在看 / 看完 / 想看）— v1.0
- ✓ 追番记录：为番剧评分、记录观看进度、写短评 — v1.0
- ✓ 追番记录：番剧封面、名称、集数等信息先手动录入，数据层预留 Bangumi 接入 — v1.0
- ✓ 全站：鲜艳可爱型二次元视觉风格 — v1.0
- ✓ 全站：亮色 / 暗色主题切换（防 FOUC，localStorage 记忆）— v1.0
- ✓ 内容维护：改文件（Markdown / 数据文件）+ git 提交自动部署 — v1.0（Vercel prod）
- ✓ 站点：响应式、sitemap.xml、SEO meta、404 — v1.0

### Active（v1.1 — 内容编辑 UI）

- [ ] **EDIT-01**: 访客在隐藏路由输入正确密码后可进入编辑界面（前端密码守卫，失败留在入口页）
- [ ] **EDIT-02**: 维护者可编辑已有追番条目（状态 / 进度 / 评分 / 短评 / 封面 URL）
- [ ] **EDIT-03**: 维护者可编辑已有工具条目（名称 / 描述 / 链接 / 标签 / 分类 / 正文）
- [ ] **EDIT-04**: 维护者可新增追番条目（表单 + 验证）
- [ ] **EDIT-05**: 维护者可新增工具条目（表单 + 验证）
- [ ] **EDIT-06**: 编辑结果可下载为 schema 兼容的 JSON 文件，放进 src/content/anime/ 或 src/content/tools/ 即可走 git 部署
- [ ] **EDIT-07**: 编辑界面读取现有条目并展示（经 lib/anime.ts / lib/tools.ts 收口），支持选择要编辑的条目
- [ ] **EDIT-08**: 新项目创建时生成合规 frontmatter（slug 派生、默认值、必填校验），与 Astro content.config.ts 一致

### Out of Scope

- 网页后台编辑 / 数据库 — 采用静态站点 + 改文件方式（v1.0 确认此决策：13 页面零运行时即跑通）
- 用户系统 / 评论 / 登录 — 以自己记录为主，公开只读（未来可接 Giscus 等无服务方案）
- 服务端全文搜索（Algolia 等）— 个人小数据集过度工程（v2 优先客户端 Fuse.js）
- 分页无限滚动 — 静态站几百条内一次性渲染 + 前端筛选体验更好
- 复杂动画 / 重特效 — 拖慢加载、损伤可访问性与移动端体验
- 移动端原生 App — Web 优先，响应式即可

## Context

- **当前上线版本**：v1.0（2026-07-16 归档，Vercel prod https://chuxisite.vercel.app）
- **代码规模**：src/ 约 30 个 Astro + 组件 + lib + 页面文件，src/content/ 2 条 seed 数据（tools/raycast.mdx, anime/frieren.mdx）
- **构建产物**：13 个静态页面 + sitemap.xml，build 耗时 ~2.2s，exit 0
- **技术栈**：Astro 7.0.9 + Tailwind v4 (@tailwindcss/vite, CSS-first @theme) + @astrojs/mdx + @astrojs/sitemap + astro-icon；Astro 内建 sharp 图像优化
- **部署**：Vercel static（output: static，零适配器，git push 自动部署）
- **内容模型**：工具库（tools 集合：name/desc/url/tags/category + MDX 正文）+ 追番（anime 集合：cover/title/originalTitle/episodes/status/progress/rating/review + bgmId 预留）
- **数据读取**：全部经 lib/tools.ts 与 lib/anime.ts 收口（不直接 getCollection），为 Bangumi 迁移铺路
- **样式风格**：鲜艳可爱二次元（青粉配色 + ZCOOL KuaiLe + deco SVG + EntryCard/AnimeCard 卡片）
- **已跑通 GSD 阶段**：Phase 1 (地基) / Phase 2 (工具库) / Phase 3 (追番记录)，9 个 plan 全部 SUMMARY + VERIFICATION PASSED
- **已知债务**：.prose hand-rolled（~40 行，仅覆盖常用元素）；Blob SVG 占位封面；本地 commit 领先 origin main（网络代理抖动暂时未 push 最新部署）

## Constraints

- **Tech stack**: Astro + Tailwind CSS — Astro 的 Content Collections 契合「改文件 + git」的内容维护方式；v1.0 岛屿最小化（默认全静态 .astro，仅 ThemeToggle 一处客户端）
- **部署**: Vercel — git 推送自动构建部署，零配置，output static 免适配器
- **内容维护**: 无后台、无数据库，内容以文件形式提交到 git（v1.0 验证：raycast/frieren 两条 seed 跑通）
- **可扩展性**: 番剧数据层需预留接入外部 API（Bangumi）的空间 — 已实现（schema 分层 + bgmId + lib/anime.ts 收口）

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 采用 Astro + Tailwind CSS v4 (CSS-first @theme) | 内容型静态站主流最优解，契合改文件维护，好维护 | ✓ 跑通：13 页面 build 2.2s exit 0 |
| 静态站点 + 改文件维护（无后台/无数据库）| 用户明确选择最简单方式 | ✓ Seed 两条 + git push 自动部署 |
| Vercel 部署（output: static） | 免费、免适配器、git 自动部署 | ✓ prod 上线 https://chuxisite.vercel.app |
| 番剧 schema 分层（客观元数据组 + 追番状态组，bgmId 预留）| v1 手动录入跑通功能，后续 Bangumi API 迁移不重写页面 | ✓ frieren seed 跑通，lib/anime.ts 收口 |
| 鲜艳可爱二次元 + 亮/暗双主题切换（防 FOUC） | 用户明确的视觉定位 | ✓ <head> is:inline + localStorage + 4.3KB ZCOOL 子集 |
| 工具库优先级高于追番（核心价值） | 用户选择「先做好一块就选工具库」 | ✓ Phase 2 排在 Phase 3 前，核心价值循环先闭环 |
| EntryCard 双层链接 article.relative + 绝对定位外链（零嵌套 a） | TOOL-05 rel=noopener + 无障碍 + 外链不劫持整卡点击 | ✓ code-review 零嵌套 a 通过 |
| .prose hand-rolled（~40 行）而非 @tailwindcss/typography 插件 | 零新增依赖，覆盖常用 Markdown 输出够用 | ⚠️ 仅 h2/h3/p/ul/a/code/pre/img/blockquote/hr，长文/表格再议 |
| AnimeCard 封面无图用 Blob SVG 占位 | 零依赖占位，后续接真实路径或 Bangumi 远程图 | ⚠️ 待内容库扩充时替换 |
| z from astro/zod（非 astro:content 再导出） | Astro 7 弃用后者，前者仍受支持 | ✓ 零错误 |
| 数据读取收口 lib/*.ts（不直接 getCollection） | 单一出口便于日后 Bangumi 迁移 | ✓ 全部读取经 getAllTools/getAllAnime |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-16 — v1.1 内容编辑 UI 里程碑启动*
