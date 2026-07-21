'use client'

import { PLATFORM_LABELS, VOICES } from '@/lib/types'

const mockScripts = [
  {
    id: '1',
    title: 'สคริปต์ รีวิวเสื้อยืด',
    platform: 'tiktok',
    status: 'ready',
    script: 'สวัสดีครับวันนี้ผมจะมารีวิวเสื้อยืดตัวนี้ให้ดูกัน...',
    voice: 'th_pitcha_f',
  },
  {
    id: '2',
    title: 'สคริปต์ แนะนำรองเท้า',
    platform: 'tiktok',
    status: 'draft',
    script: '',
    voice: 'th_nate_m',
  },
]

export default function ScriptsPage() {
  const statusColors = {
    draft: 'bg-gray-500/20 text-gray-400',
    ready: 'bg-green-500/20 text-green-400',
    used: 'bg-purple-500/20 text-purple-400',
  }

  const statusLabels = {
    draft: 'ฉบับร่าง',
    ready: 'พร้อมใช้',
    used: 'ใช้แล้ว',
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <header className="bg-[#1a1a2e] border-b border-[#2a2a4a] px-7 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold">✍️ Scripts</h1>
          <button className="ml-auto px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-xs font-medium transition-all">
            + สร้างสคริปต์ใหม่
          </button>
        </div>
      </header>

      <div className="p-7">
        {/* Templates */}
        <div className="mb-6 max-w-4xl">
          <h2 className="text-sm font-medium text-gray-300 mb-3">📝 เทมเพลตสคริปต์</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { name: 'รีวิวสินค้า', emoji: '⭐', desc: 'เน้นจุดเด่น-จุดด้อย' },
              { name: 'Unboxing', emoji: '📦', desc: 'แกะกล่อง + ลองใช้' },
              { name: 'How-to', emoji: '🎓', desc: 'สอนวิธีใช้' },
              { name: 'Before/After', emoji: '🔄', desc: 'เปรียบเทียบผลลัพธ์' },
            ].map((t, i) => (
              <button key={i} className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl p-4 text-left hover:border-purple-500/50 transition-all">
                <div className="text-xl mb-1">{t.emoji}</div>
                <div className="text-sm font-medium text-white">{t.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Scripts List */}
        <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] overflow-hidden max-w-4xl">
          {mockScripts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">ยังไม่มีสคริปต์</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a4a]">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">ชื่อ</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">แพลตฟอร์ม</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">เสียง</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody>
                {mockScripts.map(script => {
                  const info = PLATFORM_LABELS[script.platform as keyof typeof PLATFORM_LABELS]
                  const voice = VOICES.find(v => v.id === script.voice)
                  return (
                    <tr key={script.id} className="border-b border-[#1a1a2e] last:border-0 hover:bg-[#2a2a4a]/30">
                      <td className="px-5 py-3">
                        <div className="font-medium">{script.title}</div>
                        {script.script && (
                          <div className="text-xs text-gray-500 truncate max-w-[200px] mt-0.5">
                            {script.script.substring(0, 50)}...
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs">{info.emoji} {info.name}</td>
                      <td className="px-5 py-3 text-xs text-gray-400">{voice?.name || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[script.status as keyof typeof statusColors]}`}>
                          {statusLabels[script.status as keyof typeof statusLabels]}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button className="text-xs px-3 py-1.5 border border-[#2a2a4a] rounded-lg hover:border-purple-500/50 text-gray-400 hover:text-white transition-all">
                            ✏️
                          </button>
                          <button className="text-xs px-3 py-1.5 border border-[#2a2a4a] rounded-lg hover:border-green-500/50 text-gray-400 hover:text-green-400 transition-all">
                            ▶️
                          </button>
                        </div>
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
