-- =============================================================
-- gitxu.com 文章持久化存储 — Supabase 建表脚本
-- 使用方法：
--   1. 打开 https://supabase.com/dashboard → 项目 ynuonowmzyivskiycmzm
--   2. 左侧 SQL Editor → New query → 粘贴本文件全部内容 → Run
--   3. 再到 Vercel 的 gitxu 项目 → Settings → Environment Variables 添加：
--        SUPABASE_URL  = https://ynuonowmzyivskiycmzm.supabase.co
--        SUPABASE_SERVICE_ROLE_KEY = (Supabase Dashboard → Settings → API → service_role key)
--   4. Redeploy（推送任意提交或 Dashboard 里点 Redeploy）即可生效
-- 说明：应用使用 service_role key（绕过 RLS），无需额外授权策略。
-- =============================================================

create table if not exists public.gitxu_articles (
  id           text primary key,
  slug         text not null unique,
  title        text not null,
  summary      text not null default '',
  content      text not null default '',
  type         text not null default 'news',   -- 'news' | 'guide'
  category     text not null default 'News',
  cover_image  text,
  views        integer not null default 0,
  published_at text not null default '',       -- ISO 8601 时间戳
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.gitxu_articles enable row level security;

create index if not exists gitxu_articles_created_at_idx
  on public.gitxu_articles (created_at desc);

-- 验证：建表后运行下面这句应返回 0
-- select count(*) from public.gitxu_articles;
