'use client'

import { useState, useEffect } from 'react'
import { PLATFORM_LABELS, type Platform } from '@/lib/types'

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <header className="bg-[#1a1a2e] border-b border-[#2a2a4a] px-7 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold">📊 Analytics</h1>
          <div className="ml-auto flex gap-1 bg-[#0f0f0f] p-1 rounded-lg">
            {(['7d', '30d', '90d'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-xs transition-colors ${period === p ? 'bg-purple-500 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                {p === '7d' ? '7 วัน' : p === '30d' ? '30 วัน' : '90 วัน'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="p-7">
        {/* Top Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6 max-w-4xl">
          {[
            { label: 'ยอดรวม', value: '฿1,585', change: '+12%', positive: true },
            { label: 'คอมมิชชันที่ได้', value: '฿1,025', change: '+8%', positive: true },
            { label: 'ยอดคงค้าง', value: '฿560', change: '+5%', positive: true },
            { label: 'ออเดอร์ทั้งหมด', value: '12', change: '+3', positive: true },
          ].map((stat, i) => (
            <div key={i} className="bg-[#1a1a2e] rounded-xl p-5 border border-[#2a2a4a]">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">{stat.label}</div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className={`text-xs ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Chart Placeholder */}
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-[#2a2a4a] mb-6 max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-300">📈 Commission Trend</h2>
          </div>
          <div className="h-40 flex items-end gap-1">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-purple-600/60 to-purple-500/90" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex gap-1 mt-2">
            {['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'].map(m => (
              <span key={m} className="flex-1 text-center text-[10px] text-gray-600">{m}</span>
            ))}
          </div>
        </div>

        {/* By Platform */}
        <div className="grid grid-cols-2 gap-4 max-w-4xl">
          {(['tiktok', 'shopee', 'lazada', 'youtube'] as Platform[]).map(platform => {
            const info = PLATFORM_LABELS[platform]
            const share = platform === 'tiktok' ? 72 : platform === 'shopee' ? 18 : platform === 'lazada' ? 8 : 2
            return (
              <div key={platform} className="bg-[#1a1a2e] rounded-xl p-5 border border-[#2a2a4a]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{info.emoji}</span>
                  <div>
                    <div className="font-semibold text-sm">{info.name}</div>
                    <div className="text-xs text-gray-500">{share}% ของยอดทั้งหมด</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="font-bold text-green-400">฿{platform === 'tiktok' ? '1,142' : platform === 'shopee' ? '285' : platform === 'lazada' ? '127' : '31'}</div>
                  </div>
                </div>
                <div className="w-full bg-[#0f0f0f] rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${share}%`, background: info.color }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
