import type { Article } from './data';

export const SITE_URL = 'https://www.gitxu.com';

export function canonical(path: string): string {
  return `${SITE_URL}${path}`;
}

/**
 * 新闻/攻略列表页（含分页）的统一 metadata：
 * 独立 title / description + self-referencing canonical，
 * 消除此前四个页面共用同一 title、无 canonical 的问题。
 */
export function articleListMetadata(opts: {
  kind: 'news' | 'guide';
  page: number;
}): {
  title: string;
  description: string;
  alternates: { canonical: string };
} {
  const pageSuffix = opts.page > 1 ? ` - Page ${opts.page}` : '';
  const path =
    opts.kind === 'news'
      ? opts.page > 1
        ? `/news/page/${opts.page}`
        : '/news'
      : opts.page > 1
        ? `/guides/page/${opts.page}`
        : '/guides';

  if (opts.kind === 'news') {
    return {
      title: `Game News & Updates${pageSuffix} | GitGame`,
      description:
        'Latest gaming industry news, patch notes, release dates and trailers — curated and updated daily.' +
        (opts.page > 1 ? ` Browse page ${opts.page}.` : ''),
      alternates: { canonical: canonical(path) },
    };
  }
  return {
    title: `Game Guides & Tutorials${pageSuffix} | GitGame`,
    description:
      'In-depth game guides, walkthroughs, builds and strategy tips for popular PC, console and mobile titles.' +
      (opts.page > 1 ? ` Browse page ${opts.page}.` : ''),
    alternates: { canonical: canonical(path) },
  };
}
