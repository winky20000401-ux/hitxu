'use client';

import { useState, useEffect } from 'react';

export default function AdminGamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Puzzle');
  const [gameUrl, setGameUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const fetchGames = async () => {
    const res = await fetch('/api/games');
    const data = await res.json();
    if (data.success) setGames(data.data);
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !gameUrl) return;

    const res = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug, description, category, gameUrl, coverImage }),
    });

    if (res.ok) {
      setTitle('');
      setSlug('');
      setDescription('');
      setGameUrl('');
      setCoverImage('');
      fetchGames();
      alert('小遊戲上架成功！');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">在線 H5 小遊戲管理 (Mini Games CMS)</h1>
        <p className="text-sm text-slate-400 mt-1">上架與配置即點即玩 HTML5 小遊戲資源與 iframe 路徑</p>
      </div>

      {/* Add Game Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-bold text-emerald-400">上架新 H5 小遊戲</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">遊戲名稱</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
              }}
              placeholder="例如：Flappy Bird 經典版"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">網址 Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="flappy-bird"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              遊戲加載路徑 (站內路徑或外部 iframe URL)
            </label>
            <input
              type="text"
              value={gameUrl}
              onChange={(e) => setGameUrl(e.target.value)}
              placeholder="/games/flappy/index.html 或 https://html5.gamedistribution.com/..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">遊戲分類</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Casual">Casual (休閒)</option>
              <option value="Puzzle">Puzzle (解謎)</option>
              <option value="Action">Action (動作)</option>
              <option value="Strategy">Strategy (策略)</option>
              <option value="Shooter">Shooter (射擊)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">遊戲封面圖 URL</label>
          <input
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">玩法簡介與操作提示</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="說明遊戲按鍵操作與過關目標..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-2 rounded-lg text-sm transition"
        >
          確認上架遊戲
        </button>
      </form>

      {/* Games List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-base font-bold text-white mb-4">現有遊戲庫</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {games.map((g) => (
            <div key={g.id} className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-3 space-y-2">
              <div className="font-bold text-white text-sm">{g.title}</div>
              <div className="text-xs text-slate-400">分類：{g.category}</div>
              <div className="text-xs text-slate-400">總遊玩次數：{g.playCount}</div>
              <div className="text-xs text-slate-500 truncate">路徑：{g.gameUrl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
