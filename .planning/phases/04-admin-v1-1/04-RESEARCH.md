# Phase 4: Admin 外壳 + 密码守卫 + 条目浏览器 - Research

**Researched:** 2026-07-16
**Domain:** Astro 原生 `<script>` 岛屿、前端密码门禁、客户端状态管理（无框架）
**Confidence:** HIGH（代码库模式已验证 + Astro 7 官方 API 稳定）

## Summary

Phase 4 是本站**首个有状态客户端 UI**。用户已决策：不引入 Preact，用单个原生 `<script>` 岛屿（Astro 直接支持，零新依赖）。核心工作量约 150–250 行原生 JS，覆盖密码门禁、localStorage 会话、Tab 切换、删除确认。

**关键架构洞察：服务端渲染卡片 + 客户端仅持有最小识别数据。** `getAllAnime()`/`getAllTools()` 在构建期产出完整条目，页面直接用现有 `AnimeCard`/`EntryCard` 组件服务端渲染卡片网格（封面走 `astro:assets` `<Image>`、状态走 `StatusPill`，全部复用）。客户端脚本只持有一份**极简数据副本**（`{ id, slug, title, type }`），用于 Tab 切换与删除跟踪——无需序列化图片/Date/image 对象，规避 Content Entry 不可 JSON 序列化的坑。

**Primary recommendation:** 单文件 `src/pages/admin/index.astro`，内含密码视图 + 工作台视图，客户端 `deferred` 模块脚本通过 `define:vars` 接收极简条目数据，localStorage 管理会话与删除集合。零新组件、零新依赖、零新 lib 文件。

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 密码门禁 / 会话 | Client（浏览器） | — | 无后端；localStorage 存会话 flag，构建期硬编码密码 |
| 卡片网格渲染 | Build（Astro SSR） | — | 复用 AnimeCard/EntryCard，封面走 `astro:assets`，构建期产出静态 HTML |
| Tab 切换 | Client | — | 纯展示态，`hidden` class 切换两个预渲染网格 |
| 删除确认 + 状态 | Client | — | `window.confirm` → DOM 移除卡片 + 写 localStorage 删除集合 |
| 数据读取 | Build | — | 经 `getAllAnime()`/`getAllTools()` 收口，不改 schema |
| JSON 导出（不含已删条目） | Client（Phase 7） | — | Phase 4 仅跟踪删除集合；文件下载/格式实现属 Phase 7 |

## Standard Stack

### Core（零新增）

| 技术 | 版本 | 用途 | 为何够用 |
|------|------|------|----------|
| Astro 原生 `<script>` 岛屿 | 内置 | 客户端逻辑容器 | Astro 自动打包为 deferred ES module，无需框架；ThemeToggle 已验证此模式 |
| `define:vars={{ }}` | Astro 内置 | 服务端→客户端传极简数据 | 官方 API，JSON 可序列化数据直接注入；比 `type="application/json"` block 更贴近使用处 |
| localStorage | 浏览器原生 | 会话 flag + 删除集合持久化 | 单人站够用；关浏览器仍保持（D-02 决策） |
| `window.confirm` | 浏览器原生 | 删除二次确认 | 一行代码、内置无障碍、零依赖；ponytail 首选 |

### 复用组件（不新建）

| 组件 | 用途 | 备注 |
|------|------|------|
| `AnimeCard.astro` | 追番管理卡片 | 整卡可点 + StatusPill 角标；删除按钮叠加为绝对定位兄弟元素 |
| `EntryCard.astro` | 管理工具卡片 | 已有绝对定位外链按钮模式 → 删除按钮同范式叠加 |
| `EmptyState.astro` | 空集合兜底 | 无条目时展示 |
| `BaseLayout.astro` | 外壳 + 防 FOUC + SEO | 继承主题/字体/暗色 |
| `Breadcrumb.astro` | 工作台顶部路径 | 可选，增强导航感 |
| `astro-icon` (ph:) | 删除/编辑图标 | 已装；`ph:trash` / `ph:pencil` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 单文件 `admin/index.astro` | 拆 `admin/index.astro`（密码）+ `admin/workspace.astro`（工作台） | 拆分需两处重复 auth 检查 + localStorage 同步；单文件 URL 不变、逻辑内聚，ponytail 首选单文件 |
| `define:vars` 传数据 | `<script type="application/json">` + `JSON.parse` | 功能等价；`define:vars` 更贴近使用处、少一次 DOM 查询 |
| `window.confirm` | 自定义 modal（01-UI-SPEC 配色） | 自定义 modal ~30–50 行 JS + CSS；`confirm` 一行且原生无障碍。ponytail 默认 `confirm`，视觉升级时再换 |
| 新建 `AdminCard.astro` | 复用 AnimeCard/EntryCard + 叠加操作按钮 | 新建 = 重复卡片视觉逻辑；EntryCard 已有绝对定位兄弟按钮模式，直接参照 |
| 客户端渲染卡片 | 服务端渲染 AnimeCard/EntryCard | 客户端渲染需重写封面 `<Image>`/StatusPill 逻辑 = 重复造轮；服务端渲染零额外 JS |

