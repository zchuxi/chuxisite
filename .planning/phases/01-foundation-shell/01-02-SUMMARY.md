---
phase: 01-foundation-shell
plan: 02
subsystem: ui-shell
tags: [astro, tailwind-v4, theme-token, font-subset, pyftsubset, astro-icon, responsive, a11y, hero, landing]

# Dependency graph
requires:
  - 01-01（脚手架 + @theme 基线 + BaseLayout 防 FOUC + ThemeToggle + lib 数据层 + 种子）
provides:
  - 二次元视觉外壳组件（Header/Footer/ThemeToggle + deco/{Star,Heart,Divider,Blob}）
  - 首页落地页（Hero 标语+双CTA+插画占位 / IntroBlock 简介 / 2× 整卡入口 EntryCard → /tools /anime）
  - ZCOOL KuaiLe 站点用字子集（public/fonts/zcool-subset.woff2, 4.3KB）+ @font-face
  - BaseLayout fullTitle 覆盖 seam（供 01-03 SEO 沿用）；组件供 01-03 占位页/404 复用
affects: [01-03, 工具库-phase2, 追番-phase3]

# Tech tracking
tech-stack:
  added: []          # 零新增 npm 运行时依赖（仅构建期用 python brotli 生成字体子集）
  patterns:
    - "装饰 SVG 组件：aria-hidden + pointer-events-none + currentColor（父级用 text-[var(--color-deco-pink)] 上色）"
    - "半透明表面用 color-mix(in oklab, var(--color-surface) N%, transparent) 让 backdrop-blur 可见"
    - "hover/浮动动效用 Tailwind motion-safe: 变体（编译为 prefers-reduced-motion:no-preference guard），无需手写 @media"
    - "font-display 令牌 Fredoka→ZCOOL 子集：拉丁由 Fredoka 渲染、CJK 落子集、缺字回退系统栈"
    - "CJK 字体子集：fontsource 只发 unicode-range 分片时，合并命中分片→pyftsubset 到用字→woff2"

key-files:
  created:
    - public/fonts/zcool-subset.woff2
    - src/components/Header.astro
    - src/components/Footer.astro
    - src/components/Hero.astro
    - src/components/IntroBlock.astro
    - src/components/EntryCard.astro
    - src/components/deco/Star.astro
    - src/components/deco/Heart.astro
    - src/components/deco/Divider.astro
    - src/components/deco/Blob.astro
  modified:
    - src/styles/global.css
    - src/components/ThemeToggle.astro
    - src/layouts/BaseLayout.astro
    - src/pages/index.astro

key-decisions:
  - "ZCOOL 子集经『合并命中分片 + pyftsubset』生成（包内无完整 TTF，仅 188 个 unicode-range 分片）；4.3KB，满足 P5 无 >1MB 请求"
  - "Header 半透明表面用 color-mix(oklab) 实现，backdrop-blur 才可见（纯 bg-surface 不透明则 blur 无效）"
  - "hover 上浮/箭头位移/漂浮统一用 Tailwind motion-safe: 变体收敛无障碍 guard，而非逐处手写 @media"
  - "BaseLayout 加可选 fullTitle 覆盖：首页标题需站名在前（初曦的窝 · …），D-02 的 {title}·初曦的窝 后缀模式产不出，additive 且向后兼容"
  - "保持原生 <script> 主题切换，不引入 preact/nanostores（本阶段零有状态岛屿，遵守栈约束）"

requirements-completed: [INFRA-03, INFRA-05, INFRA-07]

# Metrics
duration: ~3h（含 429 中断恢复）
completed: 2026-07-15
---

# Phase 01 Plan 02: 二次元视觉外壳与首页落地页 Summary

**在 01-01 地基上落成鲜艳可爱二次元外壳与首页：Tailwind v4 @theme 令牌驱动的 Header/Footer/装饰 SVG，Hero（标语「工具、番剧、和一点点生活」+ 双 CTA + 青粉插画占位）+ IntroBlock + 2× 整卡入口，全站响应式、无障碍、亮/暗双主题，标题走 4.3KB ZCOOL 子集**

## Performance

