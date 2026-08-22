import Link from 'next/link';
import { MiniGame } from '@/lib/data';

export default function GameCard({ game }: { game: MiniGame }) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 flex flex-col shadow-lg hover:-translate-y-1"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-slate-800">
        <img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur text-emerald-400 text-xs px-2 py-0.5 rounded font-medium">
          {game.category}
        </span>
        <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-emerald-500 text-slate-950 rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-xl">
            ▶
          </div>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors text-base">
            {game.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{game.description}</p>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>▶ {game.playCount.toLocaleString()} plays</span>
          <span className="text-emerald-400 font-medium">Play Now →</span>
        </div>
      </div>
    </Link>
  );
}
