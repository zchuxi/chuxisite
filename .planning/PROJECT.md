# 二次元个人网站（工具库 + 追番记录）

## What This Is

一个二次元风格的个人网站，用来记录和展示两类内容：好用的**软件/网站工具**，以及**追番记录**。以自己整理、回顾为主，但做成公开可访问，顺便让感兴趣的人也能看到。内容通过修改文件 + git 部署维护，无后台、无数据库。

## Core Value

工具库要好用——能清晰地分类、浏览、快速找到之前记录的工具，并为每个工具保留可长可短的图文说明。这是即使其他一切都不做也必须成立的部分。

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 工具库：以卡片列表/网格浏览工具，每个工具带链接、一句话描述、标签
- [ ] 工具库：每个工具有独立详情页，支持可长可短的图文内容（使用心得、截图、优缺点）
- [ ] 工具库：支持按分类/标签筛选与浏览
- [ ] 追番记录：记录番剧的状态（在看 / 看完 / 想看）
- [ ] 追番记录：为番剧评分、记录观看进度、写短评
- [ ] 追番记录：番剧封面、名称、集数等信息先手动录入
- [ ] 全站：鲜艳可爱型二次元视觉风格
- [ ] 全站：亮色 / 暗色主题切换
- [ ] 内容维护：改文件（Markdown / 数据文件）+ git 提交自动部署

### Out of Scope

- 网页后台编辑 / 数据库 — 采用静态站点 + 改文件方式，最简单、无需维护服务端
- 用户系统 / 评论 / 登录 — 以自己记录为主，公开只读，v1 不需要互动功能
- 番剧数据自动拉取（Bangumi API） — v1 先手动录入把功能跑通，架构预留后续接入空间
- 移动端原生 App — Web 优先，响应式即可

## Context

- 站点性质：个人内容站，自己记录为主 + 公开只读访问
- 内容模型：工具库和追番是两个并列的核心模块，各自有列表页 + 详情/记录
- 番剧信息未来可能接入 Bangumi（番组计划）等 API 自动拉取封面与元数据，架构需为此预留空间
- 二次元风格是用户从一开始就强调的重点，视觉氛围与内容同等重要

## Constraints

- **Tech stack**: Astro + Tailwind CSS — Astro 的 Content Collections 契合「Markdown + 改文件」的内容维护方式，交互部分（追番、筛选、主题切换）用 Astro Islands 嵌入组件；构建为快速静态站点
- **部署**: Vercel / Netlify — git 推送自动构建部署，零配置
- **内容维护**: 无后台、无数据库，内容以文件形式提交到 git
- **可扩展性**: 番剧数据层需预留接入外部 API（Bangumi）的空间，不能把手动录入写死到无法迁移

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 采用 Astro + Tailwind CSS | 内容型静态站主流最优解，契合改文件维护，好维护、教程多，交互处可嵌组件 | — Pending |
| 静态站点 + 改文件维护（无后台/无数据库） | 用户明确选择最简单方式，降低维护成本 | — Pending |
| 部署到 Vercel / Netlify | 免费、git 推送自动部署 | — Pending |
| 番剧先手动录入，架构预留 API 接入 | v1 先跑通功能，避免过早引入外部依赖 | — Pending |
| 鲜艳可爱型二次元风格 + 亮/暗主题切换 | 用户明确的视觉定位 | — Pending |
| 工具库为核心优先级高于追番 | 用户选择「只能先做好一块就选工具库」 | — Pending |

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
*Last updated: 2026-07-14 after initialization*
