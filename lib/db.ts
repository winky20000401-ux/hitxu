import { ARTICLES as SEED_ARTICLES, MINI_GAMES as SEED_GAMES, Article, MiniGame } from './data';
import fs from 'fs';
import path from 'path';
import os from 'os';

// 在 Vercel 云端环境中，/tmp 具备完整的安全写权限
const DATA_DIR = path.join(os.tmpdir(), 'gitxu_data');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');
const GAMES_FILE = path.join(DATA_DIR, 'games.json');

let memoryArticles: Article[] = [...SEED_ARTICLES];
let memoryGames: MiniGame[] = [...SEED_GAMES];

function initStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ARTICLES_FILE)) {
      fs.writeFileSync(ARTICLES_FILE, JSON.stringify(SEED_ARTICLES, null, 2), 'utf-8');
    } else {
      const raw = fs.readFileSync(ARTICLES_FILE, 'utf-8');
      memoryArticles = JSON.parse(raw);
    }
    if (!fs.existsSync(GAMES_FILE)) {
      fs.writeFileSync(GAMES_FILE, JSON.stringify(SEED_GAMES, null, 2), 'utf-8');
    } else {
      const raw = fs.readFileSync(GAMES_FILE, 'utf-8');
      memoryGames = JSON.parse(raw);
    }
  } catch (err) {
    // 平滑兜底，确保绝不抛出 500 异常
  }
}

initStorage();

function readArticles(): Article[] {
  try {
    if (fs.existsSync(ARTICLES_FILE)) {
      const raw = fs.readFileSync(ARTICLES_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryArticles = parsed;
        return parsed;
      }
    }
  } catch (err) {
    // 回退
  }
  return memoryArticles || SEED_ARTICLES;
}

function writeArticles(articles: Article[]) {
  memoryArticles = articles;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), 'utf-8');
  } catch (err) {
    // 回退
  }
}

function readGames(): MiniGame[] {
  try {
    if (fs.existsSync(GAMES_FILE)) {
      const raw = fs.readFileSync(GAMES_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryGames = parsed;
        return parsed;
      }
    }
  } catch (err) {
    // 回退
  }
  return memoryGames || SEED_GAMES;
}

function writeGames(games: MiniGame[]) {
  memoryGames = games;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2), 'utf-8');
  } catch (err) {
    // 回退
  }
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
