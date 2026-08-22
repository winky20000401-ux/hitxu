import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const stats = await db.stats.getOverview();
  return NextResponse.json({ success: true, data: stats });
}
