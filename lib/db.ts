import { ARTICLES as SEED_ARTICLES, MINI_GAMES as SEED_GAMES, Article, MiniGame } from './data';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const db = {
  articles: {
    findMany: async (): Promise<Article[]> => {
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        return SEED_ARTICLES;
      }
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/gitxu_articles?select=*&order=created_at.desc`, {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            return data.map((item: any) => ({
              id: item.id,
              slug: item.slug,
              title: item.title,
              summary: item.summary || '',
              content: item.content || '',
              type: item.type || 'news',
              category: item.category || 'General',
              coverImage: item.cover_image || item.coverImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
              publishedAt: item.published_at || 'Just now',
              views: item.views || 0,
            }));
          }
        }
      } catch (err) {}
      return SEED_ARTICLES;
    },
    findUnique: async (slug: string): Promise<Article | undefined> => {
      const all = await db.articles.findMany();
      return all.find(a => a.slug === slug || a.id === slug);
    },
    create: async (data: Omit<Article, 'id' | 'views' | 'publishedAt'>): Promise<Article> => {
      const newArticle: Article = {
        ...data,
        id: Date.now().toString(),
        views: 0,
        publishedAt: 'Just now',
      };

      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/gitxu_articles`, {
            method: 'POST',
            headers: {
              apikey: SUPABASE_KEY,
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
              published_at: 'Just now',
            }),
          });
        } catch (err) {}
      }
      return newArticle;
    },
    delete: async (id: string): Promise<boolean> => {
      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/gitxu_articles?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
          });
        } catch (err) {}
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
