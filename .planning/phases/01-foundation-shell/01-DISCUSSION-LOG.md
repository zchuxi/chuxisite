# Phase 1: 站点地基与二次元外壳 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-14
**Phase:** 1-站点地基与二次元外壳
**Areas discussed:** 站点名称与标语, 部署平台与域名, 种子示例内容

---

## 站点名称与标语

### 站点名字
| Option | Description | Selected |
|--------|-------------|----------|
| 浏览器里的晴天/晴空小屋 | 青蓝天空感，清爽可爱 | |
| 小窝/摸鱼小窝 | 强调工具+番剧收藏的小窝感 | |
| 用我的昵称 | 昵称 + '的小站'，个人化 | |
| Other（自定义） | 用户自定义 | ✓ |

**User's choice:** 初曦的窝
**Notes:** 「初曦」呼应青蓝晨曦主色调，软萌且个人化。

### 标语风格 + 具体标语
| Option | Description | Selected |
|--------|-------------|----------|
| 功能型标语 | 一句话说清是什么 | |
| 氛围型标语 | 轻松可爱的一句话 | ✓ |
| 你拟一句 | Claude 代拟 | |

拟稿三选一：
| Option | Selected |
|--------|----------|
| 存放好用工具与心头好番的小窝✧ | |
| 收藏日常里的小光与小欢喜 | |
| 工具、番剧、和一点点生活 | ✓ |

**User's choice:** 「工具、番剧、和一点点生活」
**Notes:** 可后续随时修改。

---

## 部署平台与域名

### 部署平台
| Option | Description | Selected |
|--------|-------------|----------|
| Vercel（推荐） | 生态成熟、Astro 支持好、免费额度足 | ✓ |
| Netlify | 同样免费自动部署 | |
| GitHub Pages | 免费无需额外账号，但配置略繁 | |
| 你定 | 交给 Claude 推荐 | |

**User's choice:** Vercel

### 域名
| Option | Description | Selected |
|--------|-------------|----------|
| 先用默认域名 | 先用 xxx.vercel.app，以后再接自定义域名 | ✓ |
| 有自定义域名 | 现在就用自有域名 | |

**User's choice:** 先用默认域名
**Notes:** `site` 先填 Vercel 生产 URL，首次部署后回填/更新。

---

## 种子示例内容

### 是否预置示例内容
| Option | Description | Selected |
|--------|-------------|----------|
| 各放 1-2 条示例 | 工具/番剧各 1-2 条真实示例，验证 schema+管道，首页不空 | ✓ |
| 只放样板占位 | 仅 _example.md 样板 | |
| 不放内容 | schema 定好即可 | |

**User's choice:** 各放 1-2 条示例

### 首页模块入口现阶段点进去看到什么
| Option | Description | Selected |
|--------|-------------|----------|
| 入口可点+空状态页 | 入口卡可点，/tools 与 /anime 先做空状态占位页 | ✓ |
| 入口先不链接 | 入口卡先做展示样式，暂不链接 | |

**User's choice:** 入口可点+空状态页
**Notes:** 完整浏览属 Phase 2/3；本阶段仅保证外壳可导航、不 404。

---

## Claude's Discretion

- **数据模型字段**（用户未选此灰区）：授权 Claude 按研究蓝本落定工具/番剧两个集合的字段（详见 CONTEXT.md `Claude's Discretion`），番剧按分层设计预留 Bangumi 字段，页面经 `lib/*` 薄数据层读取。

## Deferred Ideas

- 首页「最近更新」/时间线 — v1.x（FEED-02）
- 工具库客户端搜索、组合筛选 — v2（SEARCH-01/02）
- 自定义域名接入 — 首次上线后再接
- Bangumi API 自动拉取 — v2（API-01），本阶段仅预留 schema/config
