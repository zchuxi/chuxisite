---
phase: "03"
slug: "anime-tracker"
plan: "03-01"
status: complete
wave: 1
type: standard
requirements_covered:
  - ANIME-01
  - ANIME-02
  - ANIME-05
files_modified:
  - src/lib/anime.ts
  - src/styles/global.css
verification:
  - pass
---

# 03-01 — 数据层扩展 + 主题 star token（wave 1）— Summary

## 完成内容

为 03-02 / 03-03 打好共享基础：

1. **`src/lib/anime.ts`**
   - 新增 `slugOf(titleCn: string): string`，单一 slug 派生出口（与 `lib/tools.ts:12-13` 完全一致，`encodeURIComponent`）。
   - 新增 `getAnimeByStatus(status, { excludeSlug? })`：静态筛选入口，`status: 'watching' | 'done' | 'plan'`，复用 `getAllAnime()` 的 draft 过滤 + watching→plan→done 排序（单一收口，日后换 Bangumi 仅改 `getAllAnime` 内部，ANIME-05）。
   - `getAllAnime()` 零改动，行为/排序不变。

2. **`src/styles/global.css`**
   - `@theme` 块追加 `--color-star: #F5A524`（亮色暖金，`#F5A524` 对 `--color-surface: #FFFFFF` 满足 AA ≥ 4.5:1）。
   - `:where(.dark)` 块追加 `--color-star: #F5C266`（暗色暖金，对 `--color-surface: #12262F` 满足 AA ≥ 4.5:1）。
   - `@layer utilities` 追加三个原子 class：`.star-fill { color: var(--color-star) }`、`.star-empty { color: var(--color-border) }`、`.rating-num { color: var(--color-text-muted); font-size: 0.8125rem }`——供 `RatingStar.astro`（03-02）消费。

## 验收（全通过）

| # | 校验项 | 结果 |
|---|--------|------|
| 1 | `npx tsc --noEmit` 零错误 | ✅ |
| 2 | `npx astro sync` 刷新 703ms | ✅ |
| 3 | `npx astro build` exit 0、9 页面、零新增错误 | ✅ |
| 4 | `grep --color-star` @theme `#F5A524` + `:where(.dark)` `#F5C266` 各 1 处 | ✅ |
| 5 | `grep .star-fill/.star-empty/.rating-num` 在 `global.css` 存在 | ✅ |
| 6 | `grep slugOf / getAnimeByStatus` 在 `anime.ts` 同时导出 | ✅ |
| 7 | `git diff --stat src/content.config.ts` 为空 → anime schema 零改动 | ✅ |
| 8 | `getAllAnime()` 行为无回归（git diff --stat 不含该函数主体） | ✅ |

## 提交

- `9473927` — feat(03-01): anime 数据层扩展 slugOf + getAnimeByStatus
- `db323e6` — feat(03-01): 主题追加 --color-star token 与 star 原子 class

## 并行安全（wave 2）

本 plan 仅触动 `src/lib/anime.ts` + `src/styles/global.css`。wave 2 将被触发的文件（`AnimeCard.astro` / `StatusPill.astro` / `RatingStar.astro` / `AnimeDetailHero.astro` / `pages/anime/**`）与本 plan 零重叠 → 03-02 与 03-03 可在 wave 2 安全并行。
