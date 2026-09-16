import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedMutation } from '@/lib/admin-auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthorizedMutation(request)) return NextResponse.json({ success: false, message: '未授權請求' }, { status: 403 });
  try {
    const body = await request.json();
    const { coverImage, title, summary, content, type, category } = body || {};
    const updated = await db.articles.update(params.id, {
      coverImage, title, summary, content, type, category,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthorizedMutation(request)) return NextResponse.json({ success: false, message: '未授權請求' }, { status: 403 });
  try {
    await db.articles.delete(params.id);
    return NextResponse.json({ success: true, message: 'Article deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Delete failed' }, { status: 500 });
  }
}
