-- =============================================
-- ATLUS - Database Schema for Supabase
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. جدول التصنيفات (Genres/Categories)
CREATE TABLE IF NOT EXISTS genres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. جدول المانهوا (Series)
CREATE TABLE IF NOT EXISTS series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  author TEXT,
  artist TEXT,
  staff TEXT,
  cover_image_url TEXT,
  banner_image_url TEXT,
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'hiatus')),
  type TEXT DEFAULT 'manhwa' CHECK (type IN ('manhwa', 'manga', 'manhua')),
  rating NUMERIC(3,2) DEFAULT 0,
  views_count BIGINT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_series_slug ON series(slug);
CREATE INDEX IF NOT EXISTS idx_series_status ON series(status);
CREATE INDEX IF NOT EXISTS idx_series_featured ON series(is_featured) WHERE is_featured = true;

-- 3. جدول العلاقة بين المانهوا والتصنيفات
CREATE TABLE IF NOT EXISTS series_genres (
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (series_id, genre_id)
);

-- 4. جدول الفصول (Chapters)
CREATE TABLE IF NOT EXISTS chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  chapter_number NUMERIC(6,1) NOT NULL,
  title TEXT,
  views_count BIGINT DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(series_id, chapter_number)
);

CREATE INDEX IF NOT EXISTS idx_chapters_series ON chapters(series_id);
CREATE INDEX IF NOT EXISTS idx_chapters_published ON chapters(is_published) WHERE is_published = true;

-- 5. جدول صور الفصول (Chapter Pages)
CREATE TABLE IF NOT EXISTS chapter_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  page_number INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(chapter_id, page_number)
);

CREATE INDEX IF NOT EXISTS idx_pages_chapter ON chapter_pages(chapter_id);
CREATE INDEX IF NOT EXISTS idx_pages_order ON chapter_pages(chapter_id, page_number);

-- 6. جدول المفضلات (Bookmarks)
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  last_read_chapter_id UUID REFERENCES chapters(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, series_id)
);

-- 7. إعدادات الموقع
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read series" ON series FOR SELECT USING (true);
CREATE POLICY "Public read published chapters" ON chapters FOR SELECT USING (is_published = true);
CREATE POLICY "Public read chapter pages" ON chapter_pages FOR SELECT USING (true);
CREATE POLICY "Public read genres" ON genres FOR SELECT USING (true);
CREATE POLICY "Public read series_genres" ON series_genres FOR SELECT USING (true);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

-- Users manage own bookmarks
CREATE POLICY "Users manage bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- Storage Buckets
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('chapters', 'chapters', true) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Public read covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "Public read chapters" ON storage.objects FOR SELECT USING (bucket_id = 'chapters');

-- =============================================
-- Seed Data - التصنيفات الأساسية
-- =============================================
INSERT INTO genres (name, slug) VALUES
  ('خيال', 'fantasy'),
  ('مغامرات', 'adventure'),
  ('دراما', 'drama'),
  ('كوميدي', 'comedy'),
  ('رعب', 'horror'),
  ('خارق للطبيعة', 'supernatural'),
  ('حياة مدرسية', 'school-life'),
  ('فنون قتالية', 'martial-arts'),
  ('Type-Moon', 'type-moon'),
  ('سينين', 'seinen'),
  ('غموض', 'mystery'),
  ('تحقيق', 'detective'),
  ('سحر', 'magic'),
  ('نفسي', 'psychological'),
  ('فنتازيا', 'fantazia')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- Functions for View Counting (RPC)
-- =============================================
CREATE OR REPLACE FUNCTION increment_series_views(series_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE series SET views_count = views_count + 1 WHERE id = series_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_chapter_views(chapter_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE chapters SET views_count = views_count + 1 WHERE id = chapter_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Disqus-Style Comment System
-- =============================================

-- 8. جدول الملفات الشخصية (Profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- تريجر لإنشاء ملف شخصي تلقائياً عند التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  -- Check if trigger exists to avoid errors on multiple runs
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;

-- 9. جدول التعليقات (Comments)
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_series ON comments(series_id) WHERE series_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_chapter ON comments(chapter_id) WHERE chapter_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;

-- 10. جدول التصويتات (Comment Votes)
CREATE TABLE IF NOT EXISTS comment_votes (
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_upvote BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (comment_id, user_id)
);

-- RLS Policies for Profiles, Comments, Votes
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public read comment votes" ON comment_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON comment_votes FOR ALL USING (auth.uid() = user_id);
