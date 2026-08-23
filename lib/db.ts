import { ARTICLES as SEED_ARTICLES, MINI_GAMES as SEED_GAMES, Article, MiniGame } from './data';
import fs from 'fs';
import path from 'path';

// 本地與生產環境的持久化 JSON 資料檔案
const DATA_DIR = path.join(process.cwd(), 'data');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');
const GAMES_FILE = path.join(DATA_DIR, 'games.json');

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ARTICLES_FILE)) {
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(SEED_ARTICLES, null, 2), 'utf-8');
  }
  if (!fs.existsSync(GAMES_FILE)) {
    fs.writeFileSync(GAMES_FILE, JSON.stringify(SEED_GAMES, null, 2), 'utf-8');
  }
}

function readArticles(): Article[] {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(ARTICLES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return SEED_ARTICLES;
  }
}

function writeArticles(articles: Article[]) {
  ensureDataFiles();
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), 'utf-8');
}

function readGames(): MiniGame[] {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(GAMES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return SEED_GAMES;
  }
}

function writeGames(games: MiniGame[]) {
  ensureDataFiles();
  fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2), 'utf-8');
}

export const db = {
  articles: {
    findMany: async () => readArticles(),
    findUnique: async (slug: string) => {
      const all = readArticles();
      return all.find(a => a.slug === slug || a.id === slug);
    },
    create: async (data: Omit<Article, 'id' | 'views' | 'publishedAt'>) => {
      const all = readArticles();
      const newArticle: Article = {
        ...data,
        id: Date.now().toString(),
        views: 0,
        publishedAt: 'Just now',
      };
      all.unshift(newArticle);
      writeArticles(all);
      return newArticle;
    },
    delete: async (id: string) => {
      const all = readArticles();
      const filtered = all.filter(a => a.id !== id);
      writeArticles(filtered);
      return true;
    }
  },
  games: {
    findMany: async () => readGames(),
    findUnique: async (slug: string) => {
      const all = readGames();
      return all.find(g => g.slug === slug || g.id === slug);
    },
    create: async (data: Omit<MiniGame, 'id' | 'playCount'>) => {
      const all = readGames();
      const newGame: MiniGame = {
        ...data,
        id: Date.now().toString(),
        playCount: 0,
      };
      all.unshift(newGame);
      writeGames(all);
      return newGame;
    },
    incrementPlay: async (slug: string) => {
      const all = readGames();
      const game = all.find(g => g.slug === slug);
      if (game) {
        game.playCount += 1;
        writeGames(all);
        return game.playCount;
      }
      return 0;
    }
  },
  stats: {
    getOverview: async () => {
      const articles = readArticles();
      const games = readGames();
      return {
        totalArticles: articles.length,
        totalGames: games.length,
        totalPlays: games.reduce((acc, g) => acc + g.playCount, 0),
        totalViews: articles.reduce((acc, a) => acc + a.views, 0)
      };
    }
  }
};
