import { ARTICLES } from '@/lib/data';
import ArticleCard from '@/components/ArticleCard';

export default function GuidesPage() {
  const guides = ARTICLES.filter(a => a.type === 'guide');

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold text-white">Game Guides & Tutorials</h1>
        <p className="text-slate-400 text-sm mt-1">Master strategies, hero builds, and tactical gameplay tips.</p>
      </div>

      <div className="space-y-4">
        {guides.map((art) => (
          <ArticleCard key={art.id} article={art} />
        ))}
      </div>
    </main>
  );
}
