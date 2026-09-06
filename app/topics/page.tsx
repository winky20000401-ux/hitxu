export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { activeTopics } from '@/lib/topics';

export const metadata: Metadata = {
  title: 'Game Topics - Browse Coverage by Game & Platform | GitGame',
  description: 'Browse all GitGame news and guides grouped by game and platform — GTA, Nintendo, PlayStation, World of Warcraft and more.',
  alternates: { canonical: 'https://www.gitxu.com/topics' },
};

export default async function TopicsIndexPage() {
  const articles = await db.articles.findMany();
  const topics = activeTopics(articles);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold text-white">Game Topics</h1>
        <p className="text-slate-400 text-sm mt-1">
          All GitGame coverage grouped by game and platform. Only topics with substantial coverage get their own page.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map(({ topic, count }) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-emerald-600 transition-colors"
          >
            <h2 className="font-bold text-slate-100 group-hover:text-emerald-400">{topic.name}</h2>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{topic.blurb}</p>
            <p className="text-xs text-emerald-400 mt-2 font-semibold">{count} articles »</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
