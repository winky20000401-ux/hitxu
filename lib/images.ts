export const DEFAULT_GAMING_COVERS = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80', // 电竞装备
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80', // 霓虹手柄
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80', // 街机摇杆
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80', // 复古街机
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80', // 赛博朋克霓虹
  'https://images.unsplash.com/photo-1552824792-56eb0f576e27?w=800&q=80', // 动作冒险
  'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&q=80', // VR 虚拟现实
  'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&q=80', // 机械发光键盘
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80', // 绚丽霓虹
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80', // 策略几何
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', // 科技矩阵
  'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&q=80', // 梦幻场景
];

export function getRandomGamingCover(seed?: string): string {
  if (!seed) {
    return DEFAULT_GAMING_COVERS[Math.floor(Math.random() * DEFAULT_GAMING_COVERS.length)];
  }
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DEFAULT_GAMING_COVERS.length;
  return DEFAULT_GAMING_COVERS[index];
}
