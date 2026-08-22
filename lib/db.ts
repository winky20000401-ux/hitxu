import { ARTICLES, MINI_GAMES, Article, MiniGame } from './data';

// 内存数据库模拟（生产环境可直接接入 Prisma 或 Supabase）
let memoryArticles: Article[] = [...ARTICLES];
let memoryGames: MiniGame[] = [...MINI_GAMES];

export const db = {
  articles: {
    findMany: async () => memoryArticles,
    findUnique: async (slug: string) => memoryArticles.find(a => a.slug === slug || a.id === slug),
    create: async (data: Omit<Article, 'id' | 'views' | 'publishedAt'>) => {
      const newArticle: Article = {
        ...data,
        id: Date.now().toString(),
        views: 0,
        publishedAt: 'Just now',
      };
      memoryArticles.unshift(newArticle);
      return newArticle;
    },
    delete: async (id: string) => {
      memoryArticles = memoryArticles.filter(a => a.id !== id);
      return true;
    }
  },
  games: {
    findMany: async () => memoryGames,
    findUnique: async (slug: string) => memoryGames.find(g => g.slug === slug || g.id === slug),
    create: async (data: Omit<MiniGame, 'id' | 'playCount'>) => {
      const newGame: MiniGame = {
        ...data,
        id: Date.now().toString(),
        playCount: 0,
      };
      memoryGames.unshift(newGame);
      return newGame;
    },
    incrementPlay: async (slug: string) => {
      const game = memoryGames.find(g => g.slug === slug);
      if (game) {
        game.playCount += 1;
        return game.playCount;
      }
      return 0;
    },
    delete: async (id: string) => {
      memoryGames = memoryGames.filter(g => g.id !== id);
      return true;
    }
  },
  stats: {
    getOverview: async () => {
      const totalArticles = memoryArticles.length;
      const totalGames = memoryGames.length;
      const totalPlays = memoryGames.reduce((acc, g) => acc + g.playCount, 0);
      const totalViews = memoryArticles.reduce((acc, a) => acc + a.views, 0);
      return { totalArticles, totalGames, totalPlays, totalViews };
    }
  }
};
