import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: '已安全登出' });
  response.cookies.set({
    name: 'admin_session',
    value: '',
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
  return response;
}
