import rss from '@astrojs/rss';
import { getAllTools } from '../lib/tools';
import { getAllAnime, slugOf } from '../lib/anime';

export async function GET() {
  const tools = await getAllTools();
  const anime = await getAllAnime();
  const items = [
    ...tools.map((t) => ({
      title: t.data.title,
      description: t.data.summary,
      link: `/tools/${slugOf(t.data.title)}/`,
      pubDate: new Date(),
    })),
    ...anime.map((a) => ({
      title: a.data.titleCn,
      description: a.data.comment || a.data.titleCn,
      link: `/anime/${slugOf(a.data.titleCn)}/`,
      pubDate: new Date(),
    })),
  ];
  return rss({
    title: 'Chuxi · 工具库与追番记录',
    description: '我收藏的好用工具与追番记录',
    site: 'https://chuxisite.vercel.app',
    items,
  });
}
