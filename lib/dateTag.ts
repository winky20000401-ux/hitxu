/**
 * 当天日期标签：等价于 CMS 模板函数 {dr_date(time(),'m月d日')} 的英文站版本。
 *
 * 注意时区：Vercel 服务器跑在 UTC，直接用 new Date() 会在每天 08:00 前
 * 显示前一天的日期，所以强制按 Asia/Shanghai 取值。
 */
const TZ = 'Asia/Shanghai';

const MONTH_DAY = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  month: 'short',
  day: 'numeric',
});

/** → "Updated Sep 9" */
export function updatedTag(now: Date = new Date()): string {
  return `Updated ${MONTH_DAY.format(now)}`;
}

/** → "9月9日"（中文站 / 需要中文时的等价物） */
export function updatedTagZh(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: TZ,
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);
  const month = parts.find((p) => p.type === 'month')?.value ?? '';
  const day = parts.find((p) => p.type === 'day')?.value ?? '';
  return `${month}月${day}日`;
}