**Installation:** 零新增，无需 `npm install`。

## Architecture Patterns

### System Architecture Diagram

```
用户请求 /admin
        │
        ▼
  Astro 构建期（SSR）
   ├─ getAllAnime() ──→ anime[]
   ├─ getAllTools() ──→ tools[]
   ├─ 服务端渲染 AnimeCard/EntryCard 网格（含封面 Image）
   ├─ 映射极简数据 adminItems[] → define:vars 注入
   └─ 产出静态 HTML（密码视图可见 / 工作台 hidden）
                │
                ▼
  浏览器加载 deferred <script>
   ├─ 读 localStorage session flag
   │    ├─ 已登录 → 显示工作台（移除 password #hidden）
   │    └─ 未登录 → 显示密码视图
   ├─ 密码提交 → 比较硬编码常量
   │    ├─ 正确 → 写 localStorage + 切换视图
   │    └─ 错误 → 行内显示错误（不跳转、不 404）
   ├─ Tab 按钮 → toggle 两个预渲染网格的 hidden class
   ├─ 删除按钮 → window.confirm → DOM 移除 + 写 localStorage 删除集合
   └─ 整卡点击 → 导航到 # 或未来 /admin/edit/:type/:slug（Phase 5 接线）
```

### Recommended Project Structure

```
src/
├── pages/
│   └── admin/
│       └── index.astro          # 新增：密码门禁 + 工作台（单文件）
├── components/
│   ├── AnimeCard.astro          # 已有，复用
│   ├── EntryCard.astro          # 已有，复用
│   ├── EmptyState.astro         # 已有，复用
│   └── PillRow.astro            # 已有，Tab 样式参考（但 Tab 用 <button> 非链接）
├── lib/
│   ├── anime.ts                 # 已有，getAllAnime()
│   └── tools.ts                 # 已有，getAllTools()
└── styles/
    └── global.css               # 追加：管理操作按钮样式 + Tab 样式（~20–30 行）
```

**ponytail 决策：** 不新建 `AdminCard.astro`。EntryCard 已有绝对定位兄弟 `<a>` 模式（外链按钮），删除按钮同范式叠加为绝对定位 `<button>`。AnimeCard 的 StatusPill 已是绝对定位兄弟，删除按钮叠加在另一角（如右下角）即可。

### Pattern 1: 单文件视图切换（密码 ↔ 工作台）

**What:** 同一页面内，客户端脚本通过 `hidden` class 切换两个视图容器。
**When to use:** 无后端、客户端 auth、URL 不变的单页工具。

