# Pitfalls Research

**Domain:** 二次元风格个人内容站（Astro 6 + Tailwind v4 静态站点，工具库 + 追番记录）
**Researched:** 2026-07-14
**Confidence:** HIGH（Astro 6.x / Tailwind v4 关键 API 已通过 Context7 官方文档核实；部分性能阈值为经验判断，标注 MEDIUM）

## Critical Pitfalls

### Pitfall 1: 番剧数据层写死到无法迁移到 Bangumi API

**What goes wrong:**
把手动录入的番剧信息（封面 URL、名称、集数、简介）直接散落在 Markdown frontmatter 或组件里，字段名自创（如 `name` / `pic` / `eps`），没有稳定 ID。日后接入 Bangumi（番组计划）API 时发现：字段对不上、无法把手动条目和 API 条目关联、封面图从本地路径变成远程 URL 导致图片管线全改、想「部分手动 + 部分 API」时两套数据结构打架。最终只能推倒重来重录一遍。

**Why it happens:**
v1 明确「先手动录入把功能跑通」，开发者为省事按当下最顺手的方式建 schema，没有先看目标 API 的数据形状。Bangumi 的字段（`subject_id`、`name` / `name_cn`、`images.large`、`eps`、`rating`、`collection.status`）在设计期是已知的，却被推迟到集成期才对齐。

**How to avoid:**
- 设计 Content Collections schema 时**以 Bangumi subject 结构为蓝本**：给每条番剧一个 `bgmId`（可空，手动条目留空）、区分 `titleJa` / `titleCn`、`cover`（统一用一个字段，值可为本地路径或远程 URL）、`episodes`、`airDate`。
- 把「我的追番状态」（`status` 在看/看完/想看、`myRating`、`progress`、`comment`）与「番剧客观元数据」（标题、封面、集数）**在 schema 层面分成两组字段**，前者永远手动、后者未来可被 API 覆盖。
- 用 Zod `.optional()` 让 API 才有的字段现在可缺省，别用 `.default()` 把手动值伪装成客观值。
- 封面字段设计成「本地 import 或远程 URL 都能接受」，配套 `image.domains` 预留（见 Pitfall 4）。

**Warning signs:**
- schema 里番剧只有一个 `title` 字段（中日文混装）。
- 状态/评分和元数据字段混在同一层、无法区分谁将来会被覆盖。
- 没有任何 ID 字段，靠文件名或标题做唯一标识。

**Phase to address:**
追番记录数据层设计阶段（追番模块第一步，早于任何 UI）。

---

### Pitfall 2: Content Collections schema 与 Content Layer API 用法过时/错位

**What goes wrong:**
按旧教程把配置写在 `src/content/config.ts`、用「文件夹即集合、无 loader」的旧式定义，或 frontmatter 字段与 Zod schema 不一致导致构建时报一堆 `Invalid frontmatter`。Astro 5 起 Content Layer 是新 API：配置文件是 `src/content.config.ts`，每个集合必须显式声明 `loader`（`glob()` / `file()`）。混用新旧写法会构建失败或类型丢失。

**Why it happens:**
网上大量 Astro 3/4 时代教程仍用旧的隐式集合约定，训练数据和博客滞后。开发者复制旧代码，或不知道 `glob({ base, pattern })` 是现在的标准。

**How to avoid:**
- 用 `src/content.config.ts`，每个集合显式 `loader: glob({ base: './src/content/tools', pattern: '**/*.{md,mdx}' })`。
- 番剧若用单一 JSON/YAML 数据文件而非一文件一条，用 `file()` loader。
- schema 用 Zod 严格定义，日期用 `z.coerce.date()`，枚举（追番状态）用 `z.enum(['watching','done','plan'])` 从一开始就约束。
- 本地封面图在 schema 里用 `image()` helper（`schema: ({ image }) => z.object({ cover: image() })`），让 Astro 纳入图片优化管线并做尺寸校验。

