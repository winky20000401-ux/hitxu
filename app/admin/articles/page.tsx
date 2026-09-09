'use client';

import { useState, useEffect, useMemo } from 'react';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const fetchArticles = async () => {
    const res = await fetch('/api/articles');
    const data = await res.json();
    if (data.success) setArticles(data.data);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return articles;
    return articles.filter((article) => [
      article.title,
      article.slug,
      article.summary,
      article.content,
      article.category,
    ].some((value) => String(value ?? '').toLowerCase().includes(normalized)));
  }, [articles, query]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleArticles = filteredArticles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const handleRandomCover = () => {
    const random = DEFAULT_GAMING_COVERS[Math.floor(Math.random() * DEFAULT_GAMING_COVERS.length)];
    setCoverImage(random);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) return;

    const res = await fetch(editingId ? `/api/articles/${editingId}` : '/api/articles', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug, summary, content, type, category, coverImage }),
    });

    if (res.ok) {
      const wasEditing = Boolean(editingId);
      setTitle('');
      setSlug('');
      setSummary('');
      setContent('');
      setEditingId(null);
      handleRandomCover();
      fetchArticles();
      alert(wasEditing ? '文章修改成功！' : '文章發布成功！');
    }
  };

  const handleEdit = (article: any) => {
    setEditingId(String(article.id));
    setTitle(article.title ?? '');
    setSlug(article.slug ?? '');
    setSummary(article.summary ?? '');
    setContent(article.content ?? '');
    setType(article.type ?? 'news');
    setCategory(article.category ?? 'General');
    setCoverImage(article.coverImage ?? DEFAULT_GAMING_COVERS[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setSummary('');
    setContent('');
    setType('news');
    setCategory('General');
    setCoverImage(DEFAULT_GAMING_COVERS[0]);
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
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-bold text-emerald-400">{editingId ? '编辑文章' : '发布新文章 / 攻略'}</h2>
          {editingId && <button type="button" onClick={cancelEdit} className="text-xs text-slate-400 hover:text-white">取消编辑</button>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">文章標題</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!editingId) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
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
              disabled={Boolean(editingId)}
              placeholder="genshin-impact-5-0-guide"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
            {editingId && <p className="text-[11px] text-slate-500 mt-1">编辑时保留原 Slug，避免文章链接失效。</p>}
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
          {editingId ? '保存修改' : '立即發布'}
        </button>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white">現有文章列表</h2>
            <p className="text-xs text-slate-500 mt-1">共 {filteredArticles.length} 篇{query.trim() ? `，搜索“${query.trim()}”` : ''}</p>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索标题、Slug、摘要或正文"
            aria-label="搜索文章"
            className="w-full sm:w-80 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
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
              {visibleArticles.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/40">
                  <td className="p-3">
                    <img src={a.coverImage} alt={a.title} className="w-12 h-8 object-cover rounded" />
                  </td>
                  <td className="p-3 font-medium text-white max-w-xs truncate">{a.title}</td>
                  <td className="p-3 text-xs uppercase font-semibold text-emerald-400">{a.type}</td>
                  <td className="p-3 text-xs">{a.category}</td>
                  <td className="p-3 text-xs">{a.views}</td>
                    <td className="p-3 text-right space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(a)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                      >
                        编辑
                      </button>
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
        {visibleArticles.length === 0 && <p className="text-sm text-slate-400 py-6 text-center">没有找到匹配的文章。</p>}
        {totalPages > 1 && <div className="flex items-center justify-center gap-3 mt-5 text-sm">
          <button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="px-3 py-1.5 rounded border border-slate-700 disabled:opacity-40">上一页</button>
          <span className="text-slate-400">第 {currentPage} / {totalPages} 页</span>
          <button type="button" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="px-3 py-1.5 rounded border border-slate-700 disabled:opacity-40">下一页</button>
        </div>}
      </div>
    </div>
  );
}
