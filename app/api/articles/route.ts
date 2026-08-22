import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const articles = await db.articles.findMany();
  return NextResponse.json({ success: true, data: articles });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, summary, content, type, category, coverImage } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const newArticle = await db.articles.create({
      title,
      slug,
      summary: summary || '',
      content,
      type: type || 'news',
      category: category || 'General',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    });

    return NextResponse.json({ success: true, data: newArticle }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