**Warning signs:**
- 配置文件路径是 `src/content/config.ts`（旧）而非 `src/content.config.ts`。
- 集合定义里没有 `loader`。
- 构建时反复 frontmatter 校验报错，靠删字段而不是修 schema 绕过。

**Phase to address:**
项目脚手架 / 内容建模阶段（工具库落地前）。

---

### Pitfall 3: 主题切换（亮/暗）FOUC 闪白 + 水合不匹配

**What goes wrong:**
暗色模式用户刷新页面瞬间闪一下白屏（FOUC），或首屏渲染成亮色再跳成暗色。根因是主题决策放在了会延迟的地方：写在 React/Vue 岛屿的 `useEffect` 里、或用带 `client:load` 的组件才去读 `localStorage`。静态 HTML 在 hydration 之前就已经用默认（亮色）渲染出来了，等 JS 跑起来才切换，于是闪烁；SSR/静态 HTML 与客户端首次渲染不一致还会引发 hydration mismatch 警告。

**Why it happens:**
把主题当成「组件状态」而非「文档级即时决策」。Astro 默认零 JS、静态优先，开发者惯性用前端框架的状态管理思路处理主题。

**How to avoid:**
- 在 `<head>` 里放一段**阻塞式内联脚本（非 module、无 `client:` 指令）**，在页面绘制前读取 `localStorage` + `prefers-color-scheme`，同步给 `<html>` 加 `class="dark"` 或 `data-theme`。这段脚本必须内联、同步、在任何内容渲染前执行。
- Tailwind v4 暗色策略：用 `@custom-variant dark (&:where(.dark, .dark *))` 配合 `class` 策略，别依赖纯 `media` 策略（否则无法手动切换）。
- 主题切换按钮可以是岛屿，但「初始主题的应用」绝不能依赖岛屿 hydration。
- 用 `astro:after-swap` 事件在 View Transitions / 页面切换后重新应用主题，避免跳转后主题丢失。

**Warning signs:**
- 主题逻辑只存在于某个 `client:load` 组件里。
- `<head>` 中没有内联主题脚本。
- 刷新暗色页面肉眼可见闪白；控制台出现 hydration mismatch。

**Phase to address:**
基础布局 + 主题系统阶段（脚手架之后、内容模块之前）。

---

### Pitfall 4: 图片优化陷阱——大体积番剧封面/截图拖垮加载

**What goes wrong:**
- 直接 `<img src="/covers/xxx.jpg">` 放几百 KB 到几 MB 的原图，不经 `astro:assets` 优化，LCP 惨、Vercel/Netlify 带宽爆。
- 未来接 Bangumi 远程封面时，忘了配 `image.domains` / `image.remotePatterns`，构建直接报错「远程图片未授权」。
- 网格列表页几十张封面全部 `loading="eager"` 或首屏外图片未懒加载，首屏拉取一堆图。
- 给 `<Image>` 传错 `width/height` 或不传，导致 CLS 布局抖动。

**Why it happens:**
静态站「改文件」的心智让人随手丢图；`astro:assets` 的优化只对「被 import 的本地图」或「显式授权的远程图」生效，容易漏配。

**How to avoid:**
- 本地封面/截图一律走 `astro:assets` 的 `<Image>`（或 `<Picture>`），`layout='constrained'` 自动生成 `srcset` + `sizes` + `loading="lazy"`，输出 WebP/AVIF。
- 封面通过 Content Collections `image()` helper 引入，享受编译期尺寸校验和优化。
- 列表页首屏外封面保持默认 `lazy`；只有首屏 LCP 图设 `loading="eager"` + `fetchpriority="high"`。
- **提前**在 `astro.config` 配好 `image.remotePatterns`（如 `hostname: 'lain.bgm.tv'` 等 Bangumi 图床）即使 v1 还没用，为 Pitfall 1 铺路。
- 始终传显式 `width`/`height`（或用 `aspectRatio`）避免 CLS。

