import Link from 'next/link';
import { CATEGORIES, ARTICLES, MINI_GAMES } from '@/lib/data';
import GameCard from '@/components/GameCard';
import ArticleCard from '@/components/ArticleCard';

export default function HomePage() {
  const news = ARTICLES.filter(a => a.type === 'news');
  const guides = ARTICLES.filter(a => a.type === 'guide');

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Search & Category Filter Section */}
      <section className="text-center py-10 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800 px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Discover Great <span className="text-emerald-400">Games & Guides</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base mb-6">
          Play instant online mini games, explore in-depth walkthroughs, and catch up on the latest gaming headlines.
        </p>

        {/* Categories Bar */}
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/games?category=${cat.slug}`}
              className="text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition-colors border border-slate-700/60"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Online Mini Games Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🕹️</span> Instant Mini Games
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Play directly in your browser without downloads</p>
          </div>
          <Link href="/games" className="text-sm text-emerald-400 hover:underline font-semibold">
            View All »
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MINI_GAMES.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Game News & Guides Dual Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Game News Column */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📰</span> Latest Game News
            </h2>
            <Link href="/news" className="text-xs text-emerald-400 hover:underline">
              View all »
            </Link>
          </div>
          <div className="space-y-4">
            {ARTICLES.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        {/* Game Guides Column */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📚</span> Pro Game Guides
            </h2>
            <Link href="/guides" className="text-xs text-emerald-400 hover:underline">
              View all »
            </Link>
          </div>
          <div className="space-y-4">
            {ARTICLES.slice().reverse().map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
