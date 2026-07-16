# Phase 4: Admin 外壳 + 密码守卫 + 条目浏览器 - Patterns

**Mapped:** 2026-07-16
**Files analyzed:** 2 (1 new page + 1 modified stylesheet)
**Analogs found:** 6 / 6

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/pages/admin/index.astro` | page (SSR + client island) | build-read + client-interaction | `src/pages/anime/index.astro` + `src/components/ThemeToggle.astro` | composite (page shell + script island) |
| `src/styles/global.css` | stylesheet (token + utility) | build-time CSS | self (append-only) | exact (existing file) |

## Pattern Assignments

### `src/pages/admin/index.astro` (page, composite: SSR grid + vanilla script island)

**Analogs:** `src/pages/anime/index.astro` (page shell + card grid), `src/components/ThemeToggle.astro` (vanilla `<script>` island), `src/components/EntryCard.astro` (absolute-positioned sibling button), `src/components/AnimeCard.astro` (absolute-positioned sibling overlay), `src/lib/anime.ts` + `src/lib/tools.ts` (data outlets), `src/layouts/BaseLayout.astro` (FOUC guard + SEO shell)

**Imports pattern** (from `src/pages/anime/index.astro` lines 1–8):
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import AnimeCard from '../../components/AnimeCard.astro';
import PillRow from '../../components/PillRow.astro';
import EmptyState from '../../components/EmptyState.astro';
import { getAllAnime, slugOf } from '../../lib/anime';
```
→ admin page adds `EntryCard`, `getAllTools`, and `import { Icon } from 'astro-icon/components'`. Same relative-depth (`../../`).

**Data read pattern** (from `src/lib/anime.ts` lines 18–21 + `src/lib/tools.ts` lines 5–8):
```typescript
export async function getAllAnime() {
  const raw = await getCollection('anime', ({ data }) => !data.draft);
  return raw.sort((a, b) => STATUS_ORDER[a.data.status] - STATUS_ORDER[b.data.status]);
}
export async function getAllTools() {
  const raw = await getCollection('tools', ({ data }) => !data.draft);
  return raw.sort((a, b) => a.data.title.localeCompare(b.data.title, 'zh'));
}
```
→ admin frontmatter calls `await getAllAnime()` + `await getAllTools()`, maps to minimal `{ id, type, slug, title }` shape. **Never** pass full Content Entry to `define:vars` (Pitfall 1).

**Page shell pattern** (from `src/pages/anime/index.astro` lines 13–54):
```astro
<BaseLayout title="追番记录" description="...">
  <Header />
  <main class="mx-auto max-w-[72rem] px-4 py-12 md:px-6">
    ...
    <section class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
      {items.map((a) => <AnimeCard ... />)}
    </section>
  </main>
  <div class="mt-24"><Footer /></div>
</BaseLayout>
```
→ admin page uses identical shell. Add `<meta name="robots" content="noindex, nofollow">` inside BaseLayout head slot (Pitfall 5 — noindex). Card grid uses same `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` responsive pattern.

**Card grid + absolute-positioned sibling button** (from `src/components/AnimeCard.astro` lines 89–92 + `src/components/EntryCard.astro` lines 59–69):

AnimeCard — StatusPill as sibling overlay:
```astro
<!-- StatusPill 整卡 <a> 的兄弟绝对定位遮罩（仿 EntryCard 外链按钮）；pointer-events:none 点击穿透到 <a> -->
<div class="pointer-events-none absolute right-2 top-2 z-10">
  <StatusPill status={status} />
</div>
```

EntryCard — external link as absolute-positioned sibling `<a>`:
```astro
{externalUrl && (
  <a href={externalUrl} target="_blank" rel="noopener noreferrer" aria-label={`${title} 外链`}
     class="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] ...">
    <Icon name="ph:arrow-square-out" class="size-5" aria-hidden="true" />
  </a>
)}
```
→ admin delete button follows **EntryCard pattern** (absolute-positioned sibling `<button>`, NOT inside the `<a>`). Place at `bottom-2 right-2` to avoid overlapping AnimeCard's StatusPill (`right-2 top-2`) and EntryCard's external link (`right-3 top-3`). Use `type="button"` to prevent form submission. Use `data-delete={id}` + `data-type` for event delegation.

