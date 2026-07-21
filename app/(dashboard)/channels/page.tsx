'use client'

import { useState } from 'react'
import { PLATFORM_LABELS } from '@/lib/types'

const channels = [
  {
    platform: 'tiktok' as const,
    description: 'เชื่อมต่อ TikTok Shop เพื่อดึงข้อมูลสินค้าและยอดขาย',
    fields: [
      { label: 'Affiliate ID', placeholder: 'TikTok Affiliate ID ของคุณ', type: 'text' },
    ],
    connected: true,
    displayName: 'TikTok Shop Creator',
  },
  {
    platform: 'shopee' as const,
    description: 'เชื่อมต่อ Shopee Affiliate API',
    fields: [
      { label: 'API Key', placeholder: 'วาง Shopee API Key', type: 'password' },
      { label: 'Partner ID', placeholder: 'วาง Partner ID', type: 'text' },
    ],
    connected: false,
    displayName: '',
  },
  {
    platform: 'lazada' as const,
    description: 'เชื่อมต่อ Lazada Affiliate API',
    fields: [
      { label: 'API Key', placeholder: 'วาง Lazada API Key', type: 'password' },
      { label: 'API Secret', placeholder: 'วาง API Secret', type: 'password' },
    ],
    connected: false,
    displayName: '',
  },
  {
    platform: 'youtube' as const,
    description: 'เชื่อมต่อ YouTube เพื่อดึงข้อมูล Analytics',
    fields: [
      { label: 'Channel ID', placeholder: 'UC...', type: 'text' },
    ],
    connected: false,
    displayName: '',
  },
]

export default function ChannelsPage() {
  const [activeTab, setActiveTab] = useState<string>('all')

  const platforms = ['all', 'tiktok', 'shopee', 'lazada', 'youtube']
  const filtered = activeTab === 'all' ? channels : channels.filter(c => c.platform === activeTab)

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <header className="bg-[#1a1a2e] border-b border-[#2a2a4a] px-7 py-4 flex items-center sticky top-0 z-10">
        <h1 className="text-base font-semibold">📡 Channel Connections</h1>
      </header>

      <div className="p-7">
        <p className="text-sm text-gray-500 mb-6">เชื่อมต่อบัญชี affiliate ของคุณเพื่อดึงข้อมูลและโพสต์อัตโนมัติ</p>

        {/* Platform Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {platforms.map(p => (
            <button
              key={p}
              onClick={() => setActiveTab(p)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm border transition-all ${
                activeTab === p
                  ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                  : 'border-[#2a2a4a] text-gray-400 hover:border-purple-500/50'
              }`}
            >
              {p === 'all' ? '🌐 ทั้งหมด' : (
                <>{PLATFORM_LABELS[p as keyof typeof PLATFORM_LABELS].emoji} {PLATFORM_LABELS[p as keyof typeof PLATFORM_LABELS].name}</>
              )}
            </button>
          ))}
        </div>

        {/* Channel Cards */}
        <div className="grid grid-cols-2 gap-4 max-w-4xl">
          {filtered.map(channel => {
            const info = PLATFORM_LABELS[channel.platform]
            return (
              <div key={channel.platform} className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: info.bg }}>
                    {info.emoji}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{info.name}</div>
                    <div className="text-xs" style={{ color: channel.connected ? '#22c55e' : '#f59e0b' }}>
                      {channel.connected ? '● เชื่อมต่อแล้ว' : '● รอเชื่อมต่อ'}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 mb-4">{channel.description}</p>

                {/* Fields */}
                <div className="space-y-3 mb-4">
                  {channel.fields.map((field, i) => (
                    <div key={i}>
                      <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full bg-[#111] border border-[#2a2a4a] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
                      />
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {channel.connected ? (
                    <>
                      <button className="flex-1 px-3 py-2 border border-[#2a2a4a] rounded-lg text-xs text-gray-400 hover:border-purple-500/50 transition-all">
                        🔄 รีเฟรช
                      </button>
                      <button className="flex-1 px-3 py-2 border border-red-500/30 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-all">
                        ❌ ตัดการเชื่อมต่อ
                      </button>
                    </>
                  ) : (
                    <button className="flex-1 px-3 py-2 bg-green-500/20 border border-green-500/40 rounded-lg text-xs text-green-400 hover:bg-green-500/30 transition-all">
                      ✓ เชื่อมต่อ
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Extension Info */}
        <div className="mt-8 bg-purple-500/10 border border-purple-500/30 rounded-xl p-5 max-w-4xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔌</span>
            <div>
              <div className="font-semibold text-sm mb-1">ต้องการดึงข้อมูล TikTok อัตโนมัติ?</div>
              <p className="text-xs text-gray-400 mb-3">
                ติดตั้ง Chrome Extension ของเราเพื่อดึงข้อมูลสินค้าและยอดขายจาก TikTok Shop โดยอัตโนมัติ
              </p>
              <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-xs font-medium transition-all">
                📦 ดาวน์โหลด Chrome Extension
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
