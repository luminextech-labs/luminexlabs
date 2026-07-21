'use client'

import { PLATFORM_LABELS } from '@/lib/types'

const mockSchedule = [
  { id: '1', title: 'รีวิวเสื้อยืด', platform: 'tiktok' as const, scheduledAt: '2026-07-22 09:00', status: 'scheduled' },
  { id: '2', title: 'แนะนำรองเท้าผ้าใบ', platform: 'tiktok' as const, scheduledAt: '2026-07-23 14:30', status: 'scheduled' },
  { id: '3', title: 'Unboxing กระเป๋า', platform: 'youtube' as const, scheduledAt: '2026-07-24 18:00', status: 'draft' },
]

const statusColors = {
  scheduled: 'bg-purple-500/20 text-purple-400',
  draft: 'bg-gray-500/20 text-gray-400',
  posted: 'bg-green-500/20 text-green-400',
}

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <header className="bg-[#1a1a2e] border-b border-[#2a2a4a] px-7 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold">📅 Schedule</h1>
          <button className="ml-auto px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-xs font-medium transition-all">
            + วางแผนโพสต์
          </button>
        </div>
      </header>

      <div className="p-7">
        {/* Calendar Grid Placeholder */}
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-[#2a2a4a] mb-6 max-w-4xl">
          <div className="text-center text-gray-500 text-sm py-8">
            📅 Calendar view — กำลังพัฒนา
          </div>
        </div>

        {/* Schedule List */}
        <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] overflow-hidden max-w-4xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a4a]">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">วิดีโอ</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">แพลตฟอร์ม</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">กำหนดโพสต์</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase"></th>
              </tr>
            </thead>
            <tbody>
              {mockSchedule.map(item => {
                const info = PLATFORM_LABELS[item.platform]
                return (
                  <tr key={item.id} className="border-b border-[#1a1a2e] last:border-0 hover:bg-[#2a2a4a]/30">
                    <td className="px-5 py-3 font-medium">{item.title}</td>
                    <td className="px-5 py-3 text-xs">{info.emoji} {info.name}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {new Date(item.scheduledAt).toLocaleString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[item.status as keyof typeof statusColors]}`}>
                        {item.status === 'scheduled' ? 'กำหนดโพสต์แล้ว' : item.status === 'draft' ? 'ฉบับร่าง' : 'โพสต์แล้ว'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button className="text-xs px-3 py-1.5 border border-[#2a2a4a] rounded-lg hover:border-purple-500/50 text-gray-400 hover:text-white transition-all">
                        ✏️ แก้ไข
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
