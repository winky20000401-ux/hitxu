import { NextResponse } from 'next/server';
import { db, storageInfo } from '@/lib/db';

// 只读探活：把 lib/db.ts 里一直没人调用的 storageInfo() 暴露出来。
// 背景：findMany/findList 读取失败时静默返回空数组，站点看起来"只是没文章"，
// 真实原因（如 Supabase egress 配额 402）被吞在 lastStorageInfo 里无人问津 ——
// 2026-09-23 与 10-05 两次故障都只能靠手动复现 POST 探针才能拿到真错误。
// 有了这个端点，下次一条 curl 就能定案。
export const dynamic = 'force-dynamic';

export async function GET() {
  // 触发一次轻量查询（不含正文），让 lastStorageInfo 反映当前真实状态
  const articles = await db.articles.findList();
  const info = storageInfo();
  return NextResponse.json({
    success: true,
    data: {
      articles: articles.length,
      source: info.source,
      configured: info.configured,
      error: info.error || null,
      checkedAt: new Date().toISOString(),
    },
  });
}
