'use client'

import { useState, useEffect } from 'react'
import { PLATFORM_LABELS, type Platform } from '@/lib/types'

interface Commission {
  id: string
  platform: Platform
  amount: number
  status: 'pending' | 'confirmed' | 'cancelled'
  product_name: string | null
  created_at: string
}

interface PlatformSummary {
  total: number
  confirmed: number
  pending: number
}

const chartData = [30, 45, 60, 40, 75, 55, 90]

export default function DashboardPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [summary, setSummary] = useState<Record<Platform, PlatformSummary>>({
    tiktok: { total: 0, confirmed: 0, pending: 0 },
    shopee: { total: 0, confirmed: 0, pending: 0 },
    lazada: { total: 0, confirmed: 0, pending: 0 },
    youtube: { total: 0, confirmed: 0, pending: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Platform | 'all'>('all')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [commRes] = await Promise.all([
        fetch('/api/commissions?limit=20'),
      ])

      const commData: Commission[] = await commRes.json()

      // Calculate summary
      const sum: Record<string, PlatformSummary> = {
        tiktok: { total: 0, confirmed: 0, pending: 0 },
        shopee: { total: 0, confirmed: 0, pending: 0 },
        lazada: { total: 0, confirmed: 0, pending: 0 },
        youtube: { total: 0, confirmed: 0, pending: 0 },
      }

      for (const c of commData) {
        sum[c.platform].total += c.amount
        if (c.status === 'confirmed') sum[c.platform].confirmed += c.amount
        else if (c.status === 'pending') sum[c.platform].pending += c.amount
      }

      setCommissions(commData)
      setSummary(sum as Record<Platform, PlatformSummary>)
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'all'
    ? commissions
    : commissions.filter(c => c.platform === filter)

  const platforms: Platform[] = ['tiktok', 'shopee', 'lazada', 'youtube']

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Topbar */}
      <header className="bg-[#1a1a2e] border-b border-[#2a2a4a] px-7 py-4 flex items-center gap-4 sticky top-0 z-10">
        <h1 className="text-base font-semibold">Dashboard</h1>
        <div className="ml-auto flex gap-1 bg-[#0f0f0f] p-1 rounded-lg">
          {['Overview', 'Reports'].map(tab => (
            <button
              key={tab}
              className={`px-4 py-1.5 rounded-md text-xs transition-colors ${
                tab === 'Overview'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="p-7">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {platforms.map(platform => {
            const data = summary[platform]
            const info = PLATFORM_LABELS[platform]
            const change = data.total > 0 ? Math.round((data.confirmed / data.total) * 100) : 0
            return (
              <div key={platform} className="bg-[#1a1a2e] rounded-xl p-5 border border-[#2a2a4a]">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                  {info.emoji} {info.name}
                </div>
                <div className="text-2xl font-bold mb-1" style={{ color: info.color }}>
                  ฿{Math.round(data.total).toLocaleString()}
                </div>
                <div className="text-xs text-green-400">
                  {data.confirmed > 0 && `↑ ${change}% confirmed`}
                  {!data.confirmed && 'No data yet'}
                </div>
              </div>
            )
          })}
        </div>

        {/* Platform Filter */}
        <div className="flex gap-2 mb-5 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm border transition-all ${
              filter === 'all'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                : 'border-[#2a2a4a] text-gray-400 hover:border-purple-500/50'
            }`}
          >
            🌐 All Platforms
          </button>
          {platforms.map(p => {
            const info = PLATFORM_LABELS[p]
            return (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm border transition-all ${
                  filter === p
                    ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                    : 'border-[#2a2a4a] text-gray-400 hover:border-purple-500/50'
                }`}
              >
                <span>{info.emoji}</span>
                <span>{info.name}</span>
              </button>
            )
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-5">
          {/* Recent Commissions */}
          <div className="col-span-2 bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-300">Recent Commissions</h2>
              <button className="px-3 py-1.5 text-xs border border-[#2a2a4a] rounded-lg text-gray-400 hover:border-purple-500/50 hover:text-gray-300 transition-all">
                Export
              </button>
            </div>

            {loading ? (
              <div className="text-center py-10 text-gray-500">กำลังโหลด...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-500">ยังไม่มีข้อมูล</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-[#2a2a4a]">
                    <th className="text-left py-2 font-medium text-xs uppercase tracking-wide">Product</th>
                    <th className="text-left py-2 font-medium text-xs uppercase tracking-wide">Platform</th>
                    <th className="text-left py-2 font-medium text-xs uppercase tracking-wide">Commission</th>
                    <th className="text-left py-2 font-medium text-xs uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => {
                    const info = PLATFORM_LABELS[row.platform]
                    return (
                      <tr key={row.id} className="border-b border-[#1a1a2e] last:border-0">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-md bg-[#2a2a4a] shrink-0" />
                            <span className="truncate">{row.product_name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-gray-400">
                          {info.emoji} {info.name}
                        </td>
                        <td className="py-2.5 font-medium">฿{row.amount}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            row.status === 'confirmed'
                              ? 'bg-green-500/20 text-green-400'
                              : row.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {row.status === 'confirmed' ? 'Confirmed' : row.status === 'pending' ? 'Pending' : 'Cancelled'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}

            {/* Mini Chart */}
            <div className="mt-5 h-28 flex items-end gap-1 px-1">
              {chartData.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-gradient-to-t from-purple-600/60 to-purple-500/90 transition-all hover:from-purple-600/80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex gap-1 pt-2 px-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <span key={d} className="flex-1 text-center text-[10px] text-gray-600">{d}</span>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-5">
            <h2 className="text-sm font-medium text-gray-300 mb-4">Top Products</h2>
            <div className="space-y-3">
              {platforms.map(platform => {
                const info = PLATFORM_LABELS[platform]
                const total = summary[platform].total
                if (total === 0) return null
                return (
                  <div key={platform} className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs w-4 text-center">{info.emoji}</span>
                    <div className="w-10 h-10 rounded-md bg-[#2a2a4a] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{platform.charAt(0).toUpperCase() + platform.slice(1)} Products</div>
                      <div className="text-xs text-gray-500">{Math.round(total / 320)} orders</div>
                    </div>
                    <div className="text-sm text-green-400 font-semibold shrink-0">
                      ฿{Math.round(total).toLocaleString()}
                    </div>
                  </div>
                )
              })}
              {loading && <div className="text-center py-4 text-gray-500">กำลังโหลด...</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
