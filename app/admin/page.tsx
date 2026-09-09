import { db } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({ searchParams }: {
  searchParams: { q?: string; page?: string };
}) {
  const stats = await db.stats.getOverview();
  const recentArticles = await db.articles.findMany();
  const recentGames = await db.games.findMany();
  const query = typeof searchParams.q === 'string' ? searchParams.q.trim().slice(0, 200) : '';
  const matchedArticles = recentArticles.filter(article =>
    [article.title, article.slug, article.summary, article.content, article.category]
      .some(value => String(value ?? '').toLowerCase().includes(query.toLowerCase()))
  );
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(matchedArticles.length / pageSize));
  const requestedPage = Number(searchParams.page);
  const page = Math.min(totalPages, Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1);
  const visibleArticles = matchedArticles.slice((page - 1) * pageSize, page * pageSize);
  const pageHref = (target: number) => {
    const params = new URLSearchParams({ page: String(target) });
    if (query) params.set('q', query);
    return `/admin?${params.toString()}#dashboard-articles`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">後台數據概覽 (Dashboard)</h1>
        <p className="text-sm text-slate-400 mt-1">即時查看門戶內容統計與玩家互動數據</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">總上架小遊戲</div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{stats.totalGames}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">總遊戲試玩次數</div>
          <div className="text-2xl font-black text-teal-400 mt-2">{stats.totalPlays.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">已發布新聞與攻略</div>
          <div className="text-2xl font-black text-sky-400 mt-2">{stats.totalArticles}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">文章總閱讀量</div>
          <div className="text-2xl font-black text-purple-400 mt-2">{stats.totalViews.toLocaleString()}</div>
        </div>
      </div>

      {/* Quick Action Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Games Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base">現有小遊戲列表</h3>
            <Link href="/admin/games" className="text-xs text-emerald-400 hover:underline">+ 新增遊戲</Link>
          </div>
          <div className="divide-y divide-slate-800">
            {recentGames.map(game => (
              <div key={game.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-slate-200">{game.title}</div>
                  <div className="text-xs text-slate-500">{game.category} • {game.playCount.toLocaleString()} plays</div>
                </div>
                <Link href={`/games/${game.slug}`} target="_blank" className="text-xs text-slate-400 hover:text-emerald-400">
                  預覽 ↗
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Articles Table */}
        <div id="dashboard-articles" className="bg-slate-900 border border-slate-800 rounded-xl p-6 scroll-mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base">最新發布文章</h3>
            <Link href="/admin/articles" className="text-xs text-emerald-400 hover:underline">+ 發布文章</Link>
          </div>
          <form action="/admin#dashboard-articles" className="flex flex-wrap gap-2 mb-4">
            <input name="q" type="search" defaultValue={query} key={query} maxLength={200}
              aria-label="搜尋文章" placeholder="搜尋標題、Slug、摘要或正文"
              className="min-w-0 flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
            <button type="submit" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950">搜尋</button>
            {query && <Link href="/admin#dashboard-articles" className="text-sm text-slate-400 self-center">清除</Link>}
          </form>
          <p className="text-xs text-slate-400 mb-3" role="status">共 {matchedArticles.length} 篇 · 每頁 {pageSize} 篇 · 第 {page} / {totalPages} 頁</p>
          <div className="divide-y divide-slate-800">
            {visibleArticles.map(art => (
              <div key={art.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-slate-200">{art.title}</div>
                  <div className="text-xs text-slate-500">{art.type.toUpperCase()} • {art.views.toLocaleString()} views</div>
                </div>
                <Link href={`/news/${art.slug}`} target="_blank" className="text-xs text-slate-400 hover:text-emerald-400">
                  預覽 ↗
                </Link>
              </div>
            ))}
            {visibleArticles.length === 0 && <p className="py-6 text-sm text-slate-400">沒有找到符合條件的文章，請更換關鍵字。</p>}
          </div>
          <nav aria-label="儀表盤文章分頁" className="flex flex-wrap items-center justify-between gap-3 mt-4 text-sm">
            {page > 1 ? <Link href={pageHref(page - 1)} className="text-emerald-400">上一頁</Link> : <span className="text-slate-600">上一頁</span>}
            <form action="/admin#dashboard-articles" className="flex items-center gap-2">
              {query && <input type="hidden" name="q" value={query} />}
              <label htmlFor="dashboard-page" className="text-slate-400">跳至</label>
              <input id="dashboard-page" type="number" name="page" min={1} max={totalPages} defaultValue={page} key={page}
                className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1" />
              <button type="submit" className="text-emerald-400">前往</button>
            </form>
            {page < totalPages ? <Link href={pageHref(page + 1)} className="text-emerald-400">下一頁</Link> : <span className="text-slate-600">下一頁</span>}
          </nav>
        </div>
      </div>
    </div>
  );
}
