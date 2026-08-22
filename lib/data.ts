export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  type: 'news' | 'guide';
  category: string;
  coverImage: string;
  publishedAt: string;
  views: number;
}

export interface MiniGame {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  coverImage: string;
  gameUrl: string;
  playCount: number;
  featured?: boolean;
}

export const CATEGORIES: Category[] = [
  { id: '1', name: 'All Games', slug: 'all' },
  { id: '2', name: 'Action', slug: 'action' },
  { id: '3', name: 'Role-Playing', slug: 'rpg' },
  { id: '4', name: 'Strategy', slug: 'strategy' },
  { id: '5', name: 'Casual', slug: 'casual' },
  { id: '6', name: 'Shooter', slug: 'shooter' },
  { id: '7', name: 'Simulation', slug: 'simulation' },
  { id: '8', name: 'Puzzle', slug: 'puzzle' },
];

export const ARTICLES: Article[] = [
  {
    id: '1',
    slug: 'genshin-impact-new-version-guide',
    title: 'Genshin Impact: Beginner to Advanced Character Building Guide',
    summary: 'Master the art of artifact farming, talent prioritization, and optimal team synergies in this comprehensive guide.',
    content: 'Full detailed guide content goes here...',
    type: 'guide',
    category: 'Role-Playing',
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    publishedAt: '1 day ago',
    views: 14200
  },
  {
    id: '2',
    slug: 'mobile-gaming-industry-report-2026',
    title: '2026 Mobile Game Industry Report: Global Expansion & H5 Mini Games',
    summary: 'The latest report highlights rapid growth in cross-platform H5 gaming, with instant-play titles gaining massive market traction.',
    content: 'Detailed industry analysis...',
    type: 'news',
    category: 'Industry',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
    publishedAt: '2 days ago',
    views: 8900
  },
  {
    id: '3',
    slug: 'honor-of-kings-ranked-tactics',
    title: 'Honor of Kings: High-Rank Macro & Vision Positioning Tactics',
    summary: 'Learn key rotation timings, jungle invasion paths, and team fight positioning from pro players.',
    content: 'Pro tips and tactical breakdown...',
    type: 'guide',
    category: 'Strategy',
    coverImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80',
    publishedAt: '3 days ago',
    views: 11500
  }
];

export const MINI_GAMES: MiniGame[] = [
  {
    id: '1',
    slug: '2048',
    title: '2048 Classic',
    description: 'Join the numbers and get to the 2048 tile! Use arrow keys or swipe to move all tiles.',
    category: 'Puzzle',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
    gameUrl: '/games/2048/index.html',
    playCount: 15420,
    featured: true
  },
  {
    id: '2',
    slug: 'snake',
    title: 'Retro Snake',
    description: 'Classic arcade snake game. Eat the apples, grow your length, and avoid hitting the walls or your tail!',
    category: 'Casual',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80',
    gameUrl: '/games/snake/index.html',
    playCount: 12380,
    featured: true
  },
  {
    id: '3',
    slug: 'tetris',
    title: 'Block Drop (Tetris)',
    description: 'Rotate and drop falling tetromino blocks to clear lines and score points.',
    category: 'Puzzle',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80',
    gameUrl: '/games/tetris/index.html',
    playCount: 9840,
    featured: true
  }
];
