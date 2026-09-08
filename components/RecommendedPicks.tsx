import Link from 'next/link';
import { Article } from '@/lib/data';

/**
 * 首页「随机推荐」区块：服务端组件，内容由 db.articles.findRandom 按时间窗口洗牌后给出。
 * 20 分钟窗口内所有访客（含 Googlebot）看到的是同一批，窗口一过自动换新一批。
 */
export default function RecommendedPicks({
  articles,
  windowMinutes = 20,
}: {
  articles: Article[];
  windowMinutes?: number;
}) {
  if (!articles || articles.length === 0) return null;

  return (
    <section aria-labelledby="recommended-picks-heading">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            id="recommended-picks-heading"
            className="text-2xl font-bold text-white flex items-center gap-2"
          >
            <span>✨</span> Recommended For You
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            A random mix of guides and news, refreshed every {windowMinutes} minutes
          </p>
        </div>
        <Link href="/news" className="text-sm text-emerald-400 hover:underline font-semibold">
          Browse all »
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          // 文章详情页只有 /news/<slug> 一条路由（guide 也走这里），指向 /guides/<slug> 会 404
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 flex flex-col shadow-lg hover:-translate-y-1"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-slate-800">
              <img
                src={article.coverImage}
                alt={article.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur text-emerald-400 text-xs px-2 py-0.5 rounded font-medium">
                {article.category || 'General'}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span
                  className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2 ${
                    article.type === 'guide'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-sky-500/10 text-sky-400'
                  }`}
                >
                  {article.type === 'guide' ? 'Guide' : 'News'}
                </span>
                <h3 className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors text-base line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{article.summary}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>{article.publishedAt}</span>
                <span className="text-emerald-400 font-medium">Read →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
