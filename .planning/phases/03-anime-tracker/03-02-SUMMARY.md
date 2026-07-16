---
summary: "追番卡片 + 列表主页交付 — AnimeCard/StatusPill/RatingStar 组件以及真实 /anime 列表页"
sections: ["Components", "Pages"]
related_plans: ["03-01"]
requirements: ["ANIME-01", "ANIME-02", "ANIME-04"]
completed_tasks: 4/4
wave: 2
---

## 03-02 — AnimeCard / StatusPill / RatingStar + 追番列表主页

### 交付内容

| 文件 | 类型 | 说明 |
|------|------|------|
| `src/components/StatusPill.astro` | 新建 | watching/done/plan 三色小标签，color-mix 染底，纯视觉不可点 |
| `src/components/RatingStar.astro` | 新建 | 卡片上精简数字 `★ N/10`（star-fill icon + rating-num），aria-hidden |
| `src/components/AnimeCard.astro` | 新建 | 整卡可点单 `<a>` + 封面/信息区/进度 + Sibling StatusPill（absolute，pointer-events:none）+ Blob 占位（无 cover） |
| `src/pages/anime/index.astro` | 重写 | 真实列表网格（1→2→3 列）+ PillRow + summary line + EmptyState 空状态 |

### 关键决策

- **整卡单 `<a>`**：Title/封面/StatusPill/评分/进度均由一个 `<a href={href}>` 包裹，命中区 = 整卡。
- **StatusPill 兄弟定位**：仿 EntryCard 外链按钮方案 — AnimeCard 中 StatusPill 为 `<a>` 的兄弟绝对定位（`absolute right-2 top-2 z-10` + `pointer-events:none` 透传到 `<a>`），避免嵌套锚点冒泡。
- **Blob 占位复用**（ponytail）：不引入新 `<Blob>` 文件，在 AnimeCard 内联最小渐变 + 浮动星/心（deco/Star + deco/Heart，含 `floaty-*` 动画与 reduced-motion 守卫），aspect-[2/3] 保 CLS≈0。封面 alt 走 `{titleCn} 番剧封面`，占位 aria-hidden。
- **RatingStar 精简数字**（D-08 卡片部分）：卡片上 `★ 9/10` 而非 5 独立 icon（5 star 仅留 03-03 AnimeDetailHero）。
- **myRating 守卫**：`value > 0` 才渲染 RatingStar，避免展示 `0/10`。
- **直接 `getAllAnime()` 在 frontmatter 调用**（ponytail）：无动态 params 的列表页不走 `getStaticPaths`，简化为 Phase 2 `tools/index.astro` 模式 — prerender 时 Astro 不向无 props 的 page 模块注入 props，避免 `items` undefined 错误。
- **进度文案三态**（Copywriting 锁定）：plan → `全 {N} 话 · 待补`；episodes 有 → `看到 {progress} / 共 {episodes} 话`；否则 → `已看 {progress} 话`。

### 验证结果

| 项 | 状态 |
|----|------|
| `npm run build` exit 0 | ✅ 9 pages built |
| `npx astro check` 0 errors / 0 warnings | ✅ |
| AnimeCard 含 `aspect-[2/3]` | ✅ |
| AnimeCard aria-label（titleCn + 状态 + 评分） | ✅ `葬送的芙莉莲，状态 做完，评分 9/10` |
| StatusPill sibling absolute right-2 top-2 z-10 | ✅ |
| cover 缺失触发 Blob 占位（青粉渐变 + 浮动星心） | ✅ |
| 列表 summary line 精确 | ✅ `共 1 部 · 慢补番中～` |
| PillRow `aria-current="page"` 在「全部」 | ✅ |
| EmptyState 空数据分支（frieren 未删除，仅 tested 非空路径） | ✅ |

### Commits

1. `feat(03-02): add StatusPill component (watching/done/plan, color-mix染底)`
2. `feat(03-02): add RatingStar (compact N/10, aria-hidden for card a11y)`
3. `feat(03-02): add AnimeCard (cover+title+StatusPill+rating+progress, sibling-pill, Blob placeholder)`
4. `feat(03-02): replace /anime placeholder with real list page (grid + PillRow + summary + EmptyState); drop unused Icon import from AnimeCard`

### notes

- AnimeCard 不引入 preact（纯 CSS hover/focus-visible），符合 Phase 3 零岛屿目标。
- 数据访问全部经 `lib/anime.ts getAllAnime()/slugOf()`（grep 页面无 `getCollection`）。
- v2 筛选页（`/anime/status/:status`）、详情页（`/anime/[slug]`）计划在 03-03 承接；本 plan 仅交付列表主页及其卡片/标签/评分三个组件。
