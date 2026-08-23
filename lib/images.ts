export const DEFAULT_GAMING_COVERS = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80',
  'https://images.unsplash.com/photo-1552824792-56eb0f576e27?w=800&q=80',
  'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&q=80',
  'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
  'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&q=80',
];

export function extractFirstImageFromContent(content: string): string | null {
  if (!content || typeof content !== 'string') return null;
  const mdMatch = content.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/i);
  if (mdMatch && mdMatch) return mdMatch;
  const htmlMatch = content.match(/<img\s+[^>]*?src=["'](https?:\/\/[^"']+)["']/i);
  if (htmlMatch && htmlMatch) return htmlMatch;
  const rawMatch = content.match(/https?:\/\/[^\s"'<>\)]+\.(?:png|jpg|jpeg|webp|gif|svg)(?:\?[^\s"'<>\)]*)?/i);
  if (rawMatch && rawMatch[0]) return rawMatch[0];
  return null;
}

export function getRandomGamingCover(seed?: string): string {
  if (!seed) return DEFAULT_GAMING_COVERS[Math.floor(Math.random() * DEFAULT_GAMING_COVERS.length)];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return DEFAULT_GAMING_COVERS[Math.abs(hash) % DEFAULT_GAMING_COVERS.length];
}

export function resolveArticleCover(coverImage?: string | null, content?: string, seed?: string): string {
  if (coverImage && typeof coverImage === 'string' && coverImage.trim().startsWith('http')) {
    return coverImage.trim();
  }
  if (content) {
    const extracted = extractFirstImageFromContent(content);
    if (extracted) return extracted;
  }
  return getRandomGamingCover(seed);
}
