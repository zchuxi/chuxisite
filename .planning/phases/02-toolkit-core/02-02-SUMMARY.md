# 02-02 · 组件卡与两层链接 — SUMMARY

## Result: PASS

4 tasks executed, all committed atomically, build + check green.

## What changed

| Task | File | Change | Commit |
|------|------|--------|--------|
| T1 | `src/components/EntryCard.astro` | 外层 `<a>` → `<article.relative>`；内层整卡 `<a href=详情>` + 绝对定位外链 `<a target=_blank rel=noopener>` 仅 externalUrl 真时渲染；Phase 1 未传 externalUrl 行为零回归 | 7ce71c7 |
| T2 | `src/components/Breadcrumb.astro` + `EmptyState.astro` | 新建：面包屑 nav/ol + aria-current=page + ph:caret-right 分隔符 aria-hidden；空状态复用 Divider + 次 CTA 视觉 + 默认 Copywriting 文案 | e66d09c |
| T3 | `src/components/PillRow.astro` + `TagCloud.astro` | 新建：分类 pill 行（overflow-x-auto / aria-current / min-h-11）；标签云 chip（wrap / # 前缀 aria-hidden / min-h-[32px] / 可选 count） | c93a39b |
| T4 | `src/components/ToolDetailNav.astro` + `src/styles/global.css` | 新建底部 nav（← 返回 + showRelated 守卫同分类卡片网格）+ @layer utilities 追加 .prose ~40 行 hand-rolled（h2/h3/p/ul/a/code/pre/img/blockquote/hr） | 374cd26 |

## Acceptance matrix

- [x] EntryCard 双层链接：`<article.relative>` + 内层整卡 `<a>` + 绝对定位外链 `<a target=_blank rel=noopener noreferrer aria-label>`，**零嵌套 <a>**（D-04 / TOOL-05）
- [x] externalUrl 未传时回归 Phase 1 整卡单 `<a>` 视觉（入口卡零回归，R-4）
- [x] 外链按钮 44×44 min（min-h-11 min-w-11）、focus-visible ring、aria-label `{title} 外链`
- [x] Breadcrumb `<nav aria-label="路径">` + `<ol>` + 末项 `aria-current="page"` 无链接 + 分隔符 aria-hidden
- [x] EmptyState 三处形态复用（主页/分类/标签），heading/body/ctaHref/ctaLabel 全可选带默认
- [x] PillRow 分类 pill aria-current=page + min-h-11 命中区 + overflow-x-auto 横滚
- [x] TagCloud 标签 chip aria-current=page + min-h-[32px] + `#` 前缀 aria-hidden + 可选 count 括号
- [x] ToolDetailNav related 空时整个 section hidden（D-11）
- [x] global.css 追加 `@layer utilities .prose`；**未改动** `@theme` / `.dark` / `:focus-visible` / body baseline
- [x] `npm run build` exits 0（4 pages, 1.98s）
- [x] `npx astro check` 0 errors（2 deprecation hints，与本 plan 无关）
- [x] 0 新 npm 依赖（纯 .astro + CSS）
- [x] SUMMARY.md created and committed

## Exports stable for downstream (02-03)

```astro
// EntryCard — 整卡 detailHref（必填）+ externalUrl（可选，真时显示外链按钮）
<EntryCard href={detailHref} title description icon [emphasis] [badge] [externalUrl] />

// Breadcrumb — items 末项自动 aria-current=page
<Breadcrumb items={[{href,label}, {label}]} />

// EmptyState — 全可选，默认 Copywriting 文案
<EmptyState [heading] [body] [ctaHref='/'] [ctaLabel='回到首页'] />

// PillRow — pills 数组 + active prop 控制 aria-current
<PillRow pills={[{href,label,active}]} [scrollable=true] />

// TagCloud — tags 数组含可选 count + active
<TagCloud tags={[{href,label,count,active}]} />

// ToolDetailNav — 返回 + related 卡片网格
<ToolDetailNav [backHref='/tools'] [backLabel='← 返回工具库'] [related={[{href,title,description,icon,externalUrl}]} />
```

## Self-check

- `grep -c "<article" src/components/EntryCard.astro` = 1 ✓
- `grep -c 'target="_blank"' src/components/EntryCard.astro` = 1 ✓
- `grep -c 'rel="noopener noreferrer"' src/components/EntryCard.astro` = 1 ✓
- `grep -c 'aria-label="路径"' src/components/Breadcrumb.astro` = 1 ✓
- `grep -c 'aria-current' src/components/PillRow.astro` = 1 ✓
- `grep -c 'aria-current' src/components/TagCloud.astro` = 1 ✓
- `grep -c '\.prose' src/styles/global.css` = 9 ✓
