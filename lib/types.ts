// ============================================================
// LuminexLabs — Core Types
// ============================================================

export type Platform = 'tiktok' | 'shopee' | 'lazada' | 'youtube'
export type CommissionStatus = 'pending' | 'confirmed' | 'cancelled'
export type VideoStatus = 'draft' | 'generating' | 'ready' | 'posted'
export type LinkStatus = 'active' | 'inactive'

// ============================================================
// Database Tables
// ============================================================

export interface PlatformConnection {
  id: string
  user_id: string
  platform: Platform
  display_name: string | null
  credentials: PlatformCredentials
  status: 'connected' | 'disconnected'
  last_synced_at: string | null
  created_at: string
  updated_at: string
}

export interface PlatformCredentials {
  api_key?: string
  api_secret?: string
  access_token?: string
  refresh_token?: string
  partner_id?: string
  shop_id?: string
  channel_id?: string
}

export interface Product {
  id: string
  user_id: string
  platform: Platform
  external_id: string | null
  name: string
  image_url: string | null
  price: number | null
  affiliate_link: string | null
  commission_rate: number | null
  category: string | null
  created_at: string
  updated_at: string
}

export interface Commission {
  id: string
  user_id: string
  product_id: string | null
  platform: Platform
  external_transaction_id: string | null
  amount: number
  currency: string
  status: CommissionStatus
  product_name: string | null
  order_date: string | null
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  user_id: string
  product_id: string | null
  title: string | null
  script: string | null
  voice_id: string | null
  voice_name: string | null
  template: string | null
  video_url: string | null
  thumbnail_url: string | null
  platform_target: Platform
  status: VideoStatus
  duration_seconds: number | null
  created_at: string
  updated_at: string
}

export interface ScheduledPost {
  id: string
  user_id: string
  video_id: string | null
  platform: Platform
  scheduled_at: string
  caption: string | null
  hashtags: string | null
  status: 'scheduled' | 'posted' | 'cancelled'
  posted_at: string | null
  external_post_id: string | null
  created_at: string
}

export interface AffiliateLink {
  id: string
  user_id: string
  product_id: string | null
  platform: Platform
  original_url: string
  tracked_code: string
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  clicks: number
  conversions: number
  earnings: number
  status: LinkStatus
  created_at: string
  updated_at: string
}

export interface Script {
  id: string
  user_id: string
  product_id: string | null
  platform: Platform
  template: string
  script_text: string
  voice_id: string | null
  voice_name: string | null
  status: 'draft' | 'ready' | 'used'
  created_at: string
  updated_at: string
}

export interface UserApiKey {
  id: string
  user_id: string
  provider: string
  key_name: string | null
  encrypted_key: string
  is_active: boolean
  last_used_at: string | null
  created_at: string
}

// ============================================================
// UI Constants
// ============================================================

export const PLATFORM_LABELS: Record<Platform, { emoji: string; name: string; color: string; bg: string }> = {
  tiktok: { emoji: '📺', name: 'TikTok', color: '#ff0050', bg: '#ff005015' },
  shopee: { emoji: '🛒', name: 'Shopee', color: '#f58220', bg: '#f5822015' },
  lazada: { emoji: '🏬', name: 'Lazada', color: '#f2001a', bg: '#f2001a15' },
  youtube: { emoji: '▶️', name: 'YouTube', color: '#ff4444', bg: '#ff444415' },
}

export const VIDEO_TEMPLATES = [
  { id: 'short_8', name: 'คลิปสั้น 8 วินาที', icon: '⚡' },
  { id: 'short_24', name: 'คลิปสั้น 24 วินาที', icon: '🎯' },
  { id: 'podcast', name: 'Podcast 2 คน', icon: '🎙️' },
  { id: 'story', name: 'Story เล่าเรื่อง', icon: '📖' },
  { id: 'unboxing', name: 'Unboxing', icon: '🎨' },
  { id: 'review', name: 'Review', icon: '💡' },
  { id: 'trend', name: 'Trend', icon: '🔥' },
  { id: 'custom', name: 'Custom', icon: '➕' },
] as const

export const VOICES = [
  { id: 'th_pitcha_f', name: 'พิชชา (ผู้หญิงไทย)', language: 'th', gender: 'female' as const },
  { id: 'th_nate_m', name: 'ณเดช (ผู้ชายไทย)', language: 'th', gender: 'male' as const },
  { id: 'th_mint_f', name: 'มิ้นท์ (ผู้หญิงไทย อบอุ่น)', language: 'th', gender: 'female' as const },
  { id: 'th_nui_f', name: 'นุ้ย (ผู้หญิงไทย อ่อนโยน)', language: 'th', gender: 'female' as const },
  { id: 'en_emily_f', name: 'Emily (British Female)', language: 'en-GB', gender: 'female' as const },
  { id: 'en_jake_m', name: 'Jake (American Male)', language: 'en-US', gender: 'male' as const },
  { id: 'en_sarah_f', name: 'Sarah (American Female)', language: 'en-US', gender: 'female' as const },
  { id: 'zh_mei_f', name: 'Mei (Chinese Female)', language: 'zh', gender: 'female' as const },
]

export const SIDEBAR_MENU = [
  { section: 'Overview', items: [
    { icon: '📊', label: 'Dashboard', href: '/dashboard' },
    { icon: '📈', label: 'Analytics', href: '/analytics' },
    { icon: '💰', label: 'Commission', href: '/commission', badge: '3' },
  ]},
  { section: 'Channels', items: [
    { icon: '📺', label: 'TikTok', href: '/channels?t=tiktok' },
    { icon: '🛒', label: 'Shopee', href: '/channels?t=shopee' },
    { icon: '🏬', label: 'Lazada', href: '/channels?t=lazada' },
    { icon: '▶️', label: 'YouTube', href: '/channels?t=youtube' },
  ]},
  { section: 'Content', items: [
    { icon: '🎬', label: 'Video Generator', href: '/video-generator' },
    { icon: '📝', label: 'Scripts', href: '/scripts' },
    { icon: '📅', label: 'Schedule', href: '/schedule' },
    { icon: '🔗', label: 'Link Builder', href: '/links' },
  ]},
  { section: 'System', items: [
    { icon: '⚙️', label: 'Settings', href: '/settings' },
  ]},
]
