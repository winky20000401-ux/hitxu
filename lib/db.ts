import { ARTICLES as SEED_ARTICLES, MINI_GAMES as SEED_GAMES, Article, MiniGame } from './data';

/**
 * Tolerant URL normalizer: env values are sometimes pasted from chat UIs as
 * markdown links like "[https://xxx](https://xxx)" — extract the first valid URL.
 */
function normalizeSupabaseUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const value = raw.trim();
  if (/^https?:\/\/[^\s]+$/i.test(value)) {
    return value.replace(/\/+$/, '');
  }
  const match = value.match(/https?:\/\/[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9](?::\d+)?(?:\/[^\s)\]]*)?/i);
  return match ? match[0].replace(/\/+$/, '') : undefined;
}

const RAW_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const RAW_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_URL = normalizeSupabaseUrl(RAW_SUPABASE_URL);
const SUPABASE_KEY = RAW_SUPABASE_KEY?.trim();

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

function notConfiguredError(): string {
  if (RAW_SUPABASE_URL && !SUPABASE_URL) {
    return `SUPABASE_URL value is not a valid URL (got: ${JSON.stringify(RAW_SUPABASE_URL.slice(0, 120))}) — paste the plain URL https://ynuonowmzyivskiycmzm.supabase.co`;
  }
  return 'Supabase env vars are not set (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) — articles will NOT persist';
}

let lastStorageInfo: { source: 'supabase' | 'seed'; error?: string } = supabaseConfigured
  ? { source: 'supabase' }
  : { source: 'seed', error: notConfiguredError() };

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
    publishedAtISO: (typeof item.published_at === 'string' && item.published_at) || undefined,
    views: item.views || 0,
  };
}

export const db = {
  articles: {
    findMany: async (): Promise<Article[]> => {
      if (!supabaseConfigured) {
        lastStorageInfo = { source: 'seed', error: notConfiguredError() };
        return SEED_ARTICLES;
      }
      try {
        // PostgREST 默认单次最多返回 1000 行，Range 头放宽到 5 万，避免文章过千后被截断
        const res = await fetch(`${SUPABASE_URL}/rest/v1/gitxu_articles?select=*&order=created_at.desc`, {
          headers: {
            apikey: SUPABASE_KEY!,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            Range: '0-49999',
            Prefer: 'count=none',
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
    findRecent: async (opts: { excludeSlug?: string; type?: string; limit?: number }): Promise<Article[]> => {
      // 内链网络专用小查询：最新/相关文章，带索引条件 + limit，不拉全量
      const limit = Math.min(Math.max(opts.limit || 8, 1), 50);
      if (!supabaseConfigured) {
        let list = SEED_ARTICLES.filter(a => a.slug !== opts.excludeSlug);
        if (opts.type) list = list.filter(a => a.type === opts.type);
        return list.slice(0, limit);
      }
      const params = new URLSearchParams();
      if (opts.type) params.set('type', `eq.${opts.type}`);
      if (opts.excludeSlug) params.set('slug', `neq.${opts.excludeSlug}`);
      params.set('select', '*');
      params.set('order', 'created_at.desc');
      params.set('limit', String(limit));
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/gitxu_articles?${params.toString()}`, {
          headers: {
            apikey: SUPABASE_KEY!,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) return data.map(mapRow);
        }
      } catch {
        // 内链模块查询失败不阻塞正文渲染
      }
      return [];
    },
    findUnique: async (slug: string): Promise<Article | undefined> => {
      // 单篇直查（slug=eq），不再全量拉取上千篇
      if (!supabaseConfigured) {
        return SEED_ARTICLES.find(a => a.slug === slug || a.id === slug);
      }
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/gitxu_articles?or=(slug.eq.${encodeURIComponent(slug)},id.eq.${encodeURIComponent(slug)})&select=*&limit=1`,
          {
            headers: {
              apikey: SUPABASE_KEY!,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
            cache: 'no-store',
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            lastStorageInfo = { source: 'supabase' };
            return mapRow(data[0]);
          }
          return undefined;
        }
        lastStorageInfo = { source: 'seed', error: `Supabase single read failed: ${res.status}` };
      } catch (err: any) {
        lastStorageInfo = { source: 'seed', error: `Supabase single read error: ${err?.message || err}` };
      }
      return undefined;
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
    update: async (id: string, data: { coverImage?: string; title?: string; summary?: string; content?: string; type?: string; category?: string }): Promise<Article> => {
      if (!supabaseConfigured) {
        throw new Error('Supabase is NOT configured — article was NOT updated.');
      }
      const patch: Record<string, unknown> = {};
      if (data.coverImage !== undefined) patch.cover_image = data.coverImage;
      if (data.title !== undefined) patch.title = data.title;
      if (data.summary !== undefined) patch.summary = data.summary;
      if (data.content !== undefined) patch.content = data.content;
      if (data.type !== undefined) patch.type = data.type;
      if (data.category !== undefined) patch.category = data.category;
      if (Object.keys(patch).length === 0) {
        throw new Error('No fields to update');
      }
      const res = await fetch(`${SUPABASE_URL}/rest/v1/gitxu_articles?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Supabase update failed (${res.status}): ${errText.slice(0, 300)}`);
      }
      const rows = await res.json();
      const row = Array.isArray(rows) ? rows[0] : null;
      return row ? mapRow(row) : { id, slug: '', title: '', summary: '', content: '', type: 'news', category: 'General', coverImage: data.coverImage || '', publishedAt: 'Just now', views: 0 };
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
