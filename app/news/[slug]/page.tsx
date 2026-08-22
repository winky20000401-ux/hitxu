import { ARTICLES } from '@/lib/data';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const article = ARTICLES.find((a) => a.slug === params.slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="text-xs text-slate-400 flex items-center space-x-2">
        <Link href="/" className="hover:text-emerald-400">Home</Link>
        <span>/</span>
        <Link href="/news" className="hover:text-emerald-400">News & Guides</Link>
        <span>/</span>
        <span className="text-slate-200">{article.title}</span>
      </div>

      <article className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-6">
        <div className="space-y-3">
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-950 text-emerald-400 rounded-full border border-emerald-800/40">
            {article.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            {article.title}
          </h1>
          <div className="text-xs text-slate-400 flex items-center space-x-4 pt-2 border-b border-slate-800 pb-4">
            <span>Published: {article.publishedAt}</span>
            <span>•</span>
            <span>{article.views.toLocaleString()} Views</span>
          </div>
        </div>

        <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-800">
          <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
          <p className="font-semibold text-slate-200 text-lg border-l-4 border-emerald-500 pl-4">
            {article.summary}
          </p>
          <p>
            Here goes the full article content. You can write rich markdown, embed video previews, add gameplay screenshots, and link to relevant mini-games.
          </p>
        </div>
      </article>
    </main>
  );
}