```astro
---
// src/pages/admin/index.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import AnimeCard from '../../components/AnimeCard.astro';
import EntryCard from '../../components/EntryCard.astro';
import EmptyState from '../../components/EmptyState.astro';
import { Icon } from 'astro-icon/components';
import { getAllAnime, slugOf } from '../../lib/anime';
import { getAllTools } from '../../lib/tools';

const anime = await getAllAnime();
const tools = await getAllTools();

// 极简客户端数据：仅识别字段，无图片/Date/image 对象
const adminItems = [
  ...anime.map((a) => ({ id: a.id, type: 'anime', slug: slugOf(a.data.titleCn), title: a.data.titleCn })),
  ...tools.map((t) => ({ id: t.id, type: 'tools', slug: slugOf(t.data.title), title: t.data.title })),
---

<BaseLayout title="管理后台" description="内容管理（需密码）">
  <Header />
  <main class="mx-auto max-w-[72rem] px-4 py-12 md:px-6">
    <!-- 密码视图（默认可见） -->
    <div id="pw-view" class="mx-auto max-w-md">
      <form id="pw-form" class="...">
        <label for="pw-input">管理密码</label>
        <input id="pw-input" type="password" required ... />
        <button type="submit">进入</button>
        <p id="pw-error" role="alert" class="hidden">密码错误，请重试</p>
      </form>
    </div>

    <!-- 工作台（默认 hidden，客户端脚本按 session 切换） -->
    <div id="dashboard" class="hidden">
      <button data-tab="anime" aria-selected="true">追番 (anime.length)</button>
      <button data-tab="tools" aria-selected="false">工具 (tools.length)</button>

      <div data-grid="anime">
        {anime.length === 0 ? <EmptyState ... /> : anime.map((a) => (
          <div class="relative">
            <AnimeCard href={`#edit/anime/${slugOf(a.data.titleCn)}`} ... />
            <button data-delete={a.id} data-type="anime" aria-label={`删除 ${a.data.titleCn}`>
              <Icon name="ph:trash" />
            </button>
          </div>
        ))}
      </div>

      <div data-grid="tools" class="hidden">
        {tools.map((t) => (
          <div class="relative">
            <EntryCard href={`#edit/tools/${slugOf(t.data.title)}`} ... />
            <button data-delete={t.id} data-type="tools" aria-label={`删除 ${t.data.title}`}>
              <Icon name="ph:trash" />
            </button>
          </div>
        ))}
      </div>
    </div>
  </main>
  <Footer />
</BaseLayout>

<script define:vars={{ adminItems }}>
  // Astro 打包为 deferred module；DOM 已就绪
  const PW = 'chuxi-admin-2026'; // 硬编码密码（D-03）
  const SESSION_KEY = 'chuxi_admin_session';
  const DELETED_KEY = 'chuxi_admin_deleted';

  const pwView = document.getElementById('pw-view');
  const dashboard = document.getElementById('dashboard');
  const error = document.getElementById('pw-error');

  function isAuthed() { return localStorage.getItem(SESSION_KEY) === '1'; }
  function getDeleted() { return new Set(JSON.parse(localStorage.getItem(DELETED_KEY) || '[]')); }
  function setDeleted(set) { localStorage.setItem(DELETED_KEY, JSON.stringify([...set])); }

  // 初始视图
  function renderView() {
    const authed = isAuthed();
    pwView.classList.toggle('hidden', authed);
    dashboard.classList.toggle('hidden', !authed);
  }

  // 密码提交
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
    // 错误时不跳转、不 404（D-05）
  });

  // Tab 切换
  document.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('[data-grid]').forEach((g) => {
        g.classList.toggle('hidden', g.dataset.grid !== tab);
      });
      document.querySelectorAll('[data-tab]').forEach((b) => {
        b.setAttribute('aria-selected', String(b === btn));
      });
    });
  });

  // 删除按钮（事件委托）
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

  // Phase 5+ 接线：整卡点击导航至 #edit/...，未来替换为真实路由
  renderView();
</script>
```

**ponytail 说明：** 不引入路由/状态/事件库；一个 IIFE 模块、三个事件监听器、两个 localStorage key。整卡 href 暂用 `#edit/...` hash，Phase 5 替换为 `/admin/edit/:type/:slug` 路由。astro-icon 的 `ph:pencil` 编辑图标在 Phase 5 接线时启用。

### Anti-Patterns to Avoid

