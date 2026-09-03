import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2 text-2xl font-black tracking-wider text-emerald-400">
            <span>🎮</span>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">GitGame</span>
          </Link>
          <nav className="hidden md:flex space-x-6 text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <Link href="/games" className="hover:text-emerald-400 transition-colors">Mini Games</Link>
            <Link href="/news" className="hover:text-emerald-400 transition-colors">News</Link>
            <Link href="/guides" className="hover:text-emerald-400 transition-colors">Guides</Link>
            <Link
              href="https://wanderers-ledger.jadetan48984407.chatgpt.site"
              className="hover:text-emerald-400 transition-colors"
            >
              WWM Tools
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search games, news..."
              className="bg-slate-800 text-sm text-slate-200 rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 lg:w-64 border border-slate-700"
            />
            <span className="absolute left-3 top-2 text-xs text-slate-400">🔍</span>
          </div>
          <button className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5">Log in</button>
          <button className="text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-1.5 rounded-full transition-colors font-semibold">
            Sign up
          </button>
        </div>
      </div>
    </header>
  );
}