**Vanilla `<script>` island pattern** (from `src/components/ThemeToggle.astro` lines 16–22):
```astro
<script>
  // 普通 <script>（非 is:inline）：Astro 打包为 module defer，仅切 .dark + 写 localStorage，无框架、无水合。
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  });
</script>
```
→ admin uses same plain `<script>` (Astro → deferred ES module). Add `define:vars={{ adminItems }}` to inject minimal data. Script runs after DOM parse — `getElementById` safe without `DOMContentLoaded`. Use `?.` optional chaining for null safety.

**FOUC guard — DO NOT BREAK** (from `src/layouts/BaseLayout.astro` lines 20–26):
```astro
<script is:inline>
  const t =
    localStorage.getItem('theme') ??
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (t === 'dark') document.documentElement.classList.add('dark');
</script>
```
→ admin page inherits via BaseLayout. **Never** duplicate, modify, or remove this `is:inline` script. Admin's own `<script>` is a separate deferred module.

**Active-state toggle pattern** (from `src/components/PillRow.astro` lines 17–23):
```astro
class:list={[
  'inline-flex min-h-11 items-center rounded-[var(--radius-full)] px-4 text-sm font-semibold transition-colors',
  pill.active
    ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)]'
    : 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)]',
]}
```
→ admin Tab buttons use same filled-vs-outline active distinction. Use `aria-selected="true|false"` (not `aria-current`) since Tabs are buttons, not nav links. Tab content grids toggle `hidden` class.

**Minimal data mapping for define:vars** (from RESEARCH.md Pattern 1):
```typescript
const adminItems = [
  ...anime.map((a) => ({ id: a.id, type: 'anime', slug: slugOf(a.data.titleCn), title: a.data.titleCn })),
  ...tools.map((t) => ({ id: t.id, type: 'tools', slug: slugOf(t.data.title), title: t.data.title })),
];
```
→ 4 string fields only. No `render`, no `image` object, no `Date`. This is the **only** shape that crosses the server→client boundary.

**localStorage read/write** (from RESEARCH.md Code Examples):
```javascript
const SESSION_KEY = 'chuxi_admin_session';
const DELETED_KEY = 'chuxi_admin_deleted';
function getDeleted() { return new Set(JSON.parse(localStorage.getItem(DELETED_KEY) || '[]')); }
function setDeleted(set) { localStorage.setItem(DELETED_KEY, JSON.stringify([...set])); }
```
→ namespace keys with `chuxi_admin_` prefix to avoid colliding with `theme` key used by ThemeToggle.

**Event delegation for delete buttons** (from RESEARCH.md Pattern 1 lines 229–240):
```javascript
dashboard.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-delete]');
  if (!btn) return;
  const { delete: id, type } = btn.dataset;
  const item = adminItems.find((i) => i.id === id && i.type === type);
  if (item && window.confirm(`确认删除「${item.title}」？此操作将移出导出列表。`)) {
    btn.closest('.relative')?.classList.add('hidden');
    const del = getDeleted();
    del.add(`${type}:${id}`);
    setDeleted(del);
  }
});
```
→ single delegated listener on `#dashboard`, not per-button. `window.confirm` = ponytail choice (1 line, native a11y). DOM removal via `closest('.relative')` — matches the wrapper `<div class="relative">` around each card.

**Initial view render (post-load session check)** (from RESEARCH.md Pattern 1 lines 195–199 + 243):
```javascript
function renderView() {
  const authed = isAuthed();
  pwView.classList.toggle('hidden', authed);
  dashboard.classList.toggle('hidden', !authed);
}
renderView(); // call at end of script
```
→ default HTML has `#pw-view` visible + `#dashboard` hidden (no FOUC — logged-in user is the "enhancement" path, Pitfall 2). Also re-apply deleted set on init: `getDeleted().forEach(...)`.

**Password submit handler** (from RESEARCH.md Pattern 1 lines 202–213):
```javascript
document.getElementById('pw-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const val = document.getElementById('pw-input').value;
  if (val === PW) {
    localStorage.setItem(SESSION_KEY, '1');
    error.classList.add('hidden');
    renderView();
  } else {
    error.classList.remove('hidden');
  }
});
```
→ `e.preventDefault()` blocks navigation. Wrong password = reveal `#pw-error` (role="alert"), stay on page, no 404 (D-05). Hardcode `const PW = '...'` at top of script.