**Warning signs:**
- 代码里出现裸 `<img>` 指向 `public/` 大图。
- Lighthouse LCP > 2.5s、CLS > 0.1、传输的图片仍是 jpg/png 原格式。
- 接远程图时构建报 remote image 未授权。

**Phase to address:**
工具库详情页（首次出现截图）+ 追番封面阶段；远程配置在数据层设计阶段一并预留。

---

### Pitfall 5: CJK / 日文装饰字体拖慢首屏（二次元风格的隐藏成本）

**What goes wrong:**
为二次元氛围引入日文/中文装饰字体，一个 CJK 字体子集动辄 3-10MB。直接 `@font-face` 全量加载会：首屏文字长时间不可见（FOIT）或用兜底字体闪一下再换（FOUT），移动端流量爆炸，LCP 崩。装饰性花体还常牺牲正文可读性。

**Why it happens:**
拉丁字体几十 KB 的经验直接套到 CJK；用户强调「视觉氛围同等重要」，容易为风格上重字体。

**How to avoid:**
- **装饰字体只用于标题/logo/少量点缀**，正文用系统 UI 字体栈（`system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`）保证可读 + 零加载成本。
- 需要中文正文特色字体时做**字体子集化**（按站点实际用字裁剪，pyftsubset / 在线子集工具），并用 `font-display: swap` + `preload` 关键字体。
- 优先用可变字体或 woff2；能用 CSS/SVG 实现的装饰效果就别用整套字体。
- 亮/暗主题下都验证对比度（WCAG AA ≥ 4.5:1 正文），别让荧光色 + 花体牺牲可读性。

**Warning signs:**
- 网络面板出现单个 >1MB 的字体请求。
- 首屏文字延迟出现或明显字体跳变。
- 正文用了花体/手写体，小字号下难读。

**Phase to address:**
视觉风格 / 二次元样式打磨阶段（可放在核心功能之后，避免过早陷入样式细节）。

---

### Pitfall 6: Astro Islands 水合过度 / 误用（把静态页做成半个 SPA）

**What goes wrong:**
筛选、标签、主题、卡片交互全塞进 `client:load` 的 React/Vue 组件，甚至把整个列表页做成一个大岛屿。结果丢掉 Astro「零 JS 静态优先」的核心优势：包体膨胀、TTI 变差、SEO/首屏退化，还常引入 hydration mismatch。个人内容站本该几乎纯静态，却背上框架运行时。

**Why it happens:**
习惯了 React/Vue 全组件化思维，默认「交互 = 客户端组件」。不了解 Astro 的 `.astro` 组件本身能在构建期渲染静态 HTML，交互可用极少 JS 或原生实现。

**How to avoid:**
- 默认所有东西都是静态 `.astro`，只在**真正需要客户端状态**的最小叶子节点用岛屿。
- hydration 指令按需选择：`client:visible`（首屏外交互）> `client:idle` > `client:load`（尽量少用）。
- 主题切换、简单 tab、展开/折叠优先用**原生 JS + `data-*` 属性或 `<details>`**，无需框架。
- 筛选/搜索见 Pitfall 7，多数能纯静态或轻量原生 JS 完成。
- 尽量不引入 React/Vue 运行时；若只为一两个小交互，用 Astro 原生 `<script>` 或 Preact/Solid 等轻量方案。

**Warning signs:**
- 大量 `client:load`，或整页被一个岛屿包裹。
- 一个「静态」站却打包出几百 KB 框架 JS。
- 出现 hydration mismatch 警告。

**Phase to address:**
基础布局阶段定原则；工具库筛选、追番交互实现阶段严格执行。

---

### Pitfall 7: 客户端筛选/搜索的性能与架构误区

**What goes wrong:**
- 把「按分类/标签筛选」做成客户端 JS 全量渲染 + 显示/隐藏，但一开始就为「几千条」上索引库（Fuse.js / Pagefind）——个人站几十上百条内容属于过度工程。
- 反过来：筛选逻辑写死在客户端，SEO 拿不到分类页；本可用 Astro 构建期为每个标签/分类生成静态页（`getStaticPaths`）。
- 搜索直接对全文做 O(n) 线性匹配且每次 keystroke 全量重排，条目多时卡顿。

