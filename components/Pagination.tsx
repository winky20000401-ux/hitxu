import Link from 'next/link';

/**
 * SEO 分页组件：纯服务端渲染，真实 <a href> 翻页链接，
 * Googlebot 不依赖 JS 即可从第 1 页逐层爬到最后一页。
 */
export default function Pagination({
  basePath,
  current,
  total,
}: {
  basePath: string;
  current: number;
  total: number;
}) {
  if (total <= 1) return null;

  const href = (p: number) => (p <= 1 ? basePath : `${basePath}/page/${p}`);

  // 计算展示的页码窗口：1 + 当前页前后各 1 + 末页，空隙用 … 填充
  const seen: { [p: number]: boolean } = {};
  const nums = [1, current - 1, current, current + 1, total]
    .filter((p) => p >= 1 && p <= total && (seen[p] ? false : (seen[p] = true)))
    .sort((a, b) => a - b);
  const items: (number | 'gap')[] = [];
  nums.forEach((p, i) => {
    if (i > 0 && p - nums[i - 1] > 1) items.push('gap');
    items.push(p);
  });

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center flex-wrap gap-2 pt-4">
      {current > 1 && (
        <Link
          href={href(current - 1)}
          className="px-3 py-1.5 text-sm rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-emerald-600 hover:text-emerald-400 transition-colors"
        >
          « Prev
        </Link>
      )}
      {items.map((it, i) =>
        it === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-slate-600 text-sm">
            …
          </span>
        ) : it === current ? (
          <span
            key={it}
            aria-current="page"
            className="px-3 py-1.5 text-sm rounded-lg bg-emerald-500 text-slate-950 font-bold"
          >
            {it}
          </span>
        ) : (
          <Link
            key={it}
            href={href(it)}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-emerald-600 hover:text-emerald-400 transition-colors"
          >
            {it}
          </Link>
        )
      )}
      {current < total && (
        <Link
          href={href(current + 1)}
          className="px-3 py-1.5 text-sm rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-emerald-600 hover:text-emerald-400 transition-colors"
        >
          Next »
        </Link>
      )}
    </nav>
  );
}
