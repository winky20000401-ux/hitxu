import { MINI_GAMES, CATEGORIES } from '@/lib/data';
import GameCard from '@/components/GameCard';
import Link from 'next/link';

export default function GamesCatalogPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white">Online Mini Games</h1>
        <p className="text-slate-400 text-sm mt-1">
          Pick any HTML5 game and play directly on PC or Mobile — 100% Free & No install needed.
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/games?category=${cat.slug}`}
              className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-emerald-500 hover:text-slate-950 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MINI_GAMES.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </main>
  );
}
