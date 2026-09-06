export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import ArticleListPage from '@/components/ArticleListPage';
import { articleListMetadata } from '@/lib/seo';

export const metadata: Metadata = articleListMetadata({ kind: 'news', page: 1 });

export default function NewsIndexPage() {
  return <ArticleListPage kind="news" page={1} />;
}
