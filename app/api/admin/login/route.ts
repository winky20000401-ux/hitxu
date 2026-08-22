import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const validUser = process.env.ADMIN_USERNAME || 'admin';
    const validPass = process.env.ADMIN_PASSWORD || 'admin888';

    if (username === validUser && password === validPass) {
      const response = NextResponse.json({ success: true, message: '登入成功' });
      response.cookies.set({
        name: 'admin_session',
        value: 'authenticated_admin',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      return response;
    }
    return NextResponse.json({ success: false, message: '帳號或密碼錯誤' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
