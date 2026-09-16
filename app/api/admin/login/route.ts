import { NextResponse } from 'next/server';
import { CSRF_COOKIE, createCsrfToken, credentialsMatch, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '@/lib/admin-auth';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export async function POST(request: Request) {
  try {
    const key = clientKey(request);
    const now = Date.now();
    const current = attempts.get(key);
    if (current && current.resetAt > now && current.count >= MAX_ATTEMPTS) {
      return NextResponse.json({ success: false, message: '嘗試次數過多，請 15 分鐘後再試' }, { status: 429 });
    }

    const { username, password } = await request.json();

    if (credentialsMatch(username, password)) {
      attempts.delete(key);
      const csrf = createCsrfToken();
      const response = NextResponse.json({ success: true, message: '登入成功' });
      response.cookies.set({
        name: SESSION_COOKIE,
        value: 'authenticated_admin',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: SESSION_MAX_AGE_SECONDS,
        path: '/',
      });
      response.cookies.set({ name: CSRF_COOKIE, value: csrf, httpOnly: false, secure: true, sameSite: 'strict', maxAge: SESSION_MAX_AGE_SECONDS, path: '/' });
      return response;
    }
    attempts.set(key, { count: current && current.resetAt > now ? current.count + 1 : 1, resetAt: now + WINDOW_MS });
    return NextResponse.json({ success: false, message: '帳號或密碼錯誤' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, message: '登入要求無效' }, { status: 400 });
  }
}
