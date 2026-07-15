import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// 工具库集合：链接 + 一句话描述 + 标签 + 单选分类；优缺点/心得写 MDX 正文，不进 schema（v1 保持轻量）。
const tools = defineCollection({
  loader: glob({ base: './src/content/tools', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      url: z.string().url(),
      summary: z.string(),
      tags: z.array(z.string()).default([]),
      category: z.string(),
      cover: image().optional(),
      draft: z.boolean().default(false),
    }),
});

// 番剧集合：分层设计，为未来 Bangumi API 迁移铺路（P1）。
const anime = defineCollection({
  loader: glob({ base: './src/content/anime', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      // —— 客观元数据组（未来可被 Bangumi API 覆盖；一律 .optional()，不用 .default()，
      //    避免把手动值伪装成客观值）——
      bgmId: z.number().optional(),
      titleJa: z.string().optional(),
      titleCn: z.string(),
      cover: z.union([image(), z.string().url()]).optional(), // image() 放前，兼容本地/远程
      episodes: z.number().optional(),
      airDate: z.coerce.date().optional(),
      // —— 追番状态组（永远手动）——
      status: z.enum(['watching', 'done', 'plan']),
      myRating: z.number().min(0).max(10).optional(),
      progress: z.number().default(0),
      comment: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { tools, anime };
