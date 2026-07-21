'use client'

import { useState } from 'react'
import { PLATFORM_LABELS, VIDEO_TEMPLATES, VOICES } from '@/lib/types'

export default function VideoGeneratorPage() {
  const [productUrl, setProductUrl] = useState('')
  const [platform, setPlatform] = useState('tiktok')
  const [selectedTemplate, setSelectedTemplate] = useState('short_8')
  const [selectedVoice, setSelectedVoice] = useState('th_pitcha_f')
  const [script, setScript] = useState('')
  const [generating, setGenerating] = useState(false)
  const [step, setStep] = useState(1)

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      setScript(`สวัสดีค่ะ วันนี้พี่มาจะมาแนะนำ ${productUrl ? 'สินค้านี้' : 'สินค้าที่พี่ชอบมากๆ'} เลยนะคะ...`)
      setGenerating(false)
      setStep(2)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Topbar */}
      <header className="bg-[#1a1a2e] border-b border-[#2a2a4a] px-7 py-4 flex items-center sticky top-0 z-10">
        <h1 className="text-base font-semibold">🎬 Video Generator</h1>
      </header>

      <div className="p-7 max-w-5xl">
        {/* Steps */}
        <div className="flex items-center gap-0 mb-8">
          {[
            { n: 1, label: 'เลือกสินค้า' },
            { n: 2, label: 'สคริปต์' },
            { n: 3, label: 'สร้างวิดีโอ' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center">
              <div className={`flex items-center gap-2 ${step >= s.n ? 'text-purple-400' : 'text-gray-500'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step > s.n ? 'bg-green-500 text-white' :
                  step === s.n ? 'bg-purple-500 text-white' : 'bg-[#2a2a4a]'
                }`}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span className="text-sm font-medium">{s.label}</span>
              </div>
              {i < 2 && <div className="flex-1 w-16 h-px bg-[#2a2a4a] mx-4" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left: Preview */}
          <div>
            <div className="bg-[#111] rounded-xl border border-[#2a2a4a] aspect-[9/16] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
              <div className="relative z-10 text-center px-6">
                <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center text-xl mb-4 mx-auto">
                  ▶
                </div>
                <div className="text-base font-semibold mb-1">
                  {productUrl ? 'สินค้าของคุณ' : 'Air Purifier รุ่นท็อป'}
                </div>
                <div className="text-xs text-gray-500">คลิปสั้น • 8 วินาที</div>
                <div className="text-xs text-gray-600 mt-4">ตัวอย่างวิดีโอที่จะสร้าง</div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="space-y-5">
            {/* Product URL */}
            <div>
              <label className="block text-xs text-gray-500 mb-2 font-medium">ลิงก์สินค้า</label>
              <input
                type="text"
                value={productUrl}
                onChange={e => setProductUrl(e.target.value)}
                placeholder="วางลิงก์ Shopee / Lazada / TikTok Shop..."
                className="w-full bg-[#111] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600"
              />
            </div>

            {/* Platform */}
            <div>
              <label className="block text-xs text-gray-500 mb-2 font-medium">แพลตฟอร์มเป้าหมาย</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => setPlatform(k)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-all ${
                      platform === k
                        ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                        : 'border-[#2a2a4a] text-gray-400'
                    }`}
                  >
                    <span>{v.emoji}</span>
                    <span>{v.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Template */}
            <div>
              <label className="block text-xs text-gray-500 mb-2 font-medium">เทมเพลต (7 โหมด)</label>
              <div className="grid grid-cols-4 gap-2">
                {VIDEO_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg border text-xs transition-all ${
                      selectedTemplate === t.id
                        ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                        : 'border-[#2a2a4a] text-gray-400 hover:border-[#444]'
                    }`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span className="text-center leading-tight">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice */}
            <div>
              <label className="block text-xs text-gray-500 mb-2 font-medium">AI เสียงพากย์</label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {VOICES.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVoice(v.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedVoice === v.id
                        ? 'border border-purple-500 text-white bg-purple-500/10'
                        : 'border border-transparent text-gray-400 hover:border-[#2a2a4a]'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#2a2a4a] flex items-center justify-center text-[9px]">▶</div>
                    <span>{v.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-3 border border-[#2a2a4a] rounded-lg text-sm text-gray-400 hover:border-purple-500/50 transition-all"
              >
                📝 ดูสคริปต์
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>⏳ กำลังสร้าง...</>
                ) : (
                  <>✨ สร้างวิดีโอ</>
                )}
              </button>
            </div>

            {/* Generated Script Preview */}
            {script && (
              <div className="bg-[#111] rounded-lg border border-[#2a2a4a] p-4">
                <div className="text-xs text-gray-500 mb-2 font-medium">📝 สคริปต์ที่สร้าง</div>
                <p className="text-sm text-gray-300 leading-relaxed">{script}</p>
                <button
                  onClick={() => setStep(3)}
                  className="mt-3 w-full py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-medium transition-all"
                >
                  🎬 ไปสร้างวิดีโอ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
