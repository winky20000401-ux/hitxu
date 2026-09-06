import type { Article } from './data';

/**
 * 游戏主题聚合页（/topics/<slug>）定义。
 * 只有匹配文章数 >= MIN_TOPIC_ARTICLES 的主题才会生成可索引页面，
 * 避免「1 篇文章一个 tag 页」的薄页问题；随文章增长自动解锁。
 * 词表为人工筛选的常见游戏/平台主题，匹配用词边界正则防子串误报。
 */
export interface TopicDef {
  slug: string;
  name: string;
  match: RegExp;
  /** 用于相关文章检索的关键词（多词短语亦可，PostgREST ilike 支持） */
  keywords: string[];
  blurb: string;
}

export const MIN_TOPIC_ARTICLES = 5;

export const TOPICS: TopicDef[] = [
  { slug: 'gta', name: 'GTA', match: /\bgta\b|grand theft auto/i, keywords: ['gta', 'grand theft auto'], blurb: 'Grand Theft Auto VI, GTA Online and everything Rockstar’s open-world crime saga.' },
  { slug: 'where-winds-meet', name: 'Where Winds Meet', match: /where winds meet/i, keywords: ['where winds meet'], blurb: 'News, builds and guides for the open-world wuxia RPG Where Winds Meet.' },
  { slug: 'xbox', name: 'Xbox', match: /\bxbox\b/i, keywords: ['xbox'], blurb: 'Xbox hardware, Game Pass, and Microsoft gaming news.' },
  { slug: 'playstation', name: 'PlayStation', match: /playstation|\bps5\b|\bps4\b|sony/i, keywords: ['playstation', 'ps5'], blurb: 'PlayStation 5, PS Plus and Sony first-party studio coverage.' },
  { slug: 'nintendo', name: 'Nintendo', match: /nintendo|\bswitch\b|\bswitch 2\b/i, keywords: ['nintendo', 'switch'], blurb: 'Nintendo Switch, Direct presentations and first-party classics.' },
  { slug: 'blood-of-dawnwalker', name: 'Blood of Dawnwalker', match: /dawnwalker/i, keywords: ['dawnwalker'], blurb: 'Guides and news for the dark vampire RPG from former Witcher devs.' },
  { slug: 'arc-raiders', name: 'ARC Raiders', match: /arc raiders/i, keywords: ['arc raiders'], blurb: 'Extraction shooter ARC Raiders — patch notes, tips and loadouts.' },
  { slug: 'honor-of-kings', name: 'Honor of Kings', match: /honor of kings/i, keywords: ['honor of kings'], blurb: 'Hero tier lists, ranked tactics and events for Honor of Kings.' },
  { slug: 'star-wars', name: 'Star Wars', match: /star wars/i, keywords: ['star wars'], blurb: 'Every Star Wars game — from Jedi survivor tales to galaxy-scale MMOs.' },
  { slug: 'steam', name: 'Steam', match: /\bsteam\b|valve/i, keywords: ['steam', 'valve'], blurb: 'Steam sales, Valve updates and PC platform news.' },
  { slug: 'world-of-warcraft', name: 'World of Warcraft', match: /world of warcraft|\bwow\b/i, keywords: ['world of warcraft', 'wow'], blurb: 'WoW expansions, class guides and Azeroth patch coverage.' },
  { slug: 'final-fantasy', name: 'Final Fantasy', match: /final fantasy|\bffxiv\b|\bff7\b|\bfft\b/i, keywords: ['final fantasy', 'ffxiv'], blurb: 'Final Fantasy XIV, mainline entries and Square Enix RPG news.' },
  { slug: 'witcher', name: 'The Witcher', match: /witcher/i, keywords: ['witcher'], blurb: 'The Witcher 4, Wild Hunt and CD Projekt Red coverage.' },
  { slug: 'resident-evil', name: 'Resident Evil', match: /resident evil|\bre\d\b/i, keywords: ['resident evil'], blurb: 'Survival horror news, remakes and Capcom’s Resident Evil saga.' },
  { slug: 'zelda', name: 'Zelda', match: /zelda|tears of the kingdom|breath of the wild/i, keywords: ['zelda'], blurb: 'The Legend of Zelda — guides, secrets and Hyrule lore.' },
  { slug: 'call-of-duty', name: 'Call of Duty', match: /call of duty|\bcod\b|warzone/i, keywords: ['call of duty', 'warzone'], blurb: 'Call of Duty seasonal updates, loadouts and Warzone intel.' },
  { slug: 'roblox', name: 'Roblox', match: /roblox/i, keywords: ['roblox'], blurb: 'Roblox platform news, hit experiences and codes.' },
  { slug: 'rust', name: 'Rust', match: /\brust\b/i, keywords: ['rust'], blurb: 'Facepunch’s survival classic — wipes, updates and base building.' },
];

export interface ActiveTopic {
  topic: TopicDef;
  count: number;
  articles: Article[];
}

/** 返回文章量达标的主题（≥5 篇才生成页面），按文章量降序 */
export function activeTopics(articles: Article[]): ActiveTopic[] {
  const result: ActiveTopic[] = [];
  for (const topic of TOPICS) {
    const articles_ = articles.filter((a) => topic.match.test(a.title) || topic.match.test(a.category));
    if (articles_.length >= MIN_TOPIC_ARTICLES) {
      result.push({ topic, count: articles_.length, articles: articles_ });
    }
  }
  return result.sort((a, b) => b.count - a.count);
}

/** 单篇文章所属的主题（用于文章页「More on X」内链入口） */
export function articleTopics(article: Article, limit = 2): TopicDef[] {
  const text = `${article.title} ${article.category}`;
  return TOPICS.filter((t) => t.match.test(text)).slice(0, limit);
}
