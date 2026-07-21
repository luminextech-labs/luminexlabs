-- Add columns for video generator pipeline

ALTER TABLE scripts ADD COLUMN IF NOT EXISTS product_url TEXT;
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS product_image TEXT;
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS template_id TEXT DEFAULT 'short_8';
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS voice_id TEXT DEFAULT 'th-TH-NiwatNeural';
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS video_status TEXT DEFAULT 'draft';

-- Videos table - add missing columns
ALTER TABLE videos ADD COLUMN IF NOT EXISTS script_id UUID REFERENCES scripts(id) ON DELETE SET NULL;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS audio_url TEXT;
