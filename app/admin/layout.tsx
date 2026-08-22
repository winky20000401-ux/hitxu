'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    if (!confirm('確認登出管理員？')) return;
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⚙️</span>
            <span className="font-bold text-lg text-emerald-400">HitXu CMS</span>
          </div>

          <nav className="space-y-2 text-sm font-medium">
            <Link
              href="/admin"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                pathname === '/admin' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>📊</span>
              <span>Dashboard 儀表盤</span>
            </Link>
            <Link
              href="/admin/articles"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                pathname === '/admin/articles' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>📝</span>
              <span>文章與攻略管理</span>
            </Link>
            <Link
              href="/admin/games"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                pathname === '/admin/games' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>🕹️</span>
              <span>H5 小遊戲管理</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-3 text-xs">
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center space-x-2 text-red-400 hover:text-red-300 font-medium px-1 py-1 transition"
          >
            <span>🚪</span>
            <span>登出管理員</span>
          </button>
          <div>
            <Link href="/" className="text-emerald-400 hover:underline">← 返回前台首頁</Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