---

### `src/styles/global.css` (stylesheet, append-only)

**Analog:** self (existing file). Add ~20–30 lines at end of file.

**Existing token reference** (from `src/styles/global.css` lines 35, 41, 56, 62):
```css
--color-primary-fg: #FFFFFF;   /* light mode */
--color-destructive: #F26D6D;  /* light mode */
--color-primary-fg: #04222B;   /* dark mode */
--color-destructive: #F58686;  /* dark mode */
```
→ admin delete button uses `var(--color-destructive)` for text/hover. Already defined — no new tokens needed.

**Append patterns:**
- `.admin-tab` / `.admin-tab-active` — mirror PillRow active/inactive visual (filled primary vs outline)
- `.admin-delete-btn` — absolute-positioned circle, `var(--color-destructive)` text, hover fills destructive bg + white text, `focus-visible:ring` on destructive
- `.admin-delete-btn:hover` — `bg-[var(--color-destructive)] text-white` (light) / `text-[var(--color-primary-fg)]` (dark)

No new `@theme` tokens required — all needed colors (`--color-destructive`, `--color-primary`, `--color-primary-fg`, `--color-surface`, `--color-border`) already exist.

## Shared Patterns

### Vanilla `<script>` island (no framework)
**Source:** `src/components/ThemeToggle.astro` lines 16–22
**Apply to:** `src/pages/admin/index.astro` `<script>` block
- Plain `<script>` (NOT `is:inline`) → Astro packs as deferred ES module
- `define:vars={{ adminItems }}` for server→client data
- `getElementById(...)` safe without DOMContentLoaded (deferred)
- `localStorage` for persistence (session flag + deleted set)

### Card grid responsive 1→2→3
**Source:** `src/pages/anime/index.astro` line 36 + `src/pages/tools/index.astro` line 44
**Apply to:** admin dashboard anime/tools grids
```html
<section class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
```

### Absolute-positioned sibling button (NOT inside `<a>`)
**Source:** `src/components/EntryCard.astro` lines 59–69 (external link) + `src/components/AnimeCard.astro` lines 89–92 (StatusPill)
**Apply to:** admin delete button
- Wrapper `<div class="relative">` around card + button
- `<button type="button" data-delete="..." data-type="...">` positioned `absolute bottom-2 right-2`
- Avoids click-bubbling into card `<a>` (Pitfall 6)
- AnimeCard: delete at bottom-right (StatusPill occupies top-right)
- EntryCard: delete at bottom-right (external link occupies top-right)

### BaseLayout shell + FOUC guard
**Source:** `src/layouts/BaseLayout.astro` lines 1–47
**Apply to:** admin page top-level structure
- Inherits `is:inline` theme script (DO NOT duplicate/remove)
- `title` prop drives `<title>` + OG (use `title="管理后台"`)
- Add `<meta name="robots" content="noindex, nofollow">` in head (Pitfall 5)

### Data read outlets (no direct getCollection)
**Source:** `src/lib/anime.ts` line 18 + `src/lib/tools.ts` line 5
**Apply to:** admin frontmatter
- `await getAllAnime()` + `await getAllTools()` — never `getCollection` in page
- Map to minimal shape before `define:vars`

### Active-state visual distinction
**Source:** `src/components/PillRow.astro` lines 17–23
**Apply to:** admin Tab buttons
- Active: filled primary bg + primary-fg text
- Inactive: outline border + muted text + hover primary
- `aria-selected` (not `aria-current`) for tab pattern

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|----------------|
| (none) | — | — | All capabilities map to existing analogs |

## Metadata

**Analog search scope:** `src/pages/`, `src/components/`, `src/layouts/`, `src/lib/`, `src/styles/`
**Files scanned:** 12 (ThemeToggle, BaseLayout, AnimeCard, EntryCard, PillRow, Breadcrumb, EmptyState, anime/index, tools/index, anime lib, tools lib, global.css)
**Pattern extraction date:** 2026-07-16
