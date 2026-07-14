# Research Summary

**Domain:** 二次元风格个人内容站（工具库 + 追番记录，Astro 7 + Tailwind v4 文件驱动静态站）
**Researched:** 2026-07-14
**Confidence:** HIGH（核心技术栈经 npm registry + Context7 官方文档核实；功能取舍与岛屿框架选型为领域惯例判断，标注 MEDIUM）

本文综合 STACK / FEATURES / ARCHITECTURE / PITFALLS 四份研究，供 roadmap 使用。

## Recommended Stack

- **Astro 7.0.9**（Node ≥ 22.12.0）—— 静态优先、Islands 架构、Content Layer 契合「改文件 + git 部署」
- **Tailwind CSS v4** 经 `@tailwindcss/vite`（CSS-first `@import "tailwindcss"` + `@theme`，**不用**已弃用的 `@astrojs/tailwind` 和 `tailwind.config.js`）
- **@astrojs/mdx** —— 详情页「可长可短图文」，Markdown 中嵌组件
- **Content Layer API**（`src/content.config.ts` + `glob()` loader + Zod schema）—— 两个内容集合的类型安全数据层
- **Preact**（唯一岛屿框架，~3–4KB）+ **nanostores** 跨岛屿状态 —— 仅用于真正有状态的交互（追番评分/进度、复杂筛选）；能原生就原生
- **@astrojs/sitemap** + **astro:assets/sharp**（图片优化）
- **部署 Vercel/Netlify** —— `output:'static'` 免适配器，git push 自动构建
- **推迟引入**：Pagefind（数百条内容后再上全文搜索）、Fuse.js（客户端搜索作为 P2 增强）

## Table Stakes（v1 必做）

- Content Collections 数据模型（工具 + 番剧 schema）—— 所有功能的地基
- 工具卡片网格浏览（一句话描述 + 外链 + 标签）+ 独立详情页（图文）
- 按分类 / 标签筛选浏览（`getStaticPaths` 静态页）
- 追番列表 + 状态筛选（在看/看完/想看）+ 评分 / 进度 / 短评 / 封面（手动录入）
- 响应式布局 + 亮/暗主题切换（内联防闪烁脚本）
- 二次元视觉风格基线（鲜艳可爱型）
- sitemap + 基础 SEO meta（公开只读站收录）

## Differentiators（v1.x/v2 增强）

- 客户端即时文本搜索（Fuse.js）→ 工具变多时
- 分类+标签+搜索组合联动筛选
- RSS 订阅、「最近更新」/时间线视图、番剧统计概览
- 更丰富的二次元动效/插画点缀（不损性能前提下）

## Anti-Features（刻意不做）

- 用户账号/登录、评论系统、服务端全文搜索、网页后台 CMS —— 违背「静态站 + 改文件」定位
- v1 直接接 Bangumi API —— 过早外部依赖，改为手动录入 + 数据层预留
- 无限滚动分页、重特效动画

## Architecture 要点

- 单仓库纯静态，数据单向流：**内容文件 → Content Layer(Zod 校验) → `lib/*.ts` 薄数据层 → pages(getStaticPaths) → 静态 HTML → (仅需交互处)Preact 叶子岛屿**
- **可插拔番剧数据源**（手动 → Bangumi API 页面零改动）靠三个支点：① schema 分层（客观元数据组 `bgmId/titleJa/titleCn/cover/episodes` 可空 + 我的状态组 `status/myRating/progress/comment` 永远手动）；② `cover` 兼容本地/远程 + 预配 `image.remotePatterns`；③ `lib/anime.ts` 收口读取，页面只调 `getAllAnime()` 不直接 `getCollection`
- 岛屿最小化：初始主题走 `<head>` 内联同步脚本（非岛屿），只有真正有状态的 UI 才做 Preact 叶子

## 关键 Pitfalls（须在对应阶段规避）

1. **番剧数据层写死是最高风险**（P1）—— schema 必须在追番模块第一步、UI 之前按 Bangumi subject 结构分层设计，否则日后接 API 只能推倒重录
2. **技术栈版本迁移**（P2）—— 用 `content.config.ts` + 显式 loader（非旧 `content/config.ts`）；Tailwind v4 经 Vite 插件（非弃用的 `@astrojs/tailwind`）；大量旧教程会误导
3. **主题 FOUC**（P3）—— 亮/暗初始主题必须 `<head>` 阻塞式内联脚本，绝不依赖岛屿 hydration
4. **图片优化**（P4）—— 大封面/截图强制走 `astro:assets`（WebP/AVIF、lazy）；提前配 `remotePatterns` 为 Bangumi 铺路
5. **CJK 装饰字体成本**（P5）—— 二次元装饰字体单文件 3–10MB，仅用于标题 + 系统字体正文 + 子集化
6. **岛屿过度水合 / 筛选过度工程**（P6/P7）—— 默认 `.astro` 静态，分类页 `getStaticPaths` 构建期生成，客户端只做增强
7. **过度工程**（P8）—— 个人静态站不引入 CMS/数据库/重型状态管理

## 建议构建顺序（依赖驱动，工具库优先于追番）

1. **脚手架 + 内容建模** —— `create astro`、`astro add tailwind mdx preact sitemap`、两集合 schema（含番剧分层字段）、`astro.config` 设 `site` + `remotePatterns`（防 P2/P1/P8）
2. **基础布局 + 主题系统** —— BaseLayout、`<head>` 内联主题脚本、Tailwind `@theme` + `@custom-variant dark`、导航壳（先于内容模块，防 P3/P6）
3. **工具库模块（核心优先）** —— `lib/tools.ts`、列表/网格、`[...slug]` 详情（首用 `astro:assets`）、`tag/[tag]` 静态分类页（防 P4/P7）
4. **追番模块** —— `lib/anime.ts` 薄封装（可插拔关键）、状态分组列表、详情、评分/进度岛屿（数据层设计先于 UI，防 P1）
5. **二次元视觉打磨** —— 色板、字体子集化、卡片/徽章、暗色对比度（刻意后置，防 P5/P8）
6. **上线收尾** —— sitemap/canonical/OG、404、筛选空状态、外链 `rel="noopener"`、Lighthouse 核验

未来里程碑（非本次）：Bangumi API 接入 —— 只改 `lib/anime.ts` + loader，pages 不动。

## Open Questions

- Bangumi API 具体字段（`collection.status` 枚举、`rating` 结构）在真正集成阶段需二次核对；本轮仅为 schema 设计提供蓝本
- 内容规模拐点（何时需要 Pagefind 全文搜索）取决于实际增长，属日后阶段性研究点

## Sources

- npm registry（2026-07-14 实时）—— Astro 7.0.9、Tailwind v4.3.2、@astrojs/mdx 7.0.3、@astrojs/preact 6.0.1 等版本核实 —— HIGH
- Context7 `/withastro/docs` —— Content Layer、astro:assets、Tailwind v4 集成、islands 指令 —— HIGH
- Directory/tracker 站点功能惯例、岛屿框架选型 —— 领域经验判断 —— MEDIUM

---
*Research synthesized: 2026-07-14*
