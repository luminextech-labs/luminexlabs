-- ============================================================
-- LuminexLabs — Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE platform AS ENUM ('tiktok', 'shopee', 'lazada', 'youtube');
CREATE TYPE commission_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE video_status AS ENUM ('draft', 'generating', 'ready', 'posted');

-- ============================================================
-- TABLES
-- ============================================================

-- Platform connections (encrypted credentials per user)
CREATE TABLE platform_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Commissions
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
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

-- Videos
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
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

-- Scheduled posts
CREATE TABLE scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  platform platform NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  caption TEXT,
  hashtags TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  posted_at TIMESTAMPTZ,
  external_post_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate links with tracking
CREATE TABLE affiliate_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
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

-- Scripts
CREATE TABLE scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  platform platform NOT NULL,
  template TEXT NOT NULL,
  script_text TEXT NOT NULL,
  voice_id TEXT,
  voice_name TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User API keys (BYOK — bring your own key)
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE INDEX idx_commissions_user ON commissions(user_id);
CREATE INDEX idx_commissions_platform ON commissions(platform);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_commissions_date ON commissions(order_date DESC);
CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_products_platform ON products(platform);
CREATE INDEX idx_videos_user ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_affiliate_links_code ON affiliate_links(tracked_code);
CREATE INDEX idx_affiliate_links_user ON affiliate_links(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users see only their own data)
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platform_connections_self_only" ON platform_connections FOR ALL USING (auth.uid() = user_id);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_self_only" ON products FOR ALL USING (auth.uid() = user_id);

ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "commissions_self_only" ON commissions FOR ALL USING (auth.uid() = user_id);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "videos_self_only" ON videos FOR ALL USING (auth.uid() = user_id);

ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scheduled_posts_self_only" ON scheduled_posts FOR ALL USING (auth.uid() = user_id);

ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "affiliate_links_self_only" ON affiliate_links FOR ALL USING (auth.uid() = user_id);

ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scripts_self_only" ON scripts FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_api_keys_self_only" ON user_api_keys FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER platform_connections_updated_at BEFORE UPDATE ON platform_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER commissions_updated_at BEFORE UPDATE ON commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER affiliate_links_updated_at BEFORE UPDATE ON affiliate_links FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER scripts_updated_at BEFORE UPDATE ON scripts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
