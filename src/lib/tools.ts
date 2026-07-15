import { getCollection } from 'astro:content';

// 薄封装：页面一律经此读取工具，不直接 getCollection（收口数据源，便于日后演进）。
// 过滤 draft 私稿，按标题中文排序。
export async function getAllTools() {
  const raw = await getCollection('tools', ({ data }) => !data.draft);
  return raw.sort((a, b) => a.data.title.localeCompare(b.data.title, 'zh'));
}