- **Started:** 2026-07-15T07:00:55Z
- **Completed:** 2026-07-15
- **Tasks:** 4（全自动，无 checkpoint）
- **Files created/modified:** 14（10 created + 4 modified）

## Accomplishments
- Task 1：ZCOOL KuaiLe 站点用字子集（合并 fontsource 命中分片 → pyftsubset → 4.3KB woff2）+ @font-face 接入 global.css；亮/暗 @theme 令牌与暗色 :where(.dark) 覆盖（01-01 已建，本计划补齐 CJK 标题字）
- Task 2：Header（sticky + backdrop-blur + border，Logo + Star 点缀 + 导航 /tools /anime ≥44px 命中 + pathname 激活态 + ThemeToggle）、Footer（软萌签名 + 手绘 Divider）、deco/{Star,Heart,Divider}（aria-hidden + pointer-events-none）；ThemeToggle 保留原生切换 + 加 accent hover
- Task 3：Hero（lg 两栏、clamp(32–52px) display 标语 D-03、主 CTA 进入工具库→/tools + 次 CTA 查看追番→/anime、低透明青粉渐变背景 + 漂浮星点）、deco/Blob（固定 4/3 比例 CLS≈0、青粉渐变、浮动星星/爱心、reduced-motion 静止）、IntroBlock（居中简介）
- Task 4：EntryCard（整卡 <a>、图标圆底 + display 标题 + UI-SPEC 逐字描述 + 箭头、radius-xl + shadow-soft、motion-safe hover 上浮、emphasis 变体、可选 count 徽章）+ index 组装（Header→Hero→IntroBlock→2×EntryCard→Footer，经 getAllTools/getAllAnime 读种子计数，1 列→md 2 列 gap 32px）

## Task Commits

1. **Task 1: ZCOOL 子集 @font-face + 字体文件** - `719f59e` (feat)
2. **Task 2: Header/Footer/ThemeToggle + 装饰 SVG** - `062cfa9` (feat)
3. **Task 3: Hero/IntroBlock/Blob（+ 子集补标点）** - `623186c` (feat)
4. **Task 4: EntryCard + 首页组装 + BaseLayout fullTitle** - `8fef3f1` (feat)

## Decisions Made
- **ZCOOL 子集靠合并分片**：`@fontsource/zcool-kuaile` 只发 188 个 unicode-range 分片（无完整 TTF），故读各分片 cmap → 合并命中目标字符的 12/93 个分片 → pyftsubset 到站点用字（含标点）→ 4.3KB woff2，满足 P5
- **backdrop-blur 需半透明底**：Header 用 `color-mix(in oklab, var(--color-surface) 82%, transparent)`，否则不透明 surface 让 blur 无效
- **无障碍动效收敛到 motion-safe:**：hover 上浮 / 箭头位移 / 漂浮全用 Tailwind `motion-safe:` 变体（= `@media (prefers-reduced-motion: no-preference)`），比逐处手写 @media 更省且齐整
- **fullTitle 覆盖 seam**：首页要站名在前的整串标题，D-02 后缀模式产不出，故 BaseLayout 加可选 `fullTitle`（additive）；01-03 SEO 可沿用
- **零有状态岛屿**：主题切换维持原生 `<script>`，未引入 preact/nanostores（遵守 CLAUDE.md 栈约束与 P8）

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 移除 BaseLayout 硬编码 footer**
- **Found during:** Task 2（建 Footer.astro + Task 4 slot 内组装 Footer）
- **Issue:** BaseLayout body 内已有硬编码 `<footer>`，页面再放 Footer 组件 → 双 footer
- **Fix:** 删 BaseLayout 内联 footer，仅留 `<slot/>`；Footer 组件成为唯一来源，供 01-03 占位页/404 复用。`<head>` 与 is:inline 防 FOUC 脚本完全未动
- **Files modified:** src/layouts/BaseLayout.astro
- **Commit:** 062cfa9

**2. [Rule 3 - Blocking] BaseLayout 加可选 fullTitle 覆盖**
- **Found during:** Task 4（首页标题验收）
- **Issue:** 验收要 `<title>` = 「初曦的窝 · 工具、番剧、和一点点生活」（站名在前），BaseLayout 的 `{title} · 初曦的窝` 后缀模式无法产出
- **Fix:** 加可选 `fullTitle` prop，提供时逐字覆盖，否则维持原后缀逻辑（向后兼容，不碰 head SEO——留给 01-03）
- **Files modified:** src/layouts/BaseLayout.astro
- **Commit:** 8fef3f1（Task 4）

