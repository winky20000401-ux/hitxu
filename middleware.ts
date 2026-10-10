import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 后台只在正式域名下工作，localhost / 127.0.0.1 一律 301 回 https://gitxu.com。
 *
 * 为什么必须这样：
 *   1. lib/admin-auth.ts 的 isTrustedOrigin() 只接受 https://www.gitxu.com 与 https://gitxu.com。
 *      从 localhost 进来虽然 Chrome 会把 localhost 当 secure context 而照发 Secure cookie
 *      （所以列表读得到、看起来一切正常），但任何写操作都会被 403 挡掉。
 *   2. 相对链接（/admin/articles 等）会跟着 Host 头漂移，浏览器地址栏停在 localhost:3002，
 *      而那个端口在服务器上只绑 127.0.0.1，公网不可达 —— 下次没开隧道就是一片空白。
 *   3. 3002 是同机三服务编号（airadar 3000 / timiu 3001 / gitxu 3002），
 *      很容易被误当成本地 dev server 端口记进浏览器书签。
 */
const CANONICAL_HOST = 'gitxu.com';
const CANONICAL_ORIGIN = 'https://gitxu.com';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]', '::1']);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 非规范域名（含 localhost / 裸 IP）→ 打回正式域名，保留路径与查询串
  const hostHeader = request.headers.get('host') ?? '';
  const hostname = hostHeader.replace(/:\d+$/, '').replace(/^\[|\]$/g, '');
  if (hostname !== CANONICAL_HOST && hostname !== `www.${CANONICAL_HOST}`) {
    const target = new URL(`${CANONICAL_ORIGIN}${pathname}`);
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target, 301);
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminToken = request.cookies.get('admin_session')?.value;
    if (adminToken !== 'authenticated_admin') {
      // Reverse-proxy requests may expose the upstream origin (https://localhost:3002).
      const loginUrl = new URL('/admin/login', CANONICAL_ORIGIN);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
