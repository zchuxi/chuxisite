# Roadmap: 二次元个人网站（工具库 + 追番记录）

**Created:** 2026-07-14
**Granularity:** coarse
**Mode:** mvp（垂直 MVP，每阶段交付端到端可用能力）
**Core Value:** 工具库要好用——能清晰地分类、浏览、快速找到之前记录的工具，并为每个工具保留可长可短的图文说明

## Phases

- [x] **Phase 1: 站点地基与二次元外壳** - 部署上线、可切主题、响应式、可收录的二次元风格站点首页 (completed 2026-07-15)
- [ ] **Phase 2: 工具库（核心）** - 卡片浏览 + 图文详情 + 分类/标签筛选 + 安全外链，核心价值成立
- [ ] **Phase 3: 追番记录** - 番剧列表 + 状态筛选 + 评分/进度/短评/详情，数据层预留 Bangumi 接入

## Phase Details

### Phase 1: 站点地基与二次元外壳
**Goal:** 访客能打开一个已部署上线、鲜艳可爱二次元风格、响应式、可切换亮/暗主题的站点首页，从首页进入工具库/追番两大模块入口，且站点可被搜索引擎收录
**Mode:** mvp
**Depends on:** Nothing (first phase)
**Requirements:** INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06, INFRA-07
**Success Criteria** (what must be TRUE):
  1. 访客访问部署后的站点，看到鲜艳可爱二次元风格的首页，含站点简介与工具库 / 追番两个模块入口
  2. 访客可切换亮色 / 暗色主题，刷新或重开后保留选择，且首屏加载无主题闪烁（FOUC）
  3. 访客在手机与桌面浏览器均能正常浏览，布局响应式无错位
  4. 维护者新增 / 修改 Markdown 内容文件并 git 提交后，站点自动构建部署更新，内容经类型安全 schema（工具 + 番剧分层字段）校验
  5. 搜索引擎可抓取站点生成的 sitemap.xml，且每个页面输出 title / description / Open Graph meta
**Plans**: 3 plans (02-01..02-03)
  Plan Summary:
  - 02-01: 数据层扩展（tags transform + lib 读取函数 + seed 同步）
  - 02-02: 组件卡双层链接（EntryCard 改造 + 5 个档案组件 + prose）
  - 02-03: 四张工具库页面 + build 验证推送
**UI hint**: yes

### Phase 2: 工具库（核心）
**Goal:** 访客能以卡片网格浏览所有工具、进入图文详情页、按分类与标签筛选浏览，并安全跳转外链——项目核心价值端到端成立
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** TOOL-01, TOOL-02, TOOL-03, TOOL-04, TOOL-05
**Success Criteria** (what must be TRUE):
  1. 访客以卡片网格 / 列表形式浏览全部工具，每张卡片显示名称、一句话描述、外链、标签
  2. 访客点击工具进入独立详情页，查看可长可短的图文内容（使用心得、截图、优缺点）
  3. 访客可进入分类页与标签页，页面仅列出该分类 / 标签下的工具
  4. 访客点击工具外链在新标签页打开，且链接带 `rel="noopener noreferrer"`
**Plans**: 3 plans (02-01..02-03)
  Plan Summary:
  - 02-01: 数据层扩展（tags transform + lib 读取函数 + seed 同步）
  - 02-02: 组件卡双层链接（EntryCard 改造 + 5 个档案组件 + prose）
  - 02-03: 四张工具库页面 + build 验证推送
**UI hint**: yes

### Phase 3: 追番记录
**Goal:** 访客能浏览追番列表、按观看状态筛选、查看每部番剧的评分 / 进度 / 短评与完整详情；番剧数据手动录入且数据层分层设计，为日后接入 Bangumi API 预留空间
**Mode:** mvp
**Depends on:** Phase 1（与工具库并列独立，排在其后交付）
**Requirements:** ANIME-01, ANIME-02, ANIME-03, ANIME-04, ANIME-05
**Success Criteria** (what must be TRUE):
  1. 访客浏览追番列表，每部番剧以封面卡片显示名称、集数、评分、状态
  2. 访客可按观看状态（在看 / 看完 / 想看）筛选番剧列表
  3. 访客进入番剧详情页，查看完整信息、评分、观看进度（看到第 N 话 / 共 M 话）与短评
  4. 维护者以手动录入方式新增番剧封面与元数据，数据层按「客观元数据组 + 追番状态组」分层（含 bgmId 等预留字段），日后接 Bangumi API 无需重写页面
**Plans**: 3 plans (02-01..02-03)
  Plan Summary:
  - 02-01: 数据层扩展（tags transform + lib 读取函数 + seed 同步）
  - 02-02: 组件卡双层链接（EntryCard 改造 + 5 个档案组件 + prose）
  - 02-03: 四张工具库页面 + build 验证推送
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. 站点地基与二次元外壳 | 3/3 | Complete   | 2026-07-15 |
| 2. 工具库（核心） | 0/? | Not started | - |
| 3. 追番记录 | 0/? | Not started | - |

## Coverage

- v1 requirements: 17 total
- Mapped to phases: 17/17 ✓
- Orphaned: 0

---
*Roadmap created: 2026-07-14*
