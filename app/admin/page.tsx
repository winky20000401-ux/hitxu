import { db } from '@/lib/db';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const stats = await db.stats.getOverview();
  const recentArticles = await db.articles.findMany();
  const recentGames = await db.games.findMany();

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
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base">最新發布文章</h3>
            <Link href="/admin/articles" className="text-xs text-emerald-400 hover:underline">+ 發布文章</Link>
          </div>
          <div className="divide-y divide-slate-800">
            {recentArticles.map(art => (
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
          </div>
        </div>
      </div>
    </div>
  );
}
