import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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
  try {
    await db.articles.delete(params.id);
    return NextResponse.json({ success: true, message: 'Article deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Delete failed' }, { status: 500 });
  }
}
