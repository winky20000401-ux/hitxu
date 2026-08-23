import { ARTICLES as SEED_ARTICLES, MINI_GAMES as SEED_GAMES, Article, MiniGame } from './data';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

let lastStorageInfo: { source: 'supabase' | 'seed'; error?: string } = supabaseConfigured
  ? { source: 'supabase' }
  : { source: 'seed', error: 'Supabase env vars are not set (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) — articles will NOT persist' };

export function storageInfo() {
  return { configured: supabaseConfigured, ...lastStorageInfo };
}

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80';

function toRelativeTime(value: unknown): string {
  if (typeof value !== 'string' || !value) return 'Just now';
  const t = Date.parse(value);
  if (Number.isNaN(t)) return value; // already display text (seed data)
  const mins = Math.floor((Date.now() - t) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

function mapRow(item: any): Article {
  return {
    id: String(item.id),
    slug: item.slug,
    title: item.title,
    summary: item.summary || '',
    content: item.content || '',
    type: item.type || 'news',
    category: item.category || 'General',
    coverImage: item.cover_image || item.coverImage || FALLBACK_COVER,
    publishedAt: toRelativeTime(item.published_at),
    views: item.views || 0,
  };
}

export const db = {
  articles: {
    findMany: async (): Promise<Article[]> => {
      if (!supabaseConfigured) {
        lastStorageInfo = { source: 'seed', error: 'Supabase env vars are not set (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) — articles will NOT persist' };
        return SEED_ARTICLES;
      }
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/gitxu_articles?select=*&order=created_at.desc`, {
          headers: {
            apikey: SUPABASE_KEY!,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            lastStorageInfo = { source: 'supabase' };
            return data.length > 0 ? data.map(mapRow) : SEED_ARTICLES;
          }
        }
        const errText = await res.text().catch(() => '');
        lastStorageInfo = { source: 'seed', error: `Supabase read failed: ${res.status} ${errText.slice(0, 200)}` };
      } catch (err: any) {
        lastStorageInfo = { source: 'seed', error: `Supabase read error: ${err?.message || err}` };
      }
      return SEED_ARTICLES;
    },
    findUnique: async (slug: string): Promise<Article | undefined> => {
      const all = await db.articles.findMany();
      return all.find(a => a.slug === slug || a.id === slug);
    },
    create: async (data: Omit<Article, 'id' | 'views' | 'publishedAt'>): Promise<Article> => {
      if (!supabaseConfigured) {
        throw new Error('Supabase is NOT configured — article was NOT saved. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
      }
      const newArticle: Article = {
        ...data,
        id: Date.now().toString(),
        views: 0,
        publishedAt: 'Just now',
      };
      const res = await fetch(`${SUPABASE_URL}/rest/v1/gitxu_articles`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          id: newArticle.id,
          slug: newArticle.slug,
          title: newArticle.title,
          summary: newArticle.summary,
          content: newArticle.content,
          type: newArticle.type,
          category: newArticle.category,
          cover_image: newArticle.coverImage,
          views: 0,
          published_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Supabase insert failed (${res.status}): ${errText.slice(0, 300)}`);
      }
      return newArticle;
    },
    delete: async (id: string): Promise<boolean> => {
      if (!supabaseConfigured) {
        throw new Error('Supabase is NOT configured — article was NOT deleted.');
      }
      const res = await fetch(`${SUPABASE_URL}/rest/v1/gitxu_articles?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Supabase delete failed (${res.status}): ${errText.slice(0, 200)}`);
      }
      return true;
    }
  },
  games: {
    findMany: async (): Promise<MiniGame[]> => SEED_GAMES,
    findUnique: async (slug: string): Promise<MiniGame | undefined> => SEED_GAMES.find(g => g.slug === slug || g.id === slug),
    create: async (data: Omit<MiniGame, 'id' | 'playCount'>): Promise<MiniGame> => ({ ...data, id: Date.now().toString(), playCount: 0 }),
    incrementPlay: async (slug: string): Promise<number> => {
      const game = SEED_GAMES.find(g => g.slug === slug);
      return game ? game.playCount + 1 : 1;
    }
  },
  stats: {
    getOverview: async () => {
      const articles = await db.articles.findMany();
      return {
        totalArticles: articles.length,
        totalGames: SEED_GAMES.length,
        totalPlays: SEED_GAMES.reduce((acc, g) => acc + g.playCount, 0),
        totalViews: articles.reduce((acc, a) => acc + a.views, 0)
      };
    }
  }
};
