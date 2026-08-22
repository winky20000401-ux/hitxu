import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const games = await db.games.findMany();
  return NextResponse.json({ success: true, data: games });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, description, category, coverImage, gameUrl, featured } = body;

    if (!title || !slug || !gameUrl) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const newGame = await db.games.create({
      title,
      slug,
      description: description || '',
      category: category || 'Casual',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80',
      gameUrl,
      featured: Boolean(featured),
    });

    return NextResponse.json({ success: true, data: newGame }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
