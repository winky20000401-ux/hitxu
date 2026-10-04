import { ARTICLES as SEED_ARTICLES, MINI_GAMES as SEED_GAMES, Article, MiniGame } from './data';

/* -------------------------------------------------------------------------- */
/*  存储后端：本地 SQLite（node-sqlite3-wasm）
 *  ==========================================================================
 *  2026-10-05 迁出 Supabase。原因：免费层按 egress 计费，本站形态是「读多写少、
 *  每次列表拉全表」，09-23 与 10-05 两次被 exceed_egress_quota 掐死，站点长期空站。
 *
 *  为什么是 node-sqlite3-wasm 而不是 better-sqlite3：
 *  目标机 CentOS 7.6（glibc 2.17 / gcc 4.8.5）两条路都堵死 ——
 *    1. 预编译二进制要 glibc ≥ 2.29 → GLIBC_2.29 not found
 *    2. 源码编译要 C++17 → g++ 4.8.5 不认 -std=gnu++17
 *  wasm 版零原生编译、零 glibc 依赖。同机 timiu.com 已跑通同一方案。
 *
 *  用 createRequire 加载，避开 Next 打包器对 wasm 资源的处理差异。
 * -------------------------------------------------------------------------- */

import path from 'node:path';
import { createRequire } from 'node:module';

const nodeRequire = createRequire(process.cwd() + '/package.json');

type SqliteDatabase = {
  run: (sql: string, ...params: unknown[]) => void;
  all: (sql: string, ...params: unknown[]) => any[];
  get: (sql: string, ...params: unknown[]) => any;
  exec?: (sql: string) => void;
};

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = process.env.DB_FILE || path.join(DATA_DIR, 'gitxu.sqlite');

let sqlite: SqliteDatabase | null = null;
let initError: string | undefined;
let initAttempted = false;

function openDatabase(): SqliteDatabase | null {
  if (initAttempted) return sqlite;
  initAttempted = true;
  try {
    const { Database: WasmDatabase } = nodeRequire('node-sqlite3-wasm') as {
      Database: new (file: string) => SqliteDatabase;
    };
    const db = new WasmDatabase(DB_FILE);
    db.run('PRAGMA journal_mode = WAL;');
    db.run('PRAGMA busy_timeout = 5000;');
    db.run(`CREATE TABLE IF NOT EXISTS gitxu_articles (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT DEFAULT '',
      content TEXT DEFAULT '',
      type TEXT DEFAULT 'news',
      category TEXT DEFAULT 'General',
      cover_image TEXT DEFAULT '',
      published_at TEXT,
      created_at TEXT,
      views INTEGER DEFAULT 0
    );`);
    // slug 唯一既是幂等写入的基础，也顺带杜绝重复 URL 被 Google 收录
    db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_gx_slug ON gitxu_articles(slug);');
    db.run('CREATE INDEX IF NOT EXISTS idx_gx_type_created ON gitxu_articles(type, created_at DESC);');
    db.run('CREATE INDEX IF NOT EXISTS idx_gx_created ON gitxu_articles(created_at DESC);');
    sqlite = db;
  } catch (err: any) {
    initError = `SQLite init failed at ${DB_FILE}: ${err?.message || err}`;
    sqlite = null;
  }
  return sqlite;
}

