import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

// 动态 sitemap：每次请求实时从 Supabase 拉全量文章，
// 新文章发布后无需重新部署即可出现在 sitemap 中
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BASE = 'https://www.gitxu.com';

/**
 * lastmod 取真实时间来源：
 * - 文章条目：各自 published_at（真实发布时间，不随生成时刻刷新）
 * - 首页 / /news / /guides：对应内容集的最新发布时间（内容没更新就不变）
 * - /games：静态小游戏页，与文章无关 → 不输出 lastmod（可选字段，宁缺毋假）
 */
function latestISO(articles: { publishedAtISO?: string }[]): string | undefined {
  let latest: number | undefined;
  for (const a of articles) {
    if (!a.publishedAtISO) continue;
    const t = Date.parse(a.publishedAtISO);
    if (!Number.isNaN(t) && (latest === undefined || t > latest)) latest = t;
  }
  return latest !== undefined ? new Date(latest).toISOString() : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: Awaited<ReturnType<typeof db.articles.findMany>> = [];
  try {
    articles = await db.articles.findMany();
  } catch {
    // Supabase 不可用时至少返回静态路由，避免 sitemap 整体 500
  }

  const news = articles.filter((a) => a.type === 'news');
  const guides = articles.filter((a) => a.type === 'guide');

  const homeLastmod = latestISO(articles);
  const newsLastmod = latestISO(news);
  const guidesLastmod = latestISO(guides);

  const staticRoutes: MetadataRoute.Sitemap = [
    homeLastmod
      ? { url: `${BASE}/`, lastModified: new Date(homeLastmod), changeFrequency: 'hourly', priority: 1 }
      : { url: `${BASE}/`, changeFrequency: 'hourly', priority: 1 },
    newsLastmod
      ? { url: `${BASE}/news`, lastModified: new Date(newsLastmod), changeFrequency: 'hourly', priority: 0.9 }
      : { url: `${BASE}/news`, changeFrequency: 'hourly', priority: 0.9 },
    guidesLastmod
      ? { url: `${BASE}/guides`, lastModified: new Date(guidesLastmod), changeFrequency: 'hourly', priority: 0.9 }
      : { url: `${BASE}/guides`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/games`, changeFrequency: 'daily', priority: 0.7 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles
    .filter((a) => a.slug)
    .map((a) => ({
      url: `${BASE}/news/${a.slug}`,
      lastModified: a.publishedAtISO ? new Date(a.publishedAtISO) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  // 注：文章量 < 5 万，单文件即可；若未来过万，
  // 在此按月份切分并新增 sitemap index（/sitemap-news-N.xml），勿重复造轮子。
  return [...staticRoutes, ...articleRoutes];
}
