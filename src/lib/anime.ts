import { getCollection } from 'astro:content';

// 追番状态展示排序：在看 → 想看 → 看完。
const STATUS_ORDER: Record<'watching' | 'plan' | 'done', number> = {
  watching: 0,
  plan: 1,
  done: 2,
};

// 薄封装：页面一律经此读取番剧，不直接 getCollection（保番剧换源可插拔，为 Bangumi API 迁移铺路）。
// 过滤 draft 私稿，按 status(watching→plan→done) 排序。
export async function getAllAnime() {
  const raw = await getCollection('anime', ({ data }) => !data.draft);
  return raw.sort((a, b) => STATUS_ORDER[a.data.status] - STATUS_ORDER[b.data.status]);
}
