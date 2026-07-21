'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('api-keys')

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <header className="bg-[#1a1a2e] border-b border-[#2a2a4a] px-7 py-4 flex items-center sticky top-0 z-10">
        <h1 className="text-base font-semibold">⚙️ Settings</h1>
      </header>

      <div className="p-7 max-w-3xl">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#1a1a2e] p-1 rounded-lg w-fit">
          {[
            { key: 'api-keys', label: '🔐 API Keys' },
            { key: 'profile', label: '👤 Profile' },
            { key: 'notifications', label: '🔔 Notifications' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm transition-all ${
                activeTab === tab.key
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* API Keys */}
        {activeTab === 'api-keys' && (
          <div className="space-y-5">
            <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-5">
              <h3 className="font-semibold text-sm mb-1">🤖 Gemini API</h3>
              <p className="text-xs text-gray-500 mb-3">ใช้สำหรับเขียนสคริปต์วิดีโออัตโนมัติ</p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="วาง Gemini API Key ของคุณ..."
                  className="flex-1 bg-[#111] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-sm"
                />
                <button className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-medium transition-all">
                  บันทึก
                </button>
              </div>
              <p className="text-[10px] text-gray-600 mt-2">🔒 Key จะถูกเก็บอย่างปลอดภัยในฐานข้อมูลของคุณเท่านั้น</p>
            </div>

            <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-5">
              <h3 className="font-semibold text-sm mb-1">🎬 Google Flow</h3>
              <p className="text-xs text-gray-500 mb-3">ใช้สำหรับสร้างวิดีโอด้วย AI</p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="วาง Google Flow API Key..."
                  className="flex-1 bg-[#111] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-sm"
                />
                <button className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-medium transition-all">
                  บันทึก
                </button>
              </div>
              <p className="text-[10px] text-gray-600 mt-2">
                ต้องมีบัญชี Google Flow Pro หรือ Ultra —{' '}
                <a href="https://labs.google/fx/tools/flow" target="_blank" className="text-purple-400 underline">
                  สมัครที่นี่
                </a>
              </p>
            </div>

            <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-5">
              <h3 className="font-semibold text-sm mb-1">📦 Supabase</h3>
              <p className="text-xs text-gray-500 mb-3">การเชื่อมต่อฐานข้อมูล</p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Supabase URL"
                  className="w-full bg-[#111] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-sm"
                />
                <input
                  type="password"
                  placeholder="Supabase Anon Key"
                  className="w-full bg-[#111] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-5">
            <h3 className="font-semibold text-sm mb-4">ข้อมูลส่วนตัว</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">ชื่อ</label>
                <input type="text" defaultValue="Mind Trade" className="w-full bg-[#111] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">อีเมล</label>
                <input type="email" defaultValue="mind@trade.com" className="w-full bg-[#111] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Timezone</label>
                <select className="w-full bg-[#111] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-sm">
                  <option>Asia/Bangkok (GMT+7)</option>
                  <option>Asia/Singapore (GMT+8)</option>
                </select>
              </div>
              <div className="pt-2">
                <button className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-medium transition-all">
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-5">
            <h3 className="font-semibold text-sm mb-4">การแจ้งเตือน</h3>
            <div className="space-y-3">
              {[
                { label: 'แจ้งเตือนเมื่อมี Commission ใหม่', desc: 'ส่ง notification เมื่อมียอด commission เข้ามา', enabled: true },
                { label: 'แจ้งเตือนวิดีโอสร้างเสร็จ', desc: 'ส่ง notification เมื่อวิดีโอสร้างเสร็จแล้ว', enabled: true },
                { label: 'รายงานประจำสัปดาห์', desc: 'ส่งสรุปรายได้ประจำสัปดาห์ทางอีเมล', enabled: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                  <button className={`w-10 h-6 rounded-full transition-all relative ${item.enabled ? 'bg-purple-500' : 'bg-[#2a2a4a]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${item.enabled ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
