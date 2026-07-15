import { getCollection } from 'astro:content';

// 薄封装：页面一律经此读取工具，不直接 getCollection（收口数据源，便于日后演进）。
// 过滤 draft 私稿，按标题中文排序。
export async function getAllTools() {
  const raw = await getCollection('tools', ({ data }) => !data.draft);
  return raw.sort((a, b) => a.data.title.localeCompare(b.data.title, 'zh'));
}

// 单一 slug 派生出口（planner: encodeURIComponent；CJK 与 Astro 自动 decode 对称）。
// 页面/组件禁用内联 encodeURIComponent。
export function slugOf(title: string): string {
  return encodeURIComponent(title);
}

// 分类档案：仅 filter，沿用 getAllTools() zh title 排序。
export async function getToolsByCategory(category: string) {
  return (await getAllTools()).filter((t) => t.data.category === category);
}

// 标签档案：入参与 schema transform lowercase 对齐。
export async function getToolsByTag(tag: string) {
  const target = tag.toLowerCase();
  return (await getAllTools()).filter((t) => t.data.tags.includes(target));
}

// 详情页相关工具：同 category 按 title 序取前 n、排除当前 slug。
export async function getRelated(category: string, excludeSlug: string, n = 2) {
  return (await getAllTools())
    .filter((t) => t.data.category === category && slugOf(t.data.title) !== excludeSlug)
    .slice(0, n);
}
