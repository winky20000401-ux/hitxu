export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import ArticleListPage from '@/components/ArticleListPage';
import { articleListMetadata } from '@/lib/seo';

export const metadata: Metadata = articleListMetadata({ kind: 'guide', page: 1 });

export default function GuidesIndexPage() {
  return <ArticleListPage kind="guide" page={1} />;
}