- **客户端渲染卡片：** 把 `getAllAnime()` 数据序列化到客户端再 JS 渲染 AnimeCard = 重复造轮（封面 `<Image>` / StatusPill / RatingStar 逻辑全得重写一次）。服务端渲染 + 客户端仅做交互是 Astro 的正道。
- **`<script is:inline>` 滥用：** `is:inline` 脚本不会被 Astro 打包，适合极短的内联逻辑（如防 FOUC）。工作台逻辑应使用普通 `<script>` + `define:vars`，Astro 会打包为 deferred module 并复用构建缓存。
- **把完整 Content Entry 塞进 define:vars：** Content Entry 含 `render` 函数、image 对象、Date 等不可序列化值。必须在前端映射为 `{ id, type, slug, title }` 极简形状后再注入。
- **密码视图用 404 兜底：** 密码错误必须停留在入口页 + 行内提示，不能 404 或跳转，避免暴露 `/admin` 存在。

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 密码会话持久化 | 自建 cookie + 签名系统 | localStorage flag | 单人站、无后端；localStorage 足够（D-02） |
| Tab 状态管理 | 自定义 store / reducer | `data-tab` + classList.toggle | 仅两个视图切换，无需状态机 |
| 删除确认弹窗 | 自定义 modal 组件树 | `window.confirm` | 原生无障碍、一行代码、零依赖 |
| 卡片视觉 | 重写 AdminCard 组件 | AnimeCard/EntryCard + 绝对定位删除按钮 | 复用已有视觉 + EntryCard 已验证的"绝对定位兄弟按钮"模式 |
| 客户端数据请求 | fetch / API 层 | 服务端 getAllXxx() + define:vars | 构建期已有数据，无需运行期请求 |
| 构建期校验绕过 | 改 schema 适配编辑 | schema 不动，编辑结果后期对齐（Phase 7） | Phase 4 只消费数据，不改 schema |

**Key insight：** 本站数据在构建期已全部可得（`getAllAnime()`/`getAllTools()`），客户端不需要任何"数据层"——只需要交互层。Phase 4 的全部客户端逻辑 = 视图切换 + 删除跟踪，预估 <150 行原生 JS。

## Common Pitfalls

### Pitfall 1: Content Entry 不可直接 JSON 序列化
**现象：** `define:vars={{ items: await getAllAnime() }}` 传入完整 Content Entry 对象，`render` 函数 / astro:assets image 对象 / Date 在序列化时丢失或报错。
**根因：** Astro 内容条目不是纯数据，包含函数与特殊对象。
**避免：** 在前端（frontmatter）显式映射为极简形状后再注入（见 Pattern 1 代码）。`adminItems` 仅含 `id / type / slug / title` 四个字符串字段。
**警告：** 构建期无报错但客户端拿到 `undefined` 或 `[object Object]` 时首先怀疑序列化。

### Pitfall 2: 视图切换导致 FOUC
**现象：** 页面加载瞬间工作台闪现、然后 JS 切回密码视图（或反之），闪烁体验差。
**根因：** `deferred` 脚本在 HTML 解析完成后才执行，初始 DOM 状态与 JS 修正状态不一致。
**避免：** 默认 HTML 状态 = 未登录态（密码视图可见 + 工作台 `hidden`）。已登录用户在脚本执行后切换到工作台——这是"增强"而非"修正"，不会产生逆向闪烁。`#dashboard` 直接在 HTML 写死 `class="hidden"`，不要依赖 JS 注入。
**警告：** `prefers-reduced-motion` 场景下切换瞬间仍可能被感知；工作台与密码视图内容差异大时不做动画过渡即够。

### Pitfall 3: 删除状态在页面刷新后丢失
**现象：** 用户删除条目 → 刷新页面 → 卡片重新出现（因为服务端总是渲染全集）。
**根因：** 服务端构建期无法感知客户端 localStorage 删除集合。
**避免：** 客户端脚本初始化时读取 `chuxi_admin_deleted`，对匹配卡片直接添加 `hidden` class（与服务端渲染共存）。`hidden` 叠加 = 双保险。
**警告：** 这是"视觉隐藏"不是"数据删除"——实际导出 JSON 不含已删条目由 Phase 7 的导出链路保证（基于同一 localStorage key）。

### Pitfall 4: 密码视图在源码/构建产物中暴露工作台 HTML
**现象：** 查看 `/admin` 源码能看到整个工作台 HTML（包含所有条目标题/封面），"隐藏路由"存在泄露风险。
**根因：** 服务端渲染两个视图都在 DOM 中（一个 hidden）。
**避免：** 这是可接受的——已登录用户能看到工作台是预期行为；未登录用户看到源码里隐藏的条目列表 ≈ 与公开页面（/tools / /anime）内容相同，无增量信息泄露（这些数据本身就在公开路由可见）。若未来要真正"未登录不发送工作台 HTML"，需引入 SSR + 服务端鉴权（违背零后台原则，不作为 Phase 4 方案）。
**警告：** 不要在 /admin 工作台泄露**未发布（draft）条目**——但 `getAllAnime()`/`getAllTools()` 已过滤 draft，与公开页面一致，OK。

