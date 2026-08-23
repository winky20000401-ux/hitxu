'use client';

import { useState, useEffect } from 'react';
import { DEFAULT_GAMING_COVERS } from '@/lib/images';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('news');
  const [category, setCategory] = useState('General');
  const [coverImage, setCoverImage] = useState(DEFAULT_GAMING_COVERS[0]);

  const fetchArticles = async () => {
    const res = await fetch('/api/articles');
    const data = await res.json();
    if (data.success) setArticles(data.data);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleRandomCover = () => {
    const random = DEFAULT_GAMING_COVERS[Math.floor(Math.random() * DEFAULT_GAMING_COVERS.length)];
    setCoverImage(random);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) return;

    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug, summary, content, type, category, coverImage }),
    });

    if (res.ok) {
      setTitle('');
      setSlug('');
      setSummary('');
      setContent('');
      handleRandomCover();
      fetchArticles();
      alert('文章發布成功！');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確認刪除該文章？')) return;
    await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    fetchArticles();
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">資訊與攻略管理 (Articles CMS)</h1>
        <p className="text-sm text-slate-400 mt-1">新增、編輯與管理遊戲新聞、版本評測與深度攻略</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-bold text-emerald-400">發布新文章 / 攻略</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">文章標題</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
              }}
              placeholder="例如：原神 5.0 全新角色養成攻略"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">網址 Slug (URL 路徑)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="genshin-impact-5-0-guide"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">板塊類型</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="news">遊戲新聞 (News)</option>
              <option value="guide">深度攻略 (Guide)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">遊戲分類</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="RPG / Strategy / Action / Steam 等"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-400">封面圖片 URL</label>
            <button
              type="button"
              onClick={handleRandomCover}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              🎲 隨機換一張精選封面
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <div className="w-16 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 flex-shrink-0">
              <img src={coverImage} alt="封面預覽" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">摘要簡介</label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="顯示在首頁列表的簡短摘要..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">文章完整內容 (支援 Markdown)</label>
          <textarea
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="在此輸入文章正文..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-2 rounded-lg text-sm transition"
        >
          立即發布
        </button>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-base font-bold text-white mb-4">現有文章列表</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs text-slate-400 uppercase">
              <tr>
                <th className="p-3">封面</th>
                <th className="p-3">標題</th>
                <th className="p-3">類型</th>
                <th className="p-3">分類</th>
                <th className="p-3">瀏覽量</th>
                <th className="p-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/40">
                  <td className="p-3">
                    <img src={a.coverImage} alt={a.title} className="w-12 h-8 object-cover rounded" />
                  </td>
                  <td className="p-3 font-medium text-white max-w-xs truncate">{a.title}</td>
                  <td className="p-3 text-xs uppercase font-semibold text-emerald-400">{a.type}</td>
                  <td className="p-3 text-xs">{a.category}</td>
                  <td className="p-3 text-xs">{a.views}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold"
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