/** 供给 /api/health 的真实错误出口 —— 上一版故障只能靠跑 POST 探针才能看见。 */
export function storageInfo() {
  const db = openDatabase();
  return {
    configured: Boolean(db),
    source: db ? ('sqlite' as const) : ('seed' as const),
    dbFile: DB_FILE,
    error: db ? undefined : initError || 'database not initialized',
  };
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

/**
 * 确定性伪随机（mulberry32）：同一 seed 必得同一序列。
 * 首页「随机推荐」按时间窗口生成 seed，保证同一窗口内所有访客（含 Googlebot）
 * 看到的是同一批文章，窗口一过自动换一批 —— 无需客户端 JS，SSR 输出稳定。
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(input: T[], seed: number): T[] {
  const arr = input.slice();
  const rand = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

/** 列表类查询不含正文；只有详情页与后台编辑才需要 content。 */
const LIGHT_COLUMNS = 'id,slug,title,summary,category,type,cover_image,published_at,views';

/** 所有查询的统一出口：打不开库就返回空数组，绝不回落 seed 假文章（会被 Google 收录成垃圾页）。 */
function query(sql: string, params: unknown[] = []): any[] {
  const db = openDatabase();
  if (!db) return [];
  try {
    return db.all(sql, ...params) || [];
  } catch (err: any) {
    initError = `SQLite query failed: ${err?.message || err}`;
    return [];
  }
}

/** 读全量列表。withContent=true 只给详情页/后台用，列表页一律 false。 */
function fetchArticles(withContent: boolean): Article[] {
  const db = openDatabase();
  if (!db) return [];
  const cols = withContent ? '*' : LIGHT_COLUMNS;
  return query(`SELECT ${cols} FROM gitxu_articles ORDER BY created_at DESC`).map(mapRow);
}

export const db = {
  articles: {
    /** 全量含正文。仅用于真正需要 content 的场景（后台编辑、公开 API）。 */
    findMany: async (): Promise<Article[]> => fetchArticles(true),
    /** 全量但不含正文。列表页 / sitemap / 主题聚合页专用。 */
    findList: async (): Promise<Article[]> => fetchArticles(false),
    countAll: async (): Promise<number> => {
      const row = query('SELECT COUNT(*) AS n FROM gitxu_articles')[0];
      return Number(row?.n) || 0;
    },
    viewsSum: async (): Promise<number> => {
      const row = query('SELECT COALESCE(SUM(views), 0) AS s FROM gitxu_articles')[0];
      return Number(row?.s) || 0;
    },
    findRecent: async (opts: { excludeSlug?: string; type?: string; limit?: number }): Promise<Article[]> => {
      const limit = Math.min(Math.max(opts.limit || 8, 1), 50);
      const where: string[] = [];
      const params: unknown[] = [];
      if (opts.type) {
        where.push('type = ?');
        params.push(opts.type);
      }
      if (opts.excludeSlug) {
        where.push('slug != ?');
        params.push(opts.excludeSlug);
      }
      const sql = `SELECT ${LIGHT_COLUMNS} FROM gitxu_articles
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY created_at DESC LIMIT ?`;
      return query(sql, [...params, limit]).map(mapRow);
    },
    /**
     * 随机推荐：先按随机 offset 取候选池 → 按 seed 确定性洗牌 → 截取前 N 篇。
     * - seed 由调用方按时间窗口生成（如 Math.floor(Date.now() / 20min)），
     *   同一窗口内 SSR 输出完全一致，20 分钟后自动换一批。
     * - excludeSlugs 用于避开首页其它区块已展示的文章；池子不够时回落到已排除项补齐，
     *   保证区块永远填满。
     */
    findRandom: async (opts: {
      limit?: number;
      seed?: number;
      poolSize?: number;
      excludeSlugs?: string[];
      types?: string[];
    } = {}): Promise<Article[]> => {
      const limit = Math.min(Math.max(opts.limit || 6, 1), 24);
      const poolSize = Math.min(Math.max(opts.poolSize || 300, limit), 1000);
      const types = (opts.types && opts.types.length > 0 ? opts.types : ['news', 'guide']).slice(0, 4);
      const exclude = new Set((opts.excludeSlugs || []).filter(Boolean));
      const seed = Number.isFinite(opts.seed) ? Number(opts.seed) : Math.floor(Date.now() / 600000);

      const pick = (pool: Article[]): Article[] => {
        const usable = pool.filter((a) => a.slug);
        const groups = types
          .map((t, i) => seededShuffle(usable.filter((a) => !exclude.has(a.slug) && (a.type || 'news') === t), seed + i * 7919))
          .filter((g) => g.length > 0);

        const out: Article[] = [];
        if (groups.length > 0) {
          while (out.length < limit && groups.some((g) => g.length > 0)) {
            for (const g of groups) {
              if (out.length >= limit) break;
              if (g.length > 0) out.push(g.shift() as Article);
            }
          }
        }
        if (out.length < limit) {
          const taken = new Set(out.map((a) => a.slug));
          const rest = seededShuffle(usable.filter((a) => !taken.has(a.slug)), seed + 104729);
          out.push(...rest.slice(0, limit - out.length));
        }
        return seededShuffle(out, seed + 15485863).slice(0, limit);
      };

      const db = openDatabase();
      if (!db) return [];

      // 先取总数，让随机窗口能滑到老文章而不是只在新文里打转
      const total = Number(query('SELECT COUNT(*) AS n FROM gitxu_articles')[0]?.n) || 0;
      let offset = 0;
      if (total > poolSize) {
        offset = Math.floor(mulberry32(seed ^ 0x9e3779b9)() * (total - poolSize + 1));
      }
      const pool = query(
        `SELECT ${LIGHT_COLUMNS} FROM gitxu_articles ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [poolSize, offset]
      ).map(mapRow);
      return pool.length > 0 ? pick(pool) : [];
    },
    searchByTitle: async (opts: { tokens: string[]; excludeSlug?: string; limit?: number }): Promise<Article[]> => {
      const limit = Math.min(Math.max(opts.limit || 12, 1), 30);
      // 允许多词短语（如 "honor of kings"）；单段最短 3 位（gta/wow/cod 均为 3 字母关键词）
      const tokens = (opts.tokens || []).filter((t) => /^[a-z0-9]{3,}([ ][a-z0-9]{2,}){0,3}$/.test(t)).slice(0, 3);
      if (tokens.length === 0) return [];
      const seenSlugs: { [s: string]: boolean } = {};
      const out: Article[] = [];
      for (const token of tokens) {
        if (out.length >= limit) break;
        const where: string[] = ['title LIKE ?'];
        const params: unknown[] = [`%${token}%`];
        if (opts.excludeSlug) {
          where.push('slug != ?');
          params.push(opts.excludeSlug);
        }
        const rows = query(
          `SELECT ${LIGHT_COLUMNS} FROM gitxu_articles WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT ?`,
          [...params, limit]
        );
        for (const row of rows) {
          if (out.length >= limit) break;
          if (row.slug && !seenSlugs[row.slug]) {
            seenSlugs[row.slug] = true;
            out.push(mapRow(row));
          }
        }
      }
      return out;
    },
    findUnique: async (slug: string): Promise<Article | undefined> => {
      const rows = query('SELECT * FROM gitxu_articles WHERE slug = ? OR id = ? LIMIT 1', [slug, slug]);
      return rows.length > 0 ? mapRow(rows[0]) : undefined;
    },
    /** 幂等写入：slug 已存在则原样返回既有文章，补发历史稿时不会重复入库。 */
    create: async (data: Omit<Article, 'id' | 'views' | 'publishedAt'>): Promise<Article> => {
      const db = openDatabase();
      if (!db) {
        throw new Error(`SQLite is NOT available (${initError || 'not initialized'}) — article was NOT saved.`);
      }
      const existing = query('SELECT * FROM gitxu_articles WHERE slug = ? LIMIT 1', [data.slug]);
      if (existing.length > 0) return mapRow(existing[0]);

      const newArticle: Article = {
        ...data,
        id: Date.now().toString(),
        views: 0,
        publishedAt: 'Just now',
      };
      const now = new Date().toISOString();
      try {
        db.run(
          `INSERT INTO gitxu_articles (id, slug, title, summary, content, type, category, cover_image, published_at, created_at, views)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
          newArticle.id,
          newArticle.slug,
          newArticle.title,
          newArticle.summary || '',
          newArticle.content || '',
          newArticle.type || 'news',
          newArticle.category || 'General',
          newArticle.coverImage || '',
          now,
          now
        );
      } catch (err: any) {
        // 并发下同 slug 抢跑 → 退回读取既有行，仍算成功（调用方只关心"这篇文章在线上存在"）
        const again = query('SELECT * FROM gitxu_articles WHERE slug = ? LIMIT 1', [data.slug]);
        if (again.length > 0) return mapRow(again[0]);
        throw new Error(`SQLite insert failed: ${err?.message || err}`);
      }
      return newArticle;
    },
    update: async (id: string, data: { coverImage?: string; title?: string; summary?: string; content?: string; type?: string; category?: string }): Promise<Article> => {
      const db = openDatabase();
      if (!db) {
        throw new Error(`SQLite is NOT available (${initError || 'not initialized'}) — article was NOT updated.`);
      }
      const sets: string[] = [];
      const params: unknown[] = [];
      if (data.coverImage !== undefined) { sets.push('cover_image = ?'); params.push(data.coverImage); }
      if (data.title !== undefined) { sets.push('title = ?'); params.push(data.title); }
      if (data.summary !== undefined) { sets.push('summary = ?'); params.push(data.summary); }
      if (data.content !== undefined) { sets.push('content = ?'); params.push(data.content); }
      if (data.type !== undefined) { sets.push('type = ?'); params.push(data.type); }
      if (data.category !== undefined) { sets.push('category = ?'); params.push(data.category); }
      if (sets.length === 0) {
        throw new Error('No fields to update');
      }
      params.push(id);
      db.run(`UPDATE gitxu_articles SET ${sets.join(', ')} WHERE id = ?`, ...params);
      const row = query('SELECT * FROM gitxu_articles WHERE id = ? LIMIT 1', [id])[0];
      return row
        ? mapRow(row)
        : { id, slug: '', title: '', summary: '', content: '', type: 'news', category: 'General', coverImage: data.coverImage || '', publishedAt: 'Just now', views: 0 };
    },
    delete: async (id: string): Promise<boolean> => {
      const db = openDatabase();
      if (!db) {
        throw new Error(`SQLite is NOT available (${initError || 'not initialized'}) — article was NOT deleted.`);
      }
      db.run('DELETE FROM gitxu_articles WHERE id = ?', id);
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
      const [totalArticles, totalViews] = await Promise.all([
        db.articles.countAll(),
        db.articles.viewsSum(),
      ]);
      return {
        totalArticles,
        totalGames: SEED_GAMES.length,
        totalPlays: SEED_GAMES.reduce((acc, g) => acc + g.playCount, 0),
        totalViews
      };
    }
  }
};
