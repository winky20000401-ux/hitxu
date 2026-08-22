import Link from 'next/link';
import { Article } from '@/lib/data';

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 hover:border-slate-700 transition-all"
    >
      <div className="sm:w-44 aspect-video sm:aspect-square rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{article.category}</span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-xs text-slate-500">{article.publishedAt}</span>
          </div>
          <h3 className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors text-base line-clamp-2">
            {article.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {article.summary}
          </p>
        </div>
        <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
          <span>{article.views.toLocaleString()} views</span>
          <span className="text-slate-400 group-hover:text-emerald-400 transition-colors">Read article →</span>
        </div>
      </div>
    </Link>
  );
}