**Why it happens:**
不清楚「构建期能做的事」和「必须客户端做的事」的边界；要么过早引重型搜索方案，要么把该静态化的做成客户端。

**How to avoid:**
- **分类/标签筛选优先用构建期静态页**：`getStaticPaths` 为每个标签生成 `/tools/tag/xxx` 静态页，天然 SEO + 零运行时。
- 客户端只做「即时交互式过滤」这类锦上添花，且基于已渲染 DOM 的 `data-tags` 属性做 show/hide，数据量小无需索引。
- 全文搜索**当前规模（<几百条）先不做**或用最简 client 过滤；真需要时用 Pagefind（Astro 生态标准、构建期生成索引、按需加载）而非手写。
- 不要为假想的「上千条」提前上重方案（见技术债表）。

**Warning signs:**
- 内容才几十条却引入了搜索索引库和 worker。
- 分类页只能靠客户端 JS 呈现、直接访问 URL 是空的。
- 输入搜索时列表明显卡顿。

**Phase to address:**
工具库浏览/筛选阶段。

---

### Pitfall 8: 个人站过度工程（把简单站做成复杂系统）

**What goes wrong:**
为一个「改文件 + git 部署」的双模块个人站引入：CMS、数据库、复杂状态管理、微前端、过度抽象的组件体系、i18n、评论系统、自建搜索后端等。开发周期被基建吃掉，核心价值（工具库好用）迟迟不成立，维护成本反而升高——与「最简单、无需维护服务端」的初衷背道而驰。

**Why it happens:**
工程师本能地为「未来可能」预留过多；二次元风格的热情也容易演变成无止境的视觉/技术打磨，偏离 MVP。

**How to avoid:**
- 锚定 PROJECT.md 优先级：**工具库先做好**，追番次之，风格打磨最后。
- 严守 Out of Scope：无后台、无数据库、无用户系统、无评论、v1 不接 API。
- 「预留 API 空间」只体现在 schema 字段设计（Pitfall 1），**不是**现在就写抽象数据访问层。YAGNI。
- 每个技术引入先问：这条内容规模（几十到几百）真的需要吗？
- 先出可用的静态站再迭代，别在脚手架阶段追求完美架构。

**Warning signs:**
- 还没有一个能用的工具列表页，却在纠结状态管理/抽象层。
- 依赖列表里出现数据库、CMS、重型框架。
- 时间大量花在风格/基建而非内容功能。

