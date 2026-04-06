-- =============================================
-- Fix: Name the foreign key on comments.user_id -> profiles.id
-- This resolves "more than one relationship found" error
-- =============================================

-- Drop existing unnamed FK constraint and recreate with explicit name
DO $$
DECLARE
  fk_name TEXT;
BEGIN
  -- Find the existing FK constraint name for comments.user_id -> profiles.id
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
  WHERE tc.table_name = 'comments'
    AND kcu.column_name = 'user_id'
    AND ccu.table_name = 'profiles'
    AND tc.constraint_type = 'FOREIGN KEY';

  IF fk_name IS NOT NULL AND fk_name != 'comments_user_id_fkey' THEN
    EXECUTE 'ALTER TABLE comments DROP CONSTRAINT ' || fk_name;
    ALTER TABLE comments
      ADD CONSTRAINT comments_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  -- If constraint doesn't exist at all, create it
  IF fk_name IS NULL THEN
    -- Check if there's a constraint pointing to auth.users instead
    SELECT tc.constraint_name INTO fk_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'comments'
      AND kcu.column_name = 'user_id'
      AND tc.constraint_type = 'FOREIGN KEY';

    IF fk_name IS NOT NULL THEN
      EXECUTE 'ALTER TABLE comments DROP CONSTRAINT ' || fk_name;
    END IF;

    ALTER TABLE comments
      ADD CONSTRAINT comments_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =============================================
-- Emoji Reactions System (No Account Needed)
-- =============================================

-- Table to store aggregated reaction counts
CREATE TABLE IF NOT EXISTS emoji_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('series', 'chapter')),
  emoji TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(target_id, target_type, emoji)
);

CREATE INDEX IF NOT EXISTS idx_emoji_reactions_target ON emoji_reactions(target_id, target_type);

-- Table to track which visitor reacted (prevents double-reacting)
CREATE TABLE IF NOT EXISTS emoji_reaction_visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('series', 'chapter')),
  visitor_id TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(target_id, target_type, visitor_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_emoji_reaction_visitors_target ON emoji_reaction_visitors(target_id, target_type, visitor_id);

-- RLS Policies
ALTER TABLE emoji_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emoji_reaction_visitors ENABLE ROW LEVEL SECURITY;

-- Everyone can read reactions
CREATE POLICY "Public read emoji_reactions" ON emoji_reactions FOR SELECT USING (true);
-- Everyone can insert/update reactions (anonymous)
CREATE POLICY "Anyone can insert emoji_reactions" ON emoji_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update emoji_reactions" ON emoji_reactions FOR UPDATE USING (true);

-- Everyone can read/insert/delete visitor reactions
CREATE POLICY "Public read emoji_reaction_visitors" ON emoji_reaction_visitors FOR SELECT USING (true);
CREATE POLICY "Anyone can insert emoji_reaction_visitors" ON emoji_reaction_visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete emoji_reaction_visitors" ON emoji_reaction_visitors FOR DELETE USING (true);

-- =============================================
-- RPC Functions for Atomic Count Updates
-- =============================================

CREATE OR REPLACE FUNCTION increment_emoji_reaction(
  p_target_id UUID,
  p_target_type TEXT,
  p_emoji TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO emoji_reactions (target_id, target_type, emoji, count)
  VALUES (p_target_id, p_target_type, p_emoji, 1)
  ON CONFLICT (target_id, target_type, emoji)
  DO UPDATE SET count = emoji_reactions.count + 1, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_emoji_reaction(
  p_target_id UUID,
  p_target_type TEXT,
  p_emoji TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE emoji_reactions
  SET count = GREATEST(count - 1, 0), updated_at = now()
  WHERE target_id = p_target_id
    AND target_type = p_target_type
    AND emoji = p_emoji;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
