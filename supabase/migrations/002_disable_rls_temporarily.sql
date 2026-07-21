-- ============================================================
-- Temp: Disable RLS for development
-- Re-enable after auth is set up
-- ============================================================

ALTER TABLE platform_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE commissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE scripts DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys DISABLE ROW LEVEL SECURITY;