**3. [Rule 3 - Tooling] 安装 python brotli（构建期字体工具依赖）**
- **Found during:** Task 1（子集化）
- **Issue:** fonttools 读/写 woff2 需 brotli 扩展，本机缺失
- **Fix:** `pip install brotli`（Google 知名包，计划已预授权「pip install fonttools brotli」）。非应用运行时依赖、不入 package.json
- **Commit:** 719f59e（产物 woff2）

**4. [Rule 2 - 数据管道] EntryCard 加可选 badge + 首页展示收录数**
- **Found during:** Task 4
- **Issue:** 成功标准要求首页经 getAllTools/getAllAnime 读种子（非直接 getCollection），但 UI-SPEC 固定了两卡描述文案，计数无处落
- **Fix:** EntryCard 加可选 `badge` prop（不动固定描述），首页传 `${tools.length} 个工具` / `${anime.length} 部番剧`，真实练通 lib→schema→页面 管道
- **Files modified:** src/components/EntryCard.astro, src/pages/index.astro
- **Commit:** 8fef3f1（Task 4）

---

**Total deviations:** 4 auto-fixed（2 blocking 结构修正 + 1 构建工具 + 1 数据管道增强）。均为正确性/验收所必需，无 scope creep；未新增任何运行时 npm 依赖。

## Known Placeholders（有意，非缺陷）
- **Hero 插画走 deco/Blob 占位**：UI-SPEC 明确「用户后补插画，需优雅占位」。Blob 固定 4/3 比例 + 青粉渐变 + 浮动星心，切真图 CLS≈0。非 stub，是规格内的优雅回退。
- **/tools、/anime 路由本计划未建**：首页 CTA 与两入口卡按 D-07/D-08 指向这两条路由，其「带空状态的可导航占位页」是 01-03 的交付物。本计划只负责链接指向，属既定跨计划次序，非本计划遗漏。

## Verification Results
- `npm run build` 退出 0，`npx astro check` 17 文件 0 errors 0 warnings（2 hints 为 01-01 content.config.ts 的 `z.string().url()` 弃用提示，属既有、越界不改）
- dist/index.html 逐字命中：Hero 标语、主/次 CTA href /tools /anime、2× EntryCard 标题与 UI-SPEC 逐字描述、ThemeToggle aria-label、IntroBlock 标题、首页 `<title>`；徽章证 lib 管道通
- 装饰无障碍：aria-hidden ×15、pointer-events-none ×4（Hero 背景 + 2 星点 + Blob）
- 字体：ZCOOL 子集 4308B 已进 CSS bundle + 复制到 dist/fonts/；dist 内无任何 >1MB woff2（最大 Fredoka-latin 29KB）——P5 达成
- 响应式：所有容器 max-w-[72rem] + px-4 md:px-6 统一，入口卡 grid-cols-1 md:grid-cols-2，Hero overflow-hidden 裁装饰，结构层面无横向溢出（无浏览器目视——headless 执行环境）

## Self-Check: PASSED

- **创建文件**：11/11 FOUND（经 Glob 核实）—— public/fonts/zcool-subset.woff2、Header/Footer/Hero/IntroBlock/EntryCard、deco/{Star,Heart,Divider,Blob}、01-02-SUMMARY.md
- **已提交哈希（全部独立原子提交）**：`719f59e`(T1)、`062cfa9`(T2)、`623186c`(T3)、`8fef3f1`(T4)
- **T4 代码提交在工作区就绪后**因代理被 429（Service Unavailable）终止而未提交；编排器恢复后独立验证 build 绿 + dist 逐字命中验收标准，随后补做了 T4 代码提交（8fef3f1）并回填本 SUMMARY
- **独立验证结果**：`npm run build` 退出 0，`npx astro check` 0 errors 0 warnings；dist 逐字命中标语/双 CTA href/两入口卡/title/a11y；无 >1MB 字体（最大 29KB）
