import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { activeTopics } from '@/lib/topics';

// sitemap 走 5 分钟 ISR，不走 force-dynamic。
// 历史：Supabase 时代每次被爬取都全量拉文章，是 egress 被烧穿的主因之一
//（2026-09-23 / 10-05 两次超限），当时只能靠拉长 revalidate 续命。
// 现在数据在**本机 SQLite**，读取不再有任何配额成本，全表扫描是毫秒级，
// 因此把 3600 收回 300 —— 新文章 5 分钟内进 sitemap，对收录更友好。
export const revalidate = 300;

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
  // 只要 slug/标题/分类/时间做 URL 与 lastmod，正文一律不拉
  let articles: Awaited<ReturnType<typeof db.articles.findList>> = [];
  try {
    articles = await db.articles.findList();
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

  // 主题聚合页：只收录文章量达标（≥5 篇）的主题，薄页不进 sitemap
  const topics = activeTopics(articles);
  const topicRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/topics`, changeFrequency: 'daily', priority: 0.6 },
  ];
  for (const t of topics) {
    const lm = latestISO(t.articles);
    topicRoutes.push({
      url: `${BASE}/topics/${t.topic.slug}`,
      ...(lm ? { lastModified: new Date(lm) } : {}),
      changeFrequency: 'daily',
      priority: t.count >= 20 ? 0.7 : 0.6,
    });
  }

  // 注：文章量 < 5 万，单文件即可；若未来过万，
  // 在此按月份切分并新增 sitemap index（/sitemap-news-N.xml），勿重复造轮子。
  return [...staticRoutes, ...topicRoutes, ...articleRoutes];
}