**Phase to address:**
贯穿全程；在脚手架 + 每个阶段规划时作为验收约束。

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| 番剧字段名自创、单一 `title`、无 `bgmId` | 少想几分钟，直接录 | 接 Bangumi 时数据层重写、重录 | **Never**——schema 一开始就按 Bangumi 蓝本设计（Pitfall 1） |
| 用旧式 `src/content/config.ts` 隐式集合 | 复制旧教程即可跑 | Astro 版本升级/类型丢失、构建报错 | **Never**——直接用 Content Layer + loader |
| 封面图裸 `<img>` 放 `public/` | 拖进去就显示 | 带宽/LCP 差、无 WebP、CLS | 仅极早期占位；上线前必须换 `astro:assets` |
| 主题逻辑塞进框架岛屿 | 用熟悉的 React state | FOUC 闪白、hydration mismatch | **Never**——初始主题走 `<head>` 内联脚本 |
| 分类/搜索一把梭客户端 JS | 一个组件搞定 | 无 SEO 分类页、规模上去卡顿 | 交互式过滤可以；分类页应静态化 |
| 全量加载 CJK 装饰字体 | 视觉立刻到位 | 数 MB 传输、首屏文字延迟 | 仅标题少量字用；正文用系统字体栈 |
| 为「未来上千条」提前上 Fuse.js/搜索后端 | 感觉有远见 | 维护复杂度、包体增大 | 内容真达数百条以上再考虑 Pagefind |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Bangumi API（未来） | v1 就写抽象数据访问层，或字段不对齐 | 现在只对齐 schema 字段形状（`bgmId`/`titleJa`/`titleCn`/`cover`/`eps`），集成留到有需求时 |
| Bangumi 远程封面图 | 忘配 `image.domains`/`image.remotePatterns` 导致构建报错 | 提前在 `astro.config` 授权 bgm 图床 hostname，即使 v1 未用 |
| Vercel/Netlify 部署 | 用了 SSR-only 特性但按纯静态部署，或未设 `site`/base | 保持 `output: 'static'`（默认），设 `site` 便于 canonical/sitemap；确认适配器 |
| Netlify/Vercel 图片 CDN | 以为远程图自动优化 | 远程图需显式授权域名；本地图走构建期 Sharp 优化 |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| 封面/截图原图不优化 | LCP 高、带宽大、移动端慢 | `astro:assets` + WebP/AVIF + lazy | 首页放 >10 张封面即明显 |
| CJK 字体全量加载 | 首屏文字延迟、几 MB 传输 | 子集化 + 系统字体正文 + `swap` | 首屏立即出现（MEDIUM） |
| 客户端全量渲染列表 | 大列表滚动/筛选卡顿 | 构建期静态生成 + DOM show/hide | 数百条以上（MEDIUM） |
| 岛屿过度水合 | TTI 差、JS 包大 | 最小叶子岛屿 + `client:visible` | 多个 `client:load` 叠加即退化 |
| 每 keystroke 全量重排搜索 | 输入卡顿 | 去抖 + 预建索引（Pagefind） | 内容数百条以上 |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| 工具外链无 `rel="noopener noreferrer"` | 反向 tabnabbing、来源泄漏 | 所有 `target="_blank"` 外链统一加 `rel="noopener noreferrer"` |
| 详情页 Markdown 允许原始 HTML/脚本 | 若日后接受外部内容有 XSS 面 | 保持内容自管；如引入远程内容再做 sanitize |
| 直接热链他站图片 | 版权/防盗链失效/隐私 | 封面尽量本地化或走授权图床；尊重来源 |
| 把私人笔记误发布 | 隐私泄漏 | draft 字段 + 构建期过滤未发布条目 |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| 荧光色 + 花体牺牲可读性 | 正文难读、对比度不足 | 正文系统字体 + WCAG AA 对比度；花体仅点缀 |
| 亮/暗切换只调背景没调组件 | 暗色下卡片/边框/代码块刺眼 | 用 CSS 变量/Tailwind `dark:` 全量覆盖 token |
| 详情页图文长短不一无节奏 | 短条目空洞、长条目冗长 | 支持可长可短布局，封面/摘要/正文分区 |
| 移动端网格卡片过密 | 触控难点、信息挤 | 响应式列数 + 合理留白，卡片可点区域够大 |
| 筛选后无「空状态」提示 | 用户以为坏了 | 无结果时给友好空状态 + 清除筛选入口 |
| 追番状态无视觉区分 | 在看/看完/想看难一眼分辨 | 用色标/徽章区分 status，列表可按状态分组 |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **主题切换:** 常漏 `<head>` 内联脚本 —— 验证刷新暗色页面无闪白、无 hydration 警告
- [ ] **番剧 schema:** 常漏 `bgmId`/中日文分离/状态与元数据分层 —— 验证能否无损映射到 Bangumi subject
- [ ] **封面图:** 常漏 `astro:assets` 优化与显式尺寸 —— 验证输出 WebP、有 `srcset`、CLS≈0
- [ ] **远程图配置:** 常漏 `image.remotePatterns` —— 验证接远程 URL 构建不报未授权
- [ ] **分类/标签页:** 常漏构建期静态页 —— 验证直接访问 `/tools/tag/xxx` 有内容（非空壳）
- [ ] **外链:** 常漏 `rel="noopener noreferrer"` —— 验证所有 `target="_blank"`
- [ ] **字体:** 常漏子集化 —— 验证无单个 >1MB 字体请求、正文可读
- [ ] **draft/发布控制:** 常漏未发布过滤 —— 验证 draft 条目不出现在生产构建
- [ ] **SEO 基础:** 常漏 `site`/canonical/sitemap/OG —— 验证有 meta 与 sitemap
- [ ] **404 与空状态:** 常漏 —— 验证有 404 页、筛选无结果有提示

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| 番剧数据层写死 | HIGH | 重设计 schema → 写迁移脚本重映射旧条目 → 逐条补 `bgmId`/中日文/状态分层 |
| Content Layer 用旧 API | MEDIUM | 迁到 `src/content.config.ts` + 加 `loader`；按 Zod 报错逐字段修 frontmatter |
| 主题 FOUC | LOW | 抽出初始主题判定为 `<head>` 内联脚本；岛屿只保留切换按钮 |
| 图片未优化 | LOW-MEDIUM | 本地图改 `import` + `<Image>`；远程图补 `remotePatterns`；补显式尺寸 |
| CJK 字体过重 | LOW | 正文回退系统字体；装饰字体子集化 + `preload`/`swap` |
| 岛屿过度水合 | MEDIUM | 审计 `client:*`；把纯展示岛屿改回 `.astro`；交互降级为原生 `<script>` |
| 分类只在客户端 | MEDIUM | 用 `getStaticPaths` 补生成静态分类页；客户端过滤降为增强 |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| P2 Content Layer 用法过时 | 脚手架 / 内容建模 | `src/content.config.ts` + `loader` 存在，构建零 frontmatter 报错 |
| P3 主题 FOUC / 水合不匹配 | 基础布局 + 主题系统 | 刷新暗色页无闪白、控制台无 hydration 警告 |
| P6 岛屿过度水合 | 基础布局定原则 / 各交互阶段 | 构建产物 JS 体积可控、`client:load` 数量最少 |
| P1 番剧数据层写死 | 追番数据层设计 | schema 可无损映射 Bangumi subject，状态/元数据分层 |
| P4 图片优化 | 工具库详情页 / 追番封面 | Lighthouse LCP<2.5s、CLS<0.1、输出 WebP |
| P7 筛选/搜索架构 | 工具库浏览/筛选 | 分类页静态可直达；无过度索引库 |
| P5 CJK 字体 | 视觉风格打磨 | 无 >1MB 字体请求、正文 WCAG AA |
| P8 过度工程 | 贯穿全程（验收约束） | 每阶段先有可用内容功能再谈基建 |

## Sources

- Astro 官方文档（Context7 `/withastro/docs`，Astro 6.3.1）：Content Collections / Content Layer（`src/content.config.ts`、`glob`/`file` loader、`image()` helper）、`astro:assets`（`<Image>` `layout='constrained'`、`srcset`/`sizes`/`lazy`）、`image.domains`/`image.remotePatterns` 远程图授权 —— HIGH
- Astro 官方文档 styling / Tailwind 指南：Tailwind v4 经 `@tailwindcss/vite`（`astro add tailwind`，Astro ≥5.2）+ `@import "tailwindcss"`；`@astrojs/tailwind` 已弃用 —— HIGH
- Astro Islands / hydration 指令官方语义（`client:load`/`idle`/`visible`）—— HIGH
- Bangumi（番组计划）API subject 数据形状（`subject_id`/`name`/`name_cn`/`images`/`eps`/`collection`）—— MEDIUM（依据公开 API 结构，集成期需再核对）
- 性能阈值（字体体积、内容规模拐点）为通用 Web 性能经验判断 —— MEDIUM

---
*Pitfalls research for: 二次元风格个人内容站（Astro 6 + Tailwind v4 静态站点）*
*Researched: 2026-07-14*
