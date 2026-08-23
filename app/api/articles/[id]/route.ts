import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
