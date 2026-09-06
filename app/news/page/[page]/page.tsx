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
  return articleListMetadata({ kind: 'news', page });
}

export default async function NewsPaginatedPage({ params }: Params) {
  const page = Number(params.page);
  if (!Number.isInteger(page) || page < 1) notFound();
  // /news/page/1 与 /news 内容相同 → 301 收敛到规范地址
  if (page === 1) permanentRedirect('/news');
  return <ArticleListPage kind="news" page={page} />;
}
