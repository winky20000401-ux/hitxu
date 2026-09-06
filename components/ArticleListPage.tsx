import { db } from '@/lib/db';
import ArticleCard from './ArticleCard';
import Pagination from './Pagination';
import type { Article } from '@/lib/data';

export const PAGE_SIZE = 24;

/**
 * 新闻/攻略列表页共享渲染器（含分页）。
 * 每页 24 篇，分页为真实 <a> 链接（Pagination 组件），
 * 解决此前 /news 一页倾泻全量千篇文章（3.6MB HTML）的问题。
 */
export default async function ArticleListPage({ kind, page }: { kind: 'news' | 'guide'; page: number }) {
  const articles = await db.articles.findMany();
  const list = articles.filter((a: Article) => a.type === kind);
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const slice = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const isNews = kind === 'news';
  const basePath = isNews ? '/news' : '/guides';

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold text-white">
          {isNews ? 'Game News & Updates' : 'Game Guides & Tutorials'}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {isNews
            ? 'Stay updated with the latest gaming industry news, patches, and releases.'
            : 'Master strategies, hero builds, and tactical gameplay tips.'}
        </p>
      </div>

      <div className="space-y-4">
        {slice.map((art) => (
          <ArticleCard key={art.id} article={art} />
        ))}
      </div>

      <Pagination basePath={basePath} current={safePage} total={totalPages} />
    </main>
  );
}