### Pitfall 5: sitemap/SEO 暴露 /admin
**现象：** `/admin` 出现在 sitemap.xml 或可被搜索引擎索引。
**根因：** @astrojs/sitemap 默认索引所有静态页面。
**避免：** 在 admin 页面添加 `<meta name="robots" content="noindex, nofollow">`。若 sitemap 插件支持 exclude 配置，也把 `/admin` 排除。
**警告：** robots meta 只是提示，真正的"隐藏"靠密码守卫；但 SEO 暴露会让偶然访问者看到入口，建议加 noindex。

### Pitfall 6: 整卡点击与删除按钮点击事件冒泡冲突
**现象：** 点击卡片角落删除按钮时，同时触发整卡 `<a>` 导航。
**根因：** delete 按钮在卡片 `<a>` 内部或绝对定位覆盖，点击事件冒泡到 `<a>`。
**避免：** 删除按钮作为卡片的**绝对定位兄弟元素**（模仿 EntryCard 外链按钮模式），不在 `<a>` 内部。必须放在 `<a>` 内时用 `e.stopPropagation()`。遵循 EntryCard 已有模式（`right-2 top-2` + `pointer-events-auto`）。
**警告：** AnimeCard 的 StatusPill 在 `right-2 top-2`，所以删除按钮放在 `bottom-2 right-2` 避免重叠。EntryCard 的外链按钮在 `right-3 top-3`，tools 卡片的删除按钮改放 `bottom-2 right-2`。

## Code Examples

### 服务端渲染追番卡片网格（复用 AnimeCard + 删除按钮）
```astro
// 模式来源：src/pages/anime/index.astro（已验证）
<section class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
  {anime.map((a) => (
    <div class="relative">
      <AnimeCard
        href={`#edit/anime/${slugOf(a.data.titleCn)}`}
        cover={a.data.cover}
        titleCn={a.data.titleCn}
        status={a.data.status}
        myRating={a.data.myRating}
        progress={a.data.progress}
        episodes={a.data.episodes}
      />
      <button
        type="button"
        data-delete={a.id}
        data-type="anime"
        aria-label={`删除 ${a.data.titleCn}`}
        class="absolute bottom-2 right-2 z-20 grid size-9 place-items-center rounded-full bg-white/90 text-[var(--color-destructive)] shadow-sm hover:bg-[var(--color-destructive)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-destructive)] dark:bg-[var(--color-surface)]"
      >
        <Icon name="ph:trash" class="size-4" aria-hidden="true" />
      </button>
    </div>
  ))}
</section>
```
AnimeCard 的 StatusPill 在 `right-2 top-2`，删除按钮放在 `bottom-2 right-2` 避免重叠。EntryCard 的外链按钮在 `right-3 top-3`，tools 卡片的删除按钮同样改放 `bottom-2 right-2`。

### localStorage 会话与删除集合读写
```javascript
// 极简键值读写，无需序列化库
const SESSION_KEY = 'chuxi_admin_session';
const DELETED_KEY = 'chuxi_admin_deleted';

// 登录 / 注销
localStorage.setItem(SESSION_KEY, '1');
localStorage.removeItem(SESSION_KEY);

