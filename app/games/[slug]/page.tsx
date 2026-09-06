import type { Metadata } from 'next';
import { MINI_GAMES } from '@/lib/data';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const game = MINI_GAMES.find((g) => g.slug === params.slug);
  if (!game) return { title: 'Game Not Found | GitGame' };
  return {
    title: `${game.title} - Play Free Online | GitGame`,
    description: (game.description || `Play ${game.title} free in your browser, no download needed.`).slice(0, 160),
    alternates: { canonical: `https://www.gitxu.com/games/${game.slug}` },
  };
}

export default function PlayGamePage({ params }: { params: { slug: string } }) {
  const game = MINI_GAMES.find((g) => g.slug === params.slug);

  if (!game) {
    notFound();
  }

  const relatedGames = MINI_GAMES.filter((g) => g.slug !== game.slug);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-400 flex items-center space-x-2">
        <Link href="/" className="hover:text-emerald-400">Home</Link>
        <span>/</span>
        <Link href="/games" className="hover:text-emerald-400">Games</Link>
        <span>/</span>
        <span className="text-slate-200">{game.title}</span>
      </div>

      {/* Main Game Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-white">{game.title}</h1>
            <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded border border-emerald-800/40">
              {game.category}
            </span>
          </div>
          <div className="text-xs text-slate-400 flex items-center space-x-4">
            <span>▶ {game.playCount.toLocaleString()} Plays</span>
          </div>
        </div>

        {/* iFrame Game Screen */}
        <div className="relative w-full aspect-[4/3] sm:aspect-video bg-black flex items-center justify-center">
          <iframe
            src={game.gameUrl}
            className="w-full h-full border-0"
            allow="fullscreen; keyboard; autoplay"
            title={game.title}
          />
        </div>

        {/* Game Details & Description */}
        <div className="p-6 space-y-4">
          <h2 className="text-base font-bold text-white">About the Game & Controls</h2>
          <p className="text-slate-300 text-sm leading-relaxed">{game.description}</p>
        </div>
      </div>

      {/* Related Games */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">You Might Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {relatedGames.map((rg) => (
            <Link
              key={rg.id}
              href={`/games/${rg.slug}`}
              className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center space-x-3 hover:border-emerald-500/40 transition-colors"
            >
              <img src={rg.coverImage} alt={rg.title} className="w-16 h-12 object-cover rounded-lg" />
              <div>
                <h4 className="text-sm font-semibold text-white">{rg.title}</h4>
                <span className="text-xs text-slate-500">{rg.category}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
