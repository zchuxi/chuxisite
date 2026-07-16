# Milestones

## v1.0 站点地基与基础框架 (Shipped: 2026-07-16)

**Phases completed:** 3 phases, 9 plans, 15 tasks
**Build:** 13 pages + sitemap, exit 0
**Verification:** Phase 1/2/3 均通过验收（TOOL 5/5, ANIME 5/5）
**Requirements:** 17/17 v1 requirements validated

**Key accomplishments:**

- Astro 7 + Tailwind v4 静态站脚手架（output: static，零适配器部署 Vercel），tools/anime 双集合分层 Zod schema（客观元数据组含 bgmId 预留 + 追番状态组），lib 薄数据层收口全部读取
- 防 FOUC 主题系统（<head> is:inline 阻塞脚本 + localStorage 记忆 + ThemeToggle），全站响应式 + 鲜艳可爱二次元视觉（ZCOOL KuaiLe 4.3KB 子集 + @theme 令牌 + deco SVG 装饰）
- 首页落地页（Hero + IntroBlock + 2× 整卡入口 EntryCard → /tools /anime）+ BaseLayout 统一 SEO/OG/canonical + /404 + 站点级默认 OG 兜底
- 工具库核心：EntryCard 双层链接（零嵌套 a, 绝对定位外链 target=_blank rel=noopener noreferrer）+ Breadcrumb/EmptyState/PillRow/TagCloud/ToolDetailNav + 4 页面（列表/详情/分类档案/标签档案）+ @layer utilities .prose hand-rolled
- 追番记录：StatusPill（watching/done/plan 三色）+ RatingStar + AnimeCard + AnimeDetailHero + /anime 列表网格 + /anime/[slug] 详情 + /anime/status/[status] 三状态筛选
- 构建真实落地：13 个静态页面 + sitemap.xml，`npm run build` exits 0（2.19s）

完整归档见 `.planning/milestones/v1.0-ROADMAP.md` 与 `.planning/milestones/v1.0-REQUIREMENTS.md`

---