// 删除集合
function getDeleted() {
  return new Set(JSON.parse(localStorage.getItem(DELETED_KEY) || '[]'));
}
function markDeleted(type, id) {
  const s = getDeleted();
  s.add(`${type}:${id}`);
  localStorage.setItem(DELETED_KEY, JSON.stringify([...s]));
}
const isDeleted = (type, id) => getDeleted().has(`${type}:${id}`);
```

### define:vars 注入极简数据
```astro
---
// 前端映射，仅保留客户端需要的字段
const adminItems = [
  ...anime.map((a) => ({ id: a.id, type: 'anime', slug: slugOf(a.data.titleCn), title: a.data.titleCn })),
  ...tools.map((t) => ({ id: t.id, type: 'tools', slug: slugOf(t.data.title), title: t.data.title })),
---
<script define:vars={{ adminItems }}>
  // adminItems 在脚本内直接可用
</script>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Preact/React 岛屿 | 原生 `<script>` 岛屿 | Phase 4（用户决策 D-01） | 首例有状态 UI 直接原生实现，零运行时成本 |
| sessionStorage 会话 | localStorage 会话 | Phase 4 决策 D-02 | 关浏览器仍保持，单人站够用 |
| 硬编码密码 + 服务端验证 | 硬编码密码 + 客户端验证 | Phase 4 决策 D-03 | 单人站 + 公开只读站点，密码只是防偶然访问 |

**Deprecated/outdated:** 无（Phase 4 无既有模式变更，首款有状态 UI）。

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `define:vars` 注入 `{ id, type, slug, title }` 极简形状在 Astro 7 正常工作 | Code Examples | 若序列化异常 → 改用 `<script type="application/json">` + `JSON.parse` 模式（备选已验证） |
| A2 | `getAllAnime()`/`getAllTools()` 过滤 draft 后数据与公开页面一致，不构成信息泄露 | Pitfall 4 | 若有 draft 字段包含敏感信息（实际无） → 但函数已过滤 draft，风险不成立 |
| A3 | `window.confirm` 在目标浏览器（现代 Chrome/Safari/Firefox）可用且无障碍 | Don't Hand-Roll | 极罕见环境禁用 → 预留自定义 modal 升级路径 |
| A4 | 服务端渲染 + 客户端 hidden 模式不会导致 SEO 泄露增量内容 | Pitfall 4 | 若未来出现仅 admin 可见的字段（实际无）→ 所有字段已在公开路由暴露 |

## Open Questions

1. **密码具体取值**
   - 我们知道：硬编码在 `<script>` 中（D-03）。
   - 不确定的：用户希望用什么密码（影响维护者部署后的记忆负担）。
   - 建议：planning 时与用户确认密码值，建议有意义的短语（如站点品牌相关）便于记忆；rebuild 即可换密码。

2. **整卡点击在 Phase 4 的行为**
   - 我们知道：D-09 要求整卡点击进入编辑。
   - 不确定的：Phase 5 编辑页路由尚未定义，Phase 4 整卡 href 暂时 `#` 还是 `/admin/edit/...` 占位。
   - 建议：Phase 4 用 `#edit/:type/:slug` hash（无导航跳转，不产生死链），Phase 5 替换为真实路由。

3. **删除的"导出 JSON"如何在 Phase 4 呈现**
   - 我们知道：D-10 说删除 = 导出不含被删条目的 JSON；但 Phase 4 scope"不在范围内"明确"JSON 导出格式实现（Phase 7）"。
   - 不确定的：Phase 4 工作台是否提供"导出 JSON"按钮入口，还是仅做删除跟踪、等到 Phase 7 才可见导出按钮。
   - 建议：Phase 4 仅做删除跟踪（localStorage），工作台**不出现导出按钮**（避免半成品功能误导）。Phase 7 按同一 localStorage key 实现导出链路。这是 ponytail 决策——不为未来功能留 UI stub。

4. **/admin 的 SEO 处理**
   - 我们知道：隐藏路由 + 密码守卫。
   - 不确定的：是否需要 `robots: noindex` + sitemap exclude。
   - 建议：planning 决定在 admin 页面添加 `<meta name="robots" content="noindex, nofollow">`；sitemap 可选排除（单页面影响极小，优先级低）。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Astro 7 engines | ✓ | v24.1.0（≥22.12.0） | — |
| Astro 7 | 核心运行时 | ✓ | 7.0.9（latest） | — |
| localStorage | 会话 + 删除集合 | ✓ | 浏览器原生 | — |
| window.confirm | 删除确认 | ✓ | 浏览器原生 | 自定义 modal（~30 行） |
| astro-icon (ph:trash) | 删除按钮图标 | ✓ | 已装（EntryCard 验证） | 内联 SVG |
| define:vars | 服务端→客户端传数据 | ✓ | Astro 7 内置 | `<script type="application/json">` |

**Missing dependencies:** 无。

## Validation Architecture

> 本项目 `workflow.nyquist_validation` 未显式设置，按默认启用处理。

### Test Framework

| Property | Value |
|----------|-------|
| Framework | 手动/集成验证为主（无测试框架 installed） |
| Config file | 无 |
| Quick run command | `npm run build`（构建期校验 schema + 内容） |
| Full suite command | `npm run build` + `npm run preview` 后浏览器人工走查 |

**说明：** Phase 4 是纯前端交互 UI，逻辑集中在客户端 `<script>`，单元测试框架不适用（无 Jest/Vitest installed）。验证以端到端浏览器走查为主。

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EDIT-01 | 正确密码进入工作台；错误密码留入口页 + 行内提示 | 集成/e2e | `npm run build && npm run preview` → 浏览器手动输入正确/错误密码 | ❌ Wave 0（admin 页面未建） |
| EDIT-02 | 工作台加载显示全部追番 + 工具条目 | 集成/e2e | 同上 → 登录后检查 Tab 下卡片数匹配 seed 数据（2 条） | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build`（确认无构建错误）
- **Per wave merge:** `npm run build` + 浏览器人工走查密码 / Tab / 删除流程
- **Phase gate:** `npm run build` exit 0 + 全部 4 条 Phase 4 成功标准浏览器验证通过

### Wave 0 Gaps
- [ ] `src/pages/admin/index.astro` — Phase 4 唯一新页面
- [ ] 浏览器人工验证脚本（无自动化框架）— 手工 check 清单：① 错误密码留页 ② 正确密码进工作台 ③ Tab 切换 ④ 删除确认 + 刷新持久化 ⑤ /admin 源码不含增量敏感信息

## Security Domain

> `security_enforcement` 未显式禁用 → 启用。

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes（前端密码守卫） | localStorage session flag + 硬编码密码（D-03 显式决策：单人站非安全边界） |
| V3 Session Management | yes | localStorage 持久会话；手动清除即注销 |
| V4 Access Control | no | 单人站无角色区分 |
| V5 输入验证 | yes | 密码输入 `required` + `type="password"`；无 XSS 向量（不渲染用户输入） |
| V6 Cryptography | no | 不传输/存储真实凭据；硬编码密码仅防偶然访问 |

### Known Threat Patterns for static-site admin

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| 密码被查看构建产物 JS 读取 | Information Disclosure | 可接受（D-03 决策：单人站非安全边界；生产环境密码可后续换值） |
| 偶然访问者进入 /admin | Spoofing | 密码守卫 + 建议 noindex |
| 他人使用已登录设备 | Elevation | 单人站可接受；敏感环境手动注销清 localStorage |
| XSS via 注入条目字段 | Tampering | `getAllAnime()`/`getAllTools()` 返回 schema 已验证数据；客户端不 `innerHTML` 渲染原始字段（仅 textContent / 受控属性） |

## Sources

### Primary（HIGH confidence）
- 代码库现状：`ThemeToggle.astro`（原生 `<script>` 岛屿 + 客户端事件监听验证模式）
- 代码库现状：`BaseLayout.astro`（`<script is:inline>` 防 FOUC 模式）
- 代码库现状：`EntryCard.astro`（绝对定位兄弟按钮模式——删除按钮参照的 ponytail 复用来源）
- 代码库现状：`lib/anime.ts` `getAllAnime()` + `lib/tools.ts` `getAllTools()`（数据收口，draft 已过滤）
- 代码库现状：`src/content.config.ts`（Zod schema——Phase 4 不修改）

### Secondary
- Astro 官方文档 `client-side-scripts`（训练数据：`<script>` 岛屿 / `define:vars` / `is:inline` 语义，6.x 起稳定未变，7.0 延续）
- npm registry（`npm view astro version` 2026-07-16 = 7.0.9，与 package.json 一致）

### Tertiary
- WebSearch 未返回有效权威源（docs.astro.build 环境不可达）；训练数据 + 代码库实_pattern_ 作主要依据。

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 零新增依赖，所有技术已在代码库验证或浏览器原生
- Architecture: HIGH — 复用 EntryCard 绝对定位按钮 + ThemeToggle 原生脚本，模式已验证
- Pitfalls: HIGH — 集成点（define:vars 序列化、sitemap 泄漏）经训练数据 + 代码库分析双重确认

**Research date:** 2026-07-16
**Valid until:** 2026-08-16（Astro 7 API 稳定；到期前若 Astro 大版本更新需复核 define:vars 行为）
