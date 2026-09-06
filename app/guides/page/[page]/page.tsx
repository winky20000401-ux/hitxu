export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import ArticleListPage from '@/components/ArticleListPage';
import { articleListMetadata } from '@/lib/seo';

type Params = { params: { page: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const page = Number(params.page);
  if (!Number.isInteger(page) || page < 2) return { title: 'Not Found | GitGame' };
  return articleListMetadata({ kind: 'guide', page });
}

export default async function GuidesPaginatedPage({ params }: Params) {
  const page = Number(params.page);
  if (!Number.isInteger(page) || page < 1) notFound();
  if (page === 1) permanentRedirect('/guides');
  return <ArticleListPage kind="guide" page={page} />;
}
