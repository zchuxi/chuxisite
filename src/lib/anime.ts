import { getCollection } from 'astro:content';

// 追番状态展示排序：在看 → 想看 → 看完。
const STATUS_ORDER: Record<'watching' | 'plan' | 'done', number> = {
  watching: 0,
  plan: 1,
  done: 2,
};

// 单一 slug 派生出口（encodeURIComponent；与 lib/tools.ts 同模式）。
// 页面/组件禁用内联 encodeURIComponent。
export function slugOf(titleCn: string): string {
  return encodeURIComponent(titleCn);
}

// 薄封装：页面一律经此读取番剧，不直接 getCollection（保番剧换源可插拔，为 Bangumi API 迁移铺路）。
// 过滤 draft 私稿，按 status(watching→plan→done) 排序。
export async function getAllAnime() {
  const raw = await getCollection('anime', ({ data }) => !data.draft);
  return raw.sort((a, b) => STATUS_ORDER[a.data.status] - STATUS_ORDER[b.data.status]);
}

// 按状态静态筛选：复用 getAllAnime() 的 draft 过滤 + status 排序，单一收口（D-01）。
export async function getAnimeByStatus(
  status: 'watching' | 'done' | 'plan',
  opts: { excludeSlug?: string } = {},
) {
  const all = await getAllAnime();
  return all.filter(
    (a) => a.data.status === status && slugOf(a.data.titleCn) !== opts.excludeSlug,
  );
}

// 按 genre 筛选：入参与 schema transform lowercase 对齐。
export async function getAnimeByGenre(genre: string) {
  const target = genre.toLowerCase();
  return (await getAllAnime()).filter((a) => a.data.genre.includes(target));
}
