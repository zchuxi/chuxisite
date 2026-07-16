# Phase 4 Plan 01: Admin 外壳 + 密码守卫 + 条目浏览器 Summary

**Completed:** 2026-07-16 11:39 UTC+8
**Requirements:** EDIT-01, EDIT-02

## What was delivered

- `src/pages/admin/index.astro` — 密码门禁 + 工作台壳页面；服务端渲染完整 anime/tools 卡片网格；客户端 vanilla `<script>` 岛屿持 session flag + 删除集合
- `src/layouts/BaseLayout.astro` — `<slot name="head" />` 已注入 `<head>`（charset 之后、viewport 之前），子页面可注入 `<meta name="robots">` 等
- `src/styles/global.css` — 追加 `.admin-tab` / `.admin-delete-btn` CSS block（aria-selected 视觉、destructive hover、`prefers-reduced-motion` 降级），不新增 `--color-*` token

## Acceptance status

- [x] `npm run build` exit 0，14 pages（含新增 /admin）
- [x] `npx astro check` 通过（同 build schema 校验）
- [x] 浏览器走查：错误密码 → 留入口页 + 「密码错误，请重试」；正确密码 → 进入工作台
- [x] Tab 切换「追番 / 工具」正确 hidden/toggle 对应网格
- [x] 删除按钮弹出 `window.confirm`；确认后 `.closest('.relative').hidden`，刷新后保持（读 `chuxi_admin_deleted_v1`）
- [x] 整卡点击导航至 `#edit/anime/{slug}` / `#edit/tools/{slug}`（hash 占位，Phase 5 替换）
- [x] 输出 HTML 含 `<meta name="robots" content="noindex, nofollow">`
- [x] AnimeCard / EntryCard / Header / Footer / EmptyState / anime.ts / tools.ts / PillRow 未修改
- [x] PW 值 <REDACTED> 脚本顶层常量 `'chuxi-admin-2026'`，无其他文件泄漏

## Commits

| Hash | Message |
|------|---------|
| 6b680ba | feat(04-01): add /admin page with password gate + entry browser |
| ae528be | feat(04-01): add BaseLayout head slot + admin tab/delete CSS |

## Key decisions (live)

- PW = `chuxi-admin-2026` 硬编码在 `<script>` 顶层常量（D-03）
- SESSION_KEY = `chuxi_admin_session`，DELETED_KEY = `chuxi_admin_deleted_v1`（`_v1` 后缀便于未来 schema 变更时重置缓存 — ponytail 决策）
- 删除按钮定位 `bottom-2 right-2 z-20`，与 AnimeCard StatusPill (`right-2 top-2`) / EntryCard 外链按钮 (`right-3 top-3`) 不重叠
- adminItems 仅 4 个字符串字段（id / type / slug / title），经 `define:vars` 注入——阻止 Content Entry（含 render / image / Date 不可序列化）泄漏到客户端

## Deviations from Plan

None — plan 执行按任务顺序逐个落地。

## Self-Check: PASSED

- `src/pages/admin/index.astro` exists (6b680ba)
- `src/layouts/BaseLayout.astro` modified with `<slot name="head" />` (ae528be)
- `src/styles/global.css` modified with admin CSS block (ae528be)
- Commits exist in log
