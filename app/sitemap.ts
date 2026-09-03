import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

// 动态 sitemap：每次请求实时从 Supabase 拉全量文章，
// 新文章发布后无需重新部署即可出现在 sitemap 中
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BASE = 'https://www.gitxu.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${BASE}/news`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/guides`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/games`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
  ];

  let articles: Awaited<ReturnType<typeof db.articles.findMany>> = [];
  try {
    articles = await db.articles.findMany();
  } catch {
    // Supabase 不可用时至少返回静态路由，避免 sitemap 整体 500
  }

  const articleRoutes: MetadataRoute.Sitemap = articles
    .filter((a) => a.slug)
    .map((a) => ({
      url: `${BASE}/news/${a.slug}`,
      lastModified: a.publishedAtISO ? new Date(a.publishedAtISO) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...articleRoutes];
}
