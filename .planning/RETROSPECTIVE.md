# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into
future planning. Kept short — only what future-me will actually read.*

## Milestone: v1.0 — 站点地基与基础框架

**Shipped:** 2026-07-16
**Phases:** 3 (1-foundation-shell, 2-toolkit-core, 3-anime-tracker)
**Plans:** 9 | **Tasks:** ~15 (跨 phase 切分) | **Build:** 13 pages + sitemap, exit 0
**Requirements:** 17/17 v1 validated
**Actual code live:** https://chuxisite.vercel.app

### What Was Built

- Astro 7 + Tailwind v4 静态站脚手架（output: static，免适配器 Vercel）
- tools/anime 双集合分层 Zod schema（bgmId 预留 Bangumi 迁移路径）
- 二次元视觉壳 + 亮/暗双主题 + 防 FOUC
- 工具库核心 4 页面 + 组件链（EntryCard 双层链接、Breadcrumb、EmptyState、PillRow、TagCloud、ToolDetailNav、.prose）
- 追番记录 3 页面 + 组件链（StatusPill、RatingStar、AnimeCard、AnimeDetailHero）
- 2 条 seed 数据（raycast.mdx, frieren.mdx）跑通真实构建

### What Worked

- **roadmap.analyze + 真实 build 作为"完成"硬证据**：不凭 checkbox 落地，`npm run build` 输出 13 个页面才算数。这个习惯在 Phase 2/3 checkbox 落后 disk 状态时，防止了误判。
- **lib/*.ts 收口读取 + schema 分层**：Phase 1 定下的数据读取收口（getAllTools/getAllAnime）+ anime schema 客观元数据/追番状态二组分层，让 Phase 3 追番阶段零架构改动直接接上去。
- **双层链接用 article.relative + 绝对定位外链**：零嵌套 `<a>`，无障碍 + TOOL-05 一次通过 code review。
- **GSD 阶段嵌套 phases/{N}-{slug}/{NN}-SUMMARY.md**：每 plan 一份 summary 把「为什么做」留下，对后续复盘极有用。
- **Astro 7 + Tailwind v4 (@tailwindcss/vite) 栈成熟**：升级没踩到 CSS-first @theme 迁移坑，build 快（~2.2s）。

### What Was Inefficient

- **README/STATE 没同步 Phase 2/3 实际进度**：Phase 2/3 的 SUMMARY 都跑完了 checkbox 没勾、STATE 的 Performance Metrics 一直停 0/3 0/17。让 milestone 归档阶段花了额外一轮核实。**→ 改进：每完成一个 plan 顺手更新 ROADMAP checkbox 和 STATE Metrics**。
- **gsd-sdk milestone.complete CLI 没把完成态写进归档文件**：生成的 milestones/v1.0-ROADMAP.md 和 v1.0-REQUIREMENTS.md 仍是旧拷贝（Phase 2/3 Not started、需求全 Pending），MILESTONES.md 末尾有 `- Status:` 残片。**→ 改进：归档 CLI 产物必须 spot-check，不能盲信**。
- **代理抖动导致部署落后于本地提交**：本地 commit 经常领先 origin，Vercel 没部署到最新。STATE 留了「临时 blocker」但一直没清。**→ 改进：每完成一个阶段 push 一次，或在归档前强制一次 push**。
- **code review 假阳性**：Phase 2 的 CJK decode 路径被标 HIGH，其实是误判；兜底用了 review status frontmatter。代价不高但消耗 review 轮次。

### Patterns Established

- **数据读取 100% 收口 lib/*.ts，禁止页面直接 getCollection()**
- **番剧 schema 双组分层（客观元数据 + 追番状态），读取/UI 直接消费两组**
- **EntryCard / AnimeCard 整卡单 `<a>` + 侧出绝对定位外链**（避免嵌套 a）
- **每 plan SUMMARY 留 frontmatter（phase/tags/stack-tech）+ Dependency graph + Acceptance matrix**，既为 GSD 流程也为后续复盘
- **.prose hand-rolled 而非第三方插件**（零新增依赖，够用优先）
- **theme 走 <head> is:inline 阻塞脚本防 FOUC，localStorage 记忆**
- **build 出场是完成硬证据**：1 个页面没生成就不算 shipped

### Key Lessons

1. 完成 = build 产物存在 + 验收 criteria 全亮，不是 SUMMARY 写了就算。
2. GSD CLI 归档产物默认 spot-check；没写过完成态的字段要自己填。
3. 数据读取收口 + schema 分层要**在 Phase 1 就落地**；02-01 与 03-01 才没返工。
4. 每阶段 push 一次 origin，把「本地领先部署」视为 pending blocker，在阶段结束时清掉。
5. ROADMAP checkbox / STATE Metrics 顺手更新，别攒到归档阶段再回头对账。
6. 二次元风格 + 双主题是用户第一优先级，在 Phase 1 不是附属项。

### Cost Observations

- 栈：零新增后期依赖（Tailwind/ astro/mdx 早就在 package.json 里）
- 踩坑成本：FOUC、代理抖动、code-review 假阳性，合计约半个人天
- 重复工作：归档阶段重写 CLI 产物 + STATE/Metrics，合计约 20 分钟

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 3 | 9 | 建立了 schema 分层 + lib 收口 + build 出场 三项习惯 |

### Cumulative Quality

| Milestone | Build | Pages | Req Coverage | Zero-Dep Additions |
|-----------|-------|-------|--------------|--------------------|
| v1.0 | exit 0, 2.2s | 13 | 17/17 v1 ✓ | ✓ (hand-rolled prose 取代第三方) |

### Top Lessons (Verified Across Milestones)

1. 数据读取收口 + schema 双组分层要在 Phase 1 落地
2. 完成 = build 出场，不是 SUMMARY/checkbox

---

*First retrospective entry: 2026-07-16 (v1.0)*
