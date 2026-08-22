import { ARTICLES } from '@/lib/data';
import ArticleCard from '@/components/ArticleCard';

export default function NewsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold text-white">Game News & Updates</h1>
        <p className="text-slate-400 text-sm mt-1">Stay updated with the latest gaming industry news, patches, and releases.</p>
      </div>

      <div className="space-y-4">
        {ARTICLES.map((art) => (
          <ArticleCard key={art.id} article={art} />
        ))}
      </div>
    </main>
  );
}
