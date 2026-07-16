# Roadmap: 二次元个人网站（工具库 + 追番记录）

**Created:** 2026-07-14
**Last shipped:** 2026-07-16 (v1.0)
**Current Milestone:** v1.1 内容编辑 UI
**Granularity:** coarse
**Mode:** mvp（垂直 MVP，每阶段交付端到端可用能力）
**Core Value:** 工具库要好用——能清晰地分类、浏览、快速找到之前记录的工具，并为每个工具保留可长可短的图文说明
**v1.1 Editing Value:** 维护内容应像浏览内容一样简单——在站内编辑、导出 JSON、放进 content/、git push，链路不断。

## Milestones

- ✅ **v1.0 站点地基与基础框架** — Phases 1-3 (shipped 2026-07-16)
- 📋 **v1.1 内容编辑 UI** — Phases 4-7 (in progress)

## Phases

<details>
<summary>✅ v1.0 站点地基与基础框架 (Phases 1-3) — SHIPPED 2026-07-16</summary>

- [x] Phase 1: 站点地基与二次元外壳 (3/3 plans) — completed 2026-07-15
- [x] Phase 2: 工具库（核心） (3/3 plans) — completed 2026-07-15
- [x] Phase 3: 追番记录 (3/3 plans) — completed 2026-07-16

归档详情见 `.planning/milestones/v1.0-ROADMAP.md`

</details>

### v1.1 — 内容编辑 UI

- [x] **Phase 4: Admin 外壳 + 密码守卫 + 条目浏览器** — 隐藏路由、前端密码门禁、经 lib/*.ts 加载现有条目列表供选择 (completed 2026-07-16)
- [ ] **Phase 5: 编辑已有条目（追番 + 工具）** — 表单回填、校验、状态/进度/评分/短评/封面、名称/描述/链接/标签/分类/正文
- [ ] **Phase 6: 新增条目 + frontmatter 生成** — 追番/新工具表单、必填校验、slug 派生、Zod schema 对齐的 frontmatter 自动产出
- [ ] **Phase 7: JSON 导出 + 端到端验证** — schema 兼容 JSON 下载、放进 src/content/ 后 git → Vercel 链路不断

## Phase Details

### Phase 4: Admin 外壳 + 密码守卫 + 条目浏览器 (v1.1)

**Goal:** 维护者访问隐藏路由后，经密码门禁进入编辑工作台；工作台经 lib/*.ts 加载并展示全部追番与工具条目，支持按类型筛选、按关键词快速定位、点击进入编辑
**Depends on:** Phase 3
**Requirements:** EDIT-01, EDIT-02
**Success Criteria:**
1. 访客访问 `/admin`（或其他隐藏路径）仅见密码输入框，无任何编辑 UI 或内容数据泄漏
2. 输入正确密码后进入工作台，工作台顶部可切换「追番 / 工具」两个条目类型
3. 密码错误留在入口页并提示，不进入工作台
4. 工作台列表完整显示现有条目（经 `getAllAnime()` / `getAllTools()` 收口读取），并展示标题/封面缩略图等识别信息
**Plans**: TBD
**UI hint**: yes

### Phase 5: 编辑已有条目 (v1.1)

**Goal:** 维护者在工作台选中某条后，进入编辑表单，回填当前字段、允许修改、即时校验；编辑结果暂存于客户端状态
**Depends on:** Phase 4
**Requirements:** EDIT-03, EDIT-04
**Success Criteria:**
1. 选中追番条目后表单回填 status/progress/myRating/comment/cover，status 限 enum(watching/done/plan)，rating 限 0-10
2. 选中工具条目后表单回填 title/url/summary/tags/category/cover/body，tags 为可增删数组
3. 编辑中修改即时校验（非法值高亮且不允许保存），保存后工作台列表反映最新值
**Plans**: TBD
**UI hint**: yes

### Phase 6: 新增条目 + frontmatter 生成 (v1.1)

**Goal:** 维护者在工作台选择「新增追番」或「新增工具」，填写表单并校验；提交后自动生成与 `content.config.ts` Zod schema 对齐的 frontmatter 字符串，slug 由标题派生
**Depends on:** Phase 5
**Requirements:** EDIT-05, EDIT-06, EDIT-07
**Success Criteria:**
1. 新追番表单：titleCn 与 status 必填；episodes/myRating 可选；myRating 越界或缺失给出明确错误
2. 新工具表单：title 与 category 必填；url/summary/tags/cover/body 可选
3. 提交后自动生成 frontmatter 字符串，字段名/类型/默认值与 Zod schema 完全一致（status enum、progress default 0、tags 小写去重等）
4. slug 由 `slugOf(titleCn)` 派生，保证与现有条目不冲突提示
**Plans**: TBD
**UI hint**: yes

### Phase 7: JSON 导出 + 端到端验证 (v1.1)

**Goal:** 编辑/新增结果可下载为 schema 兼容的 JSON 文件；下载后放进 `src/content/anime/` 或 `src/content/tools/`，经 git push 触发 Vercel 构建并成功
**Depends on:** Phase 6
**Requirements:** EDIT-08
**Success Criteria:**
1. 导出按钮下载 .json 文件，结构完全匹配 `content.config.ts` Zod schema（字段名、类型、可选/必填、默认值）
2. 下载的 CSV/JSON 放进 content/ 目录后，`astro check` / `npm run build` 无 schema 错误
3. 导出链路端到端跑通：编辑 → 导出 → 放 content/ → git commit → push → Vercel 构建 exit 0
4. MDX 导出的 body 字段能正确序列化（工具 MDX body 保留原格式）
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. 站点地基与二次元外壳 | v1.0 | 3/3 | Complete | 2026-07-15 |
| 2. 工具库（核心） | v1.0 | 3/3 | Complete | 2026-07-15 |
| 3. 追番记录 | v1.0 | 3/3 | Complete | 2026-07-16 |
| 4. Admin 外壳 + 密码守卫 + 条目浏览器 | v1.1 | 1/1 | Complete   | 2026-07-16 |
| 5. 编辑已有条目 | v1.1 | 0/? | Not started | - |
| 6. 新增条目 + frontmatter 生成 | v1.1 | 0/? | Not started | - |
| 7. JSON 导出 + 端到端验证 | v1.1 | 0/? | Not started | - |

## Coverage

- v1.0 requirements: 17 total, 17/17 validated ✓
- v1.1 requirements: 8 total, 8/8 mapped ✓
  - EDIT-01 → Phase 4
  - EDIT-02 → Phase 4
  - EDIT-03 → Phase 5
  - EDIT-04 → Phase 5
  - EDIT-05 → Phase 6
  - EDIT-06 → Phase 6
  - EDIT-07 → Phase 6
  - EDIT-08 → Phase 7
- Orphaned: 0
- v1.2+ requirements: 已确认但推迟（SEARCH / FEED / STAT / API 详见 REQUIREMENTS.md）

---
*Roadmap created: 2026-07-14*
*Last updated: 2026-07-16 — v1.1 内容编辑 UI roadmap defined (Phases 4-7)*
