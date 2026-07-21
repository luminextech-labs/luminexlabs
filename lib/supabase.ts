import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type Database = {
  public: {
    Tables: {
      platform_connections: {
        Row: {
          id: string
          user_id: string
          platform: 'tiktok' | 'shopee' | 'lazada' | 'youtube'
          display_name: string | null
          credentials: Record<string, unknown>
          status: string
          last_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['platform_connections']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['platform_connections']['Insert']>
      }
      commissions: {
        Row: {
          id: string
          user_id: string
          product_id: string | null
          platform: 'tiktok' | 'shopee' | 'lazada' | 'youtube'
          amount: number
          currency: string
          status: 'pending' | 'confirmed' | 'cancelled'
          product_name: string | null
          order_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['commissions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['commissions']['Insert']>
      }
      products: {
        Row: {
          id: string
          user_id: string
          platform: 'tiktok' | 'shopee' | 'lazada' | 'youtube'
          name: string
          image_url: string | null
          price: number | null
          affiliate_link: string | null
          commission_rate: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      videos: {
        Row: {
          id: string
          user_id: string
          product_id: string | null
          title: string | null
          script: string | null
          voice_id: string | null
          voice_name: string | null
          template: string | null
          video_url: string | null
          platform_target: 'tiktok' | 'shopee' | 'lazada' | 'youtube'
          status: 'draft' | 'generating' | 'ready' | 'posted'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['videos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['videos']['Insert']>
      }
      affiliate_links: {
        Row: {
          id: string
          user_id: string
          product_id: string | null
          platform: 'tiktok' | 'shopee' | 'lazada' | 'youtube'
          original_url: string
          tracked_code: string
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          clicks: number
          conversions: number
          earnings: number
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['affiliate_links']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['affiliate_links']['Insert']>
      }
    }
  }
}
