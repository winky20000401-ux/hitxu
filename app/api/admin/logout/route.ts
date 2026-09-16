import { NextResponse } from 'next/server';
import { CSRF_COOKIE, isAuthorizedMutation, SESSION_COOKIE } from '@/lib/admin-auth';

export async function POST(request: Request) {
  if (!isAuthorizedMutation(request)) return NextResponse.json({ success: false, message: '未授權請求' }, { status: 403 });
  const response = NextResponse.json({ success: true, message: '已安全登出' });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
  response.cookies.set({ name: CSRF_COOKIE, value: '', maxAge: 0, path: '/' });
  return response;
}
