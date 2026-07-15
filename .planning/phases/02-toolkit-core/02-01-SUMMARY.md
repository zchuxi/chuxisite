# 02-01 · 数据层扩展 — SUMMARY

## Result: PASS

3 tasks executed, all committed atomically, build + check green.

## What changed

| Task | File | Change | Commit |
|------|------|--------|--------|
| T1 | `src/content.config.ts` | tools.tags 加 zod transform 链（trim+lowercase+Set去重），anime 零改动 | a083829 |
| T2 | `src/lib/tools.ts` | 新增 `slugOf`/`getToolsByCategory`/`getToolsByTag`/`getRelated`（4 导出），经 getAllTools 收口 | 73c3174 |
| T3 | `src/content/tools/raycast.mdx` | tags 小写同步 `macOS→macos`，与 transform 契约一致 | 920b0cd |

## Acceptance matrix

- [x] tags transform 归一化生效；astro sync 类型刷新（T1）
- [x] lib/tools.ts 新增 4 个导出函数（共 5 export），全部基于 getAllTools() 复用 zh localeCompare 排序（T2）
- [x] raycast.mdx tags 小写同步且过 schema（T3）
- [x] `npm run build` exits 0（4 pages, 2.45s）
- [x] `npx astro check` 0 errors（2 deprecation hints，零 warning）
- [x] anime 集合 + lib/anime.ts 零改动（git diff 未触及 anime block）
- [x] SUMMARY.md created and committed

## Exports stable for downstream (02-02 / 02-03)

```ts
export async function getAllTools()           // unchanged signature
export function slugOf(title: string): string
export async function getToolsByCategory(category: string)
export async function getToolsByTag(tag: string)
export async function getRelated(category: string, excludeSlug: string, n = 2)
```

## Verification commands run

```bash
grep -c "export " src/lib/tools.ts          # 5 ✓
grep "encodeURIComponent" src/lib/tools.ts   # slugOf ✓
grep "tags:" src/content/tools/raycast.mdx   # ["效率","macos","启动器"] ✓
npx astro sync                                # Synced ✓
npx astro check                               # 0 errors ✓
npm run build                                 # 4 pages built ✓
git diff --stat HEAD~3 -- src/content.config.ts  # 1 file, +4 -1 ✓
```

## Notes

- `slugOf` 走 `encodeURIComponent`，与 Astro `[slug].astro` params 自动 decode 对称（D-09 discretionary）。
- `getToolsByTag` 入参 `tag.toLowerCase()` 与 schema transform lowercase 双保险对齐（R-6 收敛）。
- 子函数仅 filter/slice，不做二次排序，与 getAllTools() zh localeCompare 一致（D-02）。
- anime 集合（bgmId/titleJa/status）零改动，Phase 3 不动点。
