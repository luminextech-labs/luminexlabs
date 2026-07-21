-- ============================================================
-- LuminexLabs — Initial Schema (idempotent)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN CREATE TYPE platform AS ENUM ('tiktok', 'shopee', 'lazada', 'youtube'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE commission_status AS ENUM ('pending', 'confirmed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE video_status AS ENUM ('draft', 'generating', 'ready', 'posted'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform platform NOT NULL,
  display_name TEXT,
  credentials JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'disconnected',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform platform NOT NULL,
  external_id TEXT,
  name TEXT NOT NULL,
  image_url TEXT,
  price DECIMAL(10,2),
  affiliate_link TEXT,
  commission_rate DECIMAL(5,2),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID,
  platform platform NOT NULL,
  external_transaction_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'THB',
  status commission_status NOT NULL DEFAULT 'pending',
  product_name TEXT,
  order_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID,
  title TEXT,
  script TEXT,
  voice_id TEXT,
  voice_name TEXT,
  template TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  platform_target platform NOT NULL,
  status video_status NOT NULL DEFAULT 'draft',
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_id UUID,
  platform platform NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  caption TEXT,
  hashtags TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  posted_at TIMESTAMPTZ,
  external_post_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID,
  platform platform NOT NULL,
  original_url TEXT NOT NULL,
  tracked_code TEXT NOT NULL UNIQUE,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  earnings DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID,
  platform platform NOT NULL,
  template TEXT NOT NULL,
  script_text TEXT NOT NULL,
  voice_id TEXT,
  voice_name TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  key_name TEXT,
  encrypted_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_commissions_user ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_platform ON commissions(platform);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_date ON commissions(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_platform ON products(platform);
CREATE INDEX IF NOT EXISTS idx_videos_user ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_code ON affiliate_links(tracked_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_user ON affiliate_links(user_id);

-- ============================================================
-- RLS — DISABLED FOR DEV (re-enable after auth is set up)
-- ============================================================
DO $$ BEGIN ALTER TABLE platform_connections DISABLE ROW LEVEL SECURITY; EXCEPTION WHEN others THEN null; END $$;
DO $$ BEGIN ALTER TABLE products DISABLE ROW LEVEL SECURITY; EXCEPTION WHEN others THEN null; END $$;
DO $$ BEGIN ALTER TABLE commissions DISABLE ROW LEVEL SECURITY; EXCEPTION WHEN others THEN null; END $$;
DO $$ BEGIN ALTER TABLE videos DISABLE ROW LEVEL SECURITY; EXCEPTION WHEN others THEN null; END $$;
DO $$ BEGIN ALTER TABLE scheduled_posts DISABLE ROW LEVEL SECURITY; EXCEPTION WHEN others THEN null; END $$;
DO $$ BEGIN ALTER TABLE affiliate_links DISABLE ROW LEVEL SECURITY; EXCEPTION WHEN others THEN null; END $$;
DO $$ BEGIN ALTER TABLE scripts DISABLE ROW LEVEL SECURITY; EXCEPTION WHEN others THEN null; END $$;
DO $$ BEGIN ALTER TABLE user_api_keys DISABLE ROW LEVEL SECURITY; EXCEPTION WHEN others THEN null; END $$;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS platform_connections_updated_at ON platform_connections;
CREATE TRIGGER platform_connections_updated_at BEFORE UPDATE ON platform_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS commissions_updated_at ON commissions;
CREATE TRIGGER commissions_updated_at BEFORE UPDATE ON commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS videos_updated_at ON videos;
CREATE TRIGGER videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS affiliate_links_updated_at ON affiliate_links;
CREATE TRIGGER affiliate_links_updated_at BEFORE UPDATE ON affiliate_links FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS scripts_updated_at ON scripts;
CREATE TRIGGER scripts_updated_at BEFORE UPDATE ON scripts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
