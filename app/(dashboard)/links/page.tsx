'use client'

import { useState } from 'react'
import { PLATFORM_LABELS, type Platform } from '@/lib/types'

const mockLinks = [
  { id: '1', name: 'เสื้อยืด Oversize สีดำ', platform: 'tiktok' as Platform, clicks: 124, conversions: 3, earnings: 450 },
  { id: '2', name: 'รองเท้าผ้าใบ รุ่น 2025', platform: 'tiktok' as Platform, clicks: 89, conversions: 1, earnings: 120 },
  { id: '3', name: 'กระเป๋าสะพาย สีน้ำตาล', platform: 'shopee' as Platform, clicks: 56, conversions: 2, earnings: 280 },
]

export default function LinksPage() {
  const [copied, setCopied] = useState<string | null>(null)

  function copyLink(code: string) {
    navigator.clipboard.writeText(`https://deela.app/l/${code}`)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <header className="bg-[#1a1a2e] border-b border-[#2a2a4a] px-7 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold">🔗 Affiliate Links</h1>
          <button className="ml-auto px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-xs font-medium transition-all">
            + สร้างลิงก์ใหม่
          </button>
        </div>
      </header>

      <div className="p-7">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6 max-w-4xl">
          {[
            { label: 'ลิงก์ทั้งหมด', value: mockLinks.length.toString() },
            { label: 'ยอดคลิกรวม', value: mockLinks.reduce((s, l) => s + l.clicks, 0).toString() },
            { label: 'ยอดสั่งซื้อรวม', value: mockLinks.reduce((s, l) => s + l.conversions, 0).toString() },
          ].map((s, i) => (
            <div key={i} className="bg-[#1a1a2e] rounded-xl p-5 border border-[#2a2a4a]">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{s.label}</div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Links Table */}
        <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] overflow-hidden max-w-4xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a4a]">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">ลิงก์</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">แพลตฟอร์ม</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">คลิก</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">สั่งซื้อ</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">รายได้</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase"></th>
              </tr>
            </thead>
            <tbody>
              {mockLinks.map(link => {
                const info = PLATFORM_LABELS[link.platform]
                const shortCode = link.id.padStart(6, '0')
                return (
                  <tr key={link.id} className="border-b border-[#1a1a2e] last:border-0 hover:bg-[#2a2a4a]/30">
                    <td className="px-5 py-3">
                      <div className="font-medium truncate max-w-[200px]">{link.name}</div>
                      <div className="text-xs text-gray-500 font-mono">deela.app/l/{shortCode}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs">{info.emoji} {info.name}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{link.clicks}</td>
                    <td className="px-5 py-3 text-gray-400">{link.conversions}</td>
                    <td className="px-5 py-3 text-green-400 font-semibold">฿{link.earnings}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => copyLink(shortCode)}
                        className="text-xs px-3 py-1.5 border border-[#2a2a4a] rounded-lg hover:border-purple-500/50 text-gray-400 hover:text-white transition-all"
                      >
                        {copied === shortCode ? '✓ คัดลอกแล้ว' : '📋 คัดลอก'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
