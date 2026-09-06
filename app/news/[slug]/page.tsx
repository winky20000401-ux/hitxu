import { db } from '@/lib/db';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import type { Article } from '@/lib/data';
import { topTitleTokens } from '@/lib/related';
import { articleTopics } from '@/lib/topics';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = 'https://www.gitxu.com';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await db.articles.findUnique(params.slug);
  if (!article) return { title: 'Article Not Found | GitXu' };
  const description = (article.summary || article.title).slice(0, 160);
  return {
    title: `${article.title} | GitXu`,
    description,
    alternates: { canonical: `${SITE_URL}/news/${article.slug}` },
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      url: `${SITE_URL}/news/${article.slug}`,
      images: article.coverImage ? [{ url: article.coverImage }] : undefined,
      publishedTime: article.publishedAtISO,
    },
  };
}

function ArticleLink({ article }: { article: Article }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="block bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-emerald-700 transition-colors"
    >
      <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1.5">
        {article.category}
      </div>
      <h4 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2">
        {article.title}
      </h4>
      {article.summary && (
        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{article.summary}</p>
      )}
    </Link>
  );
}

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const article = await db.articles.findUnique(params.slug);

  if (!article) {
    notFound();
  }

  // findUnique 兼容按数字 id 命中（旧接口用法）。正式 URL 只认 slug：
  // 用 id 访问时 301 收敛到规范地址，避免同内容双 URL
  if (article.slug && params.slug !== article.slug) {
    permanentRedirect(`/news/${article.slug}`);
  }

  // 内链网络（P1 主题化）：先按标题 token 检索同主题文章（跨全库），
  // 不足 6 篇再用同类型最新文章补齐；侧栏仍为全站最新 8 篇。
  // 全部 <a> 直出供爬虫沿文章间抓取。
  const tokens = topTitleTokens(article.title);
  const [topicHits, sameType, latest] = await Promise.all([
    tokens.length > 0
      ? db.articles.searchByTitle({ tokens, excludeSlug: article.slug, limit: 12 })
      : Promise.resolve([] as Article[]),
    db.articles.findRecent({ excludeSlug: article.slug, type: article.type, limit: 12 }),
    db.articles.findRecent({ excludeSlug: article.slug, limit: 8 }),
  ]);
  const seenSlugs = new Set<string>([article.slug]);
  const related: Article[] = [];
  for (const a of [...topicHits, ...sameType]) {
    if (related.length >= 6) break;
    if (a.slug && !seenSlugs.has(a.slug)) {
      seenSlugs.add(a.slug);
      related.push(a);
    }
  }
  const topics = articleTopics(article);

  const paragraphs = (article.content || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const publishedISO = article.publishedAtISO || undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: (article.summary || article.title).slice(0, 200),
    image: article.coverImage ? [article.coverImage] : undefined,
    datePublished: publishedISO,
    dateModified: publishedISO,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/news/${article.slug}`,
    },
    author: {
      '@type': 'Person',
      name: 'Xu Weixian',
    },
    publisher: {
      '@type': 'Organization',
      name: 'GitXu',
    },
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 正文主栏 */}
        <article className="lg:col-span-2 space-y-6">
          <div className="text-xs text-slate-400 flex items-center flex-wrap space-x-2">
            <Link href="/" className="hover:text-emerald-400">Home</Link>
            <span>/</span>
            <Link href={article.type === 'guide' ? '/guides' : '/news'} className="hover:text-emerald-400">
              {article.type === 'guide' ? 'Guides' : 'News'}
            </Link>
            <span>/</span>
            <span className="text-slate-200">{article.title}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-950 text-emerald-400 rounded-full border border-emerald-800/40">
                {article.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {article.title}
              </h1>
              <div className="text-xs text-slate-400 flex items-center space-x-4 pt-2 border-b border-slate-800 pb-4">
                <span>Published: {article.publishedAt}</span>
                <span>•</span>
                <span>{article.views.toLocaleString()} Views</span>
              </div>
            </div>

            <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-800">
              <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
            </div>

            <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
              {article.summary && (
                <p className="font-semibold text-slate-200 text-lg border-l-4 border-emerald-500 pl-4">
                  {article.summary}
                </p>
              )}
              {paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* 主题聚合入口：把同类内容收拢到 /topics 页，构成 首页→主题→文章 层级 */}
          {topics.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500">More on:</span>
              {topics.map((t) => (
                <Link
                  key={t.slug}
                  href={`/topics/${t.slug}`}
                  className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:border-emerald-600 hover:text-emerald-400 transition-colors"
                >
                  {t.name} »
                </Link>
              ))}
            </div>
          )}

          {/* 相关文章（同类型） */}
          {related.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-white mb-4">
                {article.type === 'guide' ? '📚 Related Guides' : '📰 Related Articles'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {related.map((a) => (
                  <ArticleLink key={a.id} article={a} />
                ))}
              </div>
            </section>
          )}
        </article>

        {/* 侧栏：全站最新发布 —— 新文章发布后立刻获得全站内链入口 */}
        <aside className="lg:col-span-1">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 lg:sticky lg:top-6">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span>🆕</span> Latest Articles
            </h2>
            <ul className="space-y-3">
              {latest.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/news/${a.slug}`}
                    className="text-sm text-slate-300 hover:text-emerald-400 leading-snug line-clamp-2 transition-colors"
                  >
                    {a.title}
                  </Link>
                  <div className="text-[11px] text-slate-500 mt-0.5">{a.publishedAt}</div>
                </li>
              ))}
            </ul>
            <Link
              href="/news"
              className="block mt-5 text-center text-xs text-emerald-400 hover:underline font-semibold"
            >
              View all articles »
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
