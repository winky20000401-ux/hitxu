import type { Article } from './data';

/**
 * 文章相关性工具（P1）：
 * 从标题提取主题 token，供 db.articles.searchByTitle 做站内主题检索，
 * 让 GTA 文章的内链指向其它 GTA 文章，而不是「碰巧最新」的文章。
 */

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'how', 'why', 'what', 'when', 'who', 'new', 'all', 'are', 'was', 'were',
  'has', 'have', 'had', 'its', 'his', 'her', 'their', 'this', 'that', 'these', 'those', 'from', 'into',
  'after', 'before', 'over', 'under', 'just', 'more', 'most', 'best', 'top', 'get', 'got', 'out', 'off',
  'you', 'your', 'can', 'will', 'now', 'not', 'but', 'too', 'also', 'than', 'then', 'here', 'there',
  'game', 'games', 'gaming', 'gamer', 'players', 'player', 'update', 'updates', 'news', 'guide', 'guides',
  'review', 'reviews', 'episode', 'trailer', 'trailers', 'edition', 'version', 'patch', 'release', 'revealed',
  // 营销/通用词：这些词命中会产生大量伪相关（如 GTA "Ultimate" 版匹配所有标题带 ultimate 的文章）
  'ultimate', 'today', 'only', 'free', 'online', 'play', 'playing', 'playable', 'deal', 'deals', 'sale',
  'price', 'discount', 'offer', 'claim', 'reward', 'rewards', 'code', 'codes', 'drop', 'drops', 'dropped',
  'launch', 'launching', 'available', 'announced', 'announce', 'complete', 'beginner', 'beginners',
  'tips', 'tricks', 'secrets', 'everything', 'need', 'know', 'worth', 'still', 'being', 'about', 'less',
  'snag', 'stop', 'seriously', 'laughing', 'come', 'coming', 'soon', 'early', 'access', 'first', 'next',
  'every', 'each', 'make', 'makes', 'made', 'take', 'takes', 'give', 'gives', 'want', 'gets', 'look',
]);

/** 取标题中最具辨识度的 token（长词优先，剔除停用词），最多 limit 个 */
export function topTitleTokens(title: string, limit = 3): string[] {
  const words = (title.toLowerCase().match(/[a-z0-9]{4,}/g) || []).filter((w) => !STOPWORDS.has(w));
  const seen: { [w: string]: boolean } = {};
  return words.filter((w) => (seen[w] ? false : (seen[w] = true))).sort((a, b) => b.length - a.length).slice(0, limit);
}
