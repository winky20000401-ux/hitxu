import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const newPlayCount = await db.games.incrementPlay(params.slug);
  return NextResponse.json({ success: true, playCount: newPlayCount });
}
