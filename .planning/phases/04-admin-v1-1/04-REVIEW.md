# Admin v1.1 Code Review（standard depth）

**Review 范围**（3 个文件）
- `src/pages/admin/index.astro`
- `src/layouts/BaseLayout.astro`
- `src/styles/global.css`

**结果**：1 WARNING，2 INFO。无阻断级（CRITICAL / BLOCKER）问题。

---

## FINDING — WARNING

### W-1 · 密码硬编码 + 纯客户端鉴权，实质是安全剧场

**位置**：`src/pages/admin/index.astro:152-164`（`define:vars` 区块）。

**问题**
密码字符串 `chuxi-admin-2026` 被硬编码在客户端代码里，经 `define:vars` 发送到**每一位**访问者的浏览器。鉴权全部在浏览器里完成：
```js
const PW = 'chuxi-admin-2026';
…
if (val === PW) { localStorage.setItem(SESSION_KEY, '1'); … }
```
任何人在 DevTools 里 `localStorage.setItem('chuxi_admin_session','1')` 一行即绕过，完全不需要密码。对照代码注释里「防偶然访问（D-03）」的意图，当前实现提供的是**虚假的安全感**，没有任何真正的信任边界：站点是纯静态的、没有后端，被"保护"的内容（追番/工具列表）本就会随构建产物分发给所有访客——localStorage 里删条目只是妆饰性隐藏，不被删的原始数据仍然在 HTML/JS 里。

这不是一个可被利用的破绽（无敏感资源可被触及），但它**让人误以为有门槛**，属于反模式。

**建议**
- 如果只想「防偶然访问 / 不让路人一眼看到编辑入口」：删掉这套密码剧场，只保留 `<meta name="robots" content="noindex">`（已有，且足够说明意图）；在最外层说明"公开、只读、无需密码"就好，比假密码诚实。
- 如果想要**真正的**鉴权（哪怕很轻）：用能落地到信任边界的最小方案——Netlify / Vercel 的 **Password Protection / Basic Auth**（托管层一条启用，不发密码到客户端），或 Cloudflare Access。这才真的需要时才走。
- 如果硬要走客户端密码：至少不要让 `define:vars` 把明文密码塞进每个访客的资源里——把它从注释/变量名里摘掉，并在 README/代码里明确标注"此为防误触、非安全控制"，避免日后有人据此认为有真正的鉴权。

评级理由：不是 CRITICAL，因为没有可被攻破的静态站点资源，也没有越权；但保留它会让未来的维护者（或你 3am 自己）以为有保护而放松，所以值得拿出来拍板一次确认意图。

---

## FINDING — INFO（2 项，代码质量 / 健壮性）

### I-1 · 未转义的 `id` 直接塞进属性选择器

**位置**：`src/pages/admin/index.astro:230`

```js
dashboard.querySelector(`[data-delete="${id}"][data-type="${type}"]`)
```

`id` 来自内容条目 id（`a.id`，Content Collection 的文件名派生），若未来出现含 `"` 或其它 CSS 选择器元字符的 id，选择器会抛 `SyntaxError`。目前文件名机制下极低概率，但若改用用户可见字符串作 id 就会触发。

**建议**：用 `CSS.escape(id)`（原生 API）包裹转义，或换一种查找方式（例如在挂载时把节点引用存入 Map，按 `type:id` 索引 DOM 节点）。

---

### I-2 · `#edit/{type}/{slug}` 链接为占位锚点，当前无目标、无处理函数

**位置**：`src/pages/admin/index.astro:97`、`:127`

```html
href={`#edit/anime/${animeSlugOf(a.data.titleCn)}`}
href={`#edit/tools/${toolsSlugOf(t.data.title)}`}
```

页面不存在对应 id 的元素，也没有 `#hashchange` / 客户端路由。点击这些卡片只是把 `#edit/anime/foo` 写进地址栏，无任何反馈——用户看到的是"按了没反应"。Phase 7 才会上编辑页，这是预期中的占位。

**建议**：在进入 Phase 7 之前，这些锚点只造成困惑。可（a）将 `href` 改为空占位 `href="#"` 并在未来切换，或（b）在卡片旁边显式加一个 Phase 7 占位文字（如小标签"编辑（即将推出）"），避免用户以为功能已上线却点击无效。

---

## 未发现问题的部分（确认通过）

- `BaseLayout.astro`：`site` 已配置、canonical / OG URL 拼接正确、`title` 兜底逻辑、FOUC 内联脚本顺序均合理。
- `global.css`：CSS-first token、暗色覆盖、焦点可见（a11y）、prefers-reduced-motion，干净无冗余。
- `define:vars={{ adminItems }}`：只传了 4 个浅字符串字段，刻意避开了不可序列化的 `render`/`image`/`Date`/Content Entry —— 注释与实现一致，正确。
- 删除按钮的事件委托 + `e.preventDefault()` 隔离了卡片链接跳转；确认弹窗跟随删除；UI 语义（`aria-selected`、`role="alert"`）到位。
