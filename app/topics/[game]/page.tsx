export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import ArticleCard from '@/components/ArticleCard';
import { TOPICS, activeTopics } from '@/lib/topics';

type Params = { params: { game: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const topic = TOPICS.find((t) => t.slug === params.game);
  if (!topic) return { title: 'Topic Not Found | GitGame' };
  return {
    title: `${topic.name} News, Guides & Updates | GitGame`,
    description: topic.blurb,
    alternates: { canonical: `https://www.gitxu.com/topics/${topic.slug}` },
  };
}

export default async function TopicPage({ params }: Params) {
  const topic = TOPICS.find((t) => t.slug === params.game);
  if (!topic) notFound();

  const articles = await db.articles.findMany();
  // 与 activeTopics 保持同一阈值：不足 5 篇的主题不提供可索引页面
  const active = activeTopics(articles).find((t) => t.topic.slug === topic.slug);
  if (!active) notFound();

  const sorted = [...active.articles].sort((a, b) =>
    (b.publishedAtISO || '').localeCompare(a.publishedAtISO || '')
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* JSON-LD：CollectionPage 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${topic.name} - GitGame`,
            description: topic.blurb,
            url: `https://www.gitxu.com/topics/${topic.slug}`,
          }),
        }}
      />

      <div className="border-b border-slate-800 pb-4">
        <div className="text-xs text-slate-400 flex items-center space-x-2 mb-3">
          <Link href="/" className="hover:text-emerald-400">Home</Link>
          <span>/</span>
          <Link href="/topics" className="hover:text-emerald-400">Topics</Link>
          <span>/</span>
          <span className="text-slate-200">{topic.name}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">{topic.name}</h1>
        <p className="text-slate-400 text-sm mt-1">{topic.blurb}</p>
        <p className="text-xs text-slate-500 mt-2">{active.count} articles, newest first</p>
      </div>

      <div className="space-y-4">
        {sorted.map((art) => (
          <ArticleCard key={art.id} article={art} />
        ))}
      </div>
    </main>
  );
}
