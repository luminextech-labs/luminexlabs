'use client'

import { useState } from 'react'
import { PLATFORM_LABELS, type Platform } from '@/lib/types'

export default function TestDataPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  async function insertTestData() {
    setLoading(true)
    setResult('')
    try {
      const data = [
        { platform: 'tiktok', amount: 12450, status: 'confirmed', product_name: 'Air Purifier รุ่นท็อป' },
        { platform: 'shopee', amount: 8320, status: 'pending', product_name: 'ครีมบำรุงผิว Hyaluronic' },
        { platform: 'lazada', amount: 5180, status: 'confirmed', product_name: 'หูฟัง Bluetooth Sony' },
        { platform: 'youtube', amount: 3960, status: 'pending', product_name: 'แว่นตา Gaming RGB' },
        { platform: 'tiktok', amount: 2890, status: 'confirmed', product_name: 'กล้อง Webcam 4K Pro' },
        { platform: 'shopee', amount: 1450, status: 'pending', product_name: 'เครื่องกรองน้ำ RO' },
        { platform: 'lazada', amount: 3200, status: 'confirmed', product_name: 'แท็บเล็ต Samsung Tab S9' },
        { platform: 'youtube', amount: 2100, status: 'pending', product_name: 'เก้าอี้ Gaming Ergonomic' },
      ]

      for (const item of data) {
        const res = await fetch('/api/commissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: '00000000-0000-0000-0000-000000000001',
            ...item,
            currency: 'THB',
          }),
        })
        if (!res.ok) {
          const err = await res.text()
          setResult(`Error inserting ${item.product_name}: ${err}`)
          return
        }
      }
      setResult(`✅ Inserted ${data.length} commissions successfully!`)
    } catch (err) {
      setResult(`Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <header className="bg-[#1a1a2e] border-b border-[#2a2a4a] px-7 py-4 sticky top-0 z-10">
        <h1 className="text-base font-semibold">🧪 Test Data</h1>
      </header>
      <div className="p-7 max-w-2xl">
        <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-6">
          <h2 className="font-semibold mb-2">เพิ่มข้อมูลทดสอบ</h2>
          <p className="text-sm text-gray-500 mb-4">
            กดปุ่มด้านล่างเพื่อเพิ่มข้อมูล commission ทดสอบ 8 รายการ
          </p>
          <button
            onClick={insertTestData}
            disabled={loading}
            className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-all"
          >
            {loading ? 'กำลังเพิ่ม...' : '➕ เพิ่ม Test Data'}
          </button>
          {result && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${result.includes('Error') || result.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
