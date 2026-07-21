'use client'

import { useState, useEffect } from 'react'
import { PLATFORM_LABELS, type Commission, type Platform } from '@/lib/types'

export default function CommissionPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [platform, setPlatform] = useState<Platform | 'all'>('all')
  const [status, setStatus] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all')

  useEffect(() => {
    fetchCommissions()
  }, [])

  async function fetchCommissions() {
    setLoading(true)
    try {
      const res = await fetch('/api/commissions')
      if (res.ok) {
        const data = await res.json()
        setCommissions(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const platforms: Platform[] = ['tiktok', 'shopee', 'lazada', 'youtube']
  const statuses = ['all', 'pending', 'confirmed', 'cancelled'] as const

  const filtered = commissions.filter(c => {
    const pMatch = platform === 'all' || c.platform === platform
    const sMatch = status === 'all' || c.status === status
    return pMatch && sMatch
  })

  const totalConfirmed = filtered.filter(c => c.status === 'confirmed').reduce((sum, c) => sum + c.amount, 0)
  const totalPending = filtered.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0)
  const totalCancelled = filtered.filter(c => c.status === 'cancelled').reduce((sum, c) => sum + c.amount, 0)

  const statusColors = {
    confirmed: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    cancelled: 'bg-red-500/20 text-red-400',
  }

  const statusLabels = {
    confirmed: 'ได้รับแล้ว',
    pending: 'รอตรวจสอบ',
    cancelled: 'ยกเลิก',
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <header className="bg-[#1a1a2e] border-b border-[#2a2a4a] px-7 py-4 sticky top-0 z-10">
        <h1 className="text-base font-semibold">💰 Commission</h1>
      </header>

      <div className="p-7">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6 max-w-4xl">
          <div className="bg-[#1a1a2e] rounded-xl p-5 border border-[#2a2a4a]">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">💚 ได้รับแล้ว</div>
            <div className="text-2xl font-bold text-green-400">฿{Math.round(totalConfirmed).toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">{filtered.filter(c => c.status === 'confirmed').length} รายการ</div>
          </div>
          <div className="bg-[#1a1a2e] rounded-xl p-5 border border-[#2a2a4a]">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">⏳ รอตรวจสอบ</div>
            <div className="text-2xl font-bold text-yellow-400">฿{Math.round(totalPending).toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">{filtered.filter(c => c.status === 'pending').length} รายการ</div>
          </div>
          <div className="bg-[#1a1a2e] rounded-xl p-5 border border-[#2a2a4a]">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">❌ ยกเลิก</div>
            <div className="text-2xl font-bold text-red-400">฿{Math.round(totalCancelled).toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">{filtered.filter(c => c.status === 'cancelled').length} รายการ</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-5 max-w-4xl">
          {/* Platform filter */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setPlatform('all')}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${platform === 'all' ? 'border-purple-500 text-purple-400 bg-purple-500/10' : 'border-[#2a2a4a] text-gray-400 hover:border-purple-500/50'}`}
            >
              ทั้งหมด
            </button>
            {platforms.map(p => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${platform === p ? 'border-purple-500 text-purple-400 bg-purple-500/10' : 'border-[#2a2a4a] text-gray-400 hover:border-purple-500/50'}`}
              >
                {PLATFORM_LABELS[p].emoji}
              </button>
            ))}
          </div>
          {/* Status filter */}
          <div className="flex gap-1.5">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${status === s ? 'border-purple-500 text-purple-400 bg-purple-500/10' : 'border-[#2a2a4a] text-gray-400 hover:border-purple-500/50'}`}
              >
                {s === 'all' ? 'ทุกสถานะ' : statusLabels[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] overflow-hidden max-w-4xl">
          {loading ? (
            <div className="text-center py-12 text-gray-500">กำลังโหลด...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">ยังไม่มีข้อมูล commission</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a4a]">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">สินค้า</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">แพลตฟอร์ม</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">ยอด</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">วันที่</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const info = PLATFORM_LABELS[c.platform]
                  return (
                    <tr key={c.id} className="border-b border-[#1a1a2e] last:border-0 hover:bg-[#2a2a4a]/30">
                      <td className="px-5 py-3">
                        <div className="font-medium truncate max-w-[200px]">{c.product_name || '—'}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs">{info.emoji} {info.name}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-semibold text-green-400">฿{c.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[c.status]}`}>
                          {statusLabels[c.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        {c.order_date ? new Date(c.order_date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
