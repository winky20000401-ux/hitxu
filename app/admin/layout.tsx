import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⚙️</span>
            <span className="font-bold text-lg text-emerald-400">Admin CMS</span>
          </div>

          <nav className="space-y-2 text-sm font-medium">
            <Link
              href="/admin"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-slate-800 text-emerald-400 hover:bg-slate-700 transition"
            >
              <span>📊</span>
              <span>Dashboard 儀表盤</span>
            </Link>
            <Link
              href="/admin/articles"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <span>📝</span>
              <span>文章與攻略管理</span>
            </Link>
            <Link
              href="/admin/games"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <span>🕹️</span>
              <span>H5 小遊戲管理</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500">
          <Link href="/" className="text-emerald-400 hover:underline">← 返回前台首頁</Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
