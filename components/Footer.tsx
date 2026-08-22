import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-sm py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="text-xl font-black text-emerald-400 mb-3">HitXu</div>
          <p className="text-xs text-slate-500">Discover great games, read latest updates, and enjoy instant-play H5 games anytime.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Sections</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/games" className="hover:text-emerald-400">Online Mini Games</Link></li>
            <li><Link href="/news" className="hover:text-emerald-400">Game News</Link></li>
            <li><Link href="/guides" className="hover:text-emerald-400">Game Guides</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Categories</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/games?cat=puzzle" className="hover:text-emerald-400">Puzzle Games</Link></li>
            <li><Link href="/games?cat=casual" className="hover:text-emerald-400">Casual & Arcade</Link></li>
            <li><Link href="/games?cat=strategy" className="hover:text-emerald-400">Strategy & RPG</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#" className="hover:text-emerald-400">Terms of Service</a></li>
            <li><a href="#" className="hover:text-emerald-400">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-emerald-400">Developer Submit</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-slate-800/60 text-center text-xs text-slate-500">
        © 2026 HitXu · Discover Great Games
      </div>
    </footer>
  );
}
