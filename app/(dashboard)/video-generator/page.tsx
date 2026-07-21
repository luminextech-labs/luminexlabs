'use client'

import { useState } from 'react'
import { PLATFORM_LABELS, VIDEO_TEMPLATES, VOICES } from '@/lib/types'

interface ScriptResult {
  title: string
  script: string
  hashtags: string[]
  duration: string
}

const THAI_VOICES = VOICES.filter(v => v.language === 'th')

const VOICE_MAP: Record<string, string> = {
  th_pitcha_f: 'th-TH-NiwatNeural',
  th_nate_m: 'th-TH-NiwatNeural',
  th_mint_f: 'th-TH-PremwadeeNeural',
  th_nui_f: 'th-TH-PremwadeeNeural',
}

export default function VideoGeneratorPage() {
  const [productUrl, setProductUrl] = useState('')
  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productDesc, setProductDesc] = useState('')
  const [platform, setPlatform] = useState('tiktok')
  const [selectedTemplate, setSelectedTemplate] = useState('short_8')
  const [selectedVoice, setSelectedVoice] = useState('th_pitcha_f')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [scriptResult, setScriptResult] = useState<ScriptResult | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerateScript() {
    if (!productName.trim()) {
      setError('กรุณากรอกชื่อสินค้า')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: productName.trim(),
          productPrice: productPrice ? parseFloat(productPrice) : null,
          productDesc: productDesc.trim() || null,
          platform,
          templateId: selectedTemplate,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'เกิดข้อผิดพลาด')
        return
      }

      setScriptResult(data.script)
      setStep(2)
    } catch (err) {
      setError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้')
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateAudio() {
    if (!scriptResult?.script) return

    setLoading(true)
    setError(null)
    setAudioUrl(null)

    try {
      const voiceId = VOICE_MAP[selectedVoice] || 'th-TH-NiwatNeural'

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scriptResult.script,
          voice: voiceId,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'สร้างเสียงไม่ได้')
        return
      }

      const url = `data:audio/mp3;base64,${data.audio}`
      setAudioUrl(url)
      setStep(3)
    } catch (err) {
      setError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้')
    } finally {
      setLoading(false)
    }
  }

  function downloadAudio() {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `tiktok-script-${Date.now()}.mp3`
    a.click()
  }

  function copyScript() {
    if (!scriptResult) return
    const text = `${scriptResult.title}\n\n${scriptResult.script}\n\n${scriptResult.hashtags.join(' ')}`
    navigator.clipboard.writeText(text)
  }

  function copyHashtags() {
    if (!scriptResult) return
    navigator.clipboard.writeText(scriptResult.hashtags.join(' '))
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Topbar */}
      <header className="bg-[#1a1a2e] border-b border-[#2a2a4a] px-7 py-4 flex items-center sticky top-0 z-10">
        <h1 className="text-base font-semibold">🎬 Video Generator</h1>
        <span className="ml-3 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
          AI Powered
        </span>
      </header>

      <div className="p-7 max-w-5xl">
        {/* Steps */}
        <div className="flex items-center mb-8">
          {[
            { n: 1, label: 'สินค้า', emoji: '📦' },
            { n: 2, label: 'AI บท', emoji: '✍️' },
            { n: 3, label: 'AI เสียง', emoji: '🎙️' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center">
              <button
                onClick={() => step > s.n && setStep(s.n)}
                className={`flex items-center gap-2 ${step >= s.n ? 'text-purple-400' : 'text-gray-500'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step > s.n ? 'bg-green-500 text-white' :
                  step === s.n ? 'bg-purple-500 text-white' : 'bg-[#2a2a4a]'
                }`}>
                  {step > s.n ? '✓' : s.emoji}
                </div>
                <span className="text-sm font-medium">{s.label}</span>
              </button>
              {i < 2 && <div className={`flex-1 w-16 h-px mx-4 ${step > s.n ? 'bg-green-500' : 'bg-[#2a2a4a]'}`} />}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 max-w-3xl">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* Left: Preview */}
          <div>
            <div className="bg-[#111] rounded-xl border border-[#2a2a4a] aspect-[9/16] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
              {step >= 1 && (
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-xs text-gray-400 mb-1">ชื่อสินค้า</div>
                  <div className="font-semibold text-sm truncate">
                    {productName || 'ยังไม่ได้กรอก'}
                  </div>
                </div>
              )}
              {step >= 2 && scriptResult && (
                <div className="absolute top-4 left-4 right-4">
                  <div className="bg-black/60 rounded-lg px-3 py-2 backdrop-blur">
                    <div className="text-xs text-gray-300 line-clamp-3">{scriptResult.script?.substring(0, 80)}...</div>
                  </div>
                </div>
              )}
              {step >= 3 && audioUrl && (
                <div className="absolute top-4 right-4">
                  <div className="bg-green-500/20 border border-green-500/40 rounded-full px-3 py-1 text-xs text-green-400 flex items-center gap-1">
                    🎙️ เสียงพร้อม
                  </div>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center text-xl mb-3 mx-auto border border-purple-500/40">
                    {step === 1 ? '📦' : step === 2 ? '✍️' : '🎙️'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {step === 1 ? 'กรอกข้อมูลสินค้า' : step === 2 ? 'รอ AI เขียนบท' : 'กดสร้างเสียง'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="space-y-5">
            {/* Step 1: Product Info */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-2 font-medium">ชื่อสินค้า *</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    placeholder="เช่น หน้ากากอนามัย N95"
                    className="w-full bg-[#111] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2 font-medium">ราคา (บาท)</label>
                  <input
                    type="number"
                    value={productPrice}
                    onChange={e => setProductPrice(e.target.value)}
                    placeholder="เช่น 299"
                    className="w-full bg-[#111] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2 font-medium">รายละเอียดเพิ่มเติม</label>
                  <textarea
                    value={productDesc}
                    onChange={e => setProductDesc(e.target.value)}
                    placeholder="คุณสมบัติ, จุดเด่น, ข้อมูลอื่นๆ..."
                    rows={3}
                    className="w-full bg-[#111] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500 outline-none resize-none"
                  />
                </div>

                {/* Template */}
                <div>
                  <label className="block text-xs text-gray-500 mb-2 font-medium">สไตล์คลิป</label>
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
                  <label className="block text-xs text-gray-500 mb-2 font-medium">เสียงพากย์</label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {THAI_VOICES.map(v => (
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
                        <span className="ml-auto text-xs text-gray-600">{v.gender === 'female' ? '♀' : '♂'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateScript}
                  disabled={loading}
                  className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  {loading ? '⏳ AI กำลังเขียนบท...' : '✨ สร้างบทด้วย AI'}
                </button>
              </>
            )}

            {/* Step 2: Script Result */}
            {step === 2 && scriptResult && (
              <>
                <div className="bg-[#111] rounded-xl border border-[#2a2a4a] p-4">
                  <div className="text-xs text-gray-500 mb-1">หัวข้อวิดีโอ</div>
                  <div className="font-semibold text-white text-lg mb-3">{scriptResult.title}</div>

                  <div className="text-xs text-gray-500 mb-1">📝 สคริปต์</div>
                  <div className="bg-[#0f0f0f] rounded-lg p-3 text-sm text-gray-300 leading-relaxed max-h-48 overflow-y-auto mb-3">
                    {scriptResult.script}
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-gray-500"># Hashtags</div>
                    <button onClick={copyHashtags} className="text-xs text-purple-400 hover:text-purple-300">📋 copy</button>
                  </div>
                  <div className="text-xs text-gray-400">
                    {scriptResult.hashtags?.join(' ') || '—'}
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    ⏱️ {scriptResult.duration || '~15 วินาที'}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyScript}
                    className="flex-1 py-3 border border-[#2a2a4a] rounded-lg text-sm text-gray-400 hover:border-purple-500/50 transition-all"
                  >
                    📋 คัดลอกบท
                  </button>
                  <button
                    onClick={handleGenerateAudio}
                    disabled={loading}
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? '⏳ กำลังสร้างเสียง...' : '🎙️ สร้างเสียงพากย์'}
                  </button>
                </div>

                <button
                  onClick={() => { setStep(1); setScriptResult(null) }}
                  className="w-full py-2 text-sm text-gray-500 hover:text-white transition-all"
                >
                  ← กลับไปแก้ข้อมูลสินค้า
                </button>
              </>
            )}

            {/* Step 3: Audio Ready */}
            {step === 3 && audioUrl && (
              <>
                <div className="bg-[#111] rounded-xl border border-green-500/30 p-5 text-center">
                  <div className="text-5xl mb-3">🎉</div>
                  <div className="font-semibold text-green-400 text-lg mb-1">เสียงพร้อมแล้ว!</div>
                  <div className="text-sm text-gray-400 mb-4">ไฟล์ MP3 พร้อมดาวน์โหลด</div>

                  {/* Audio Player */}
                  <audio
                    src={audioUrl}
                    controls
                    className="w-full mt-2"
                    controlsList="nodownload"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={downloadAudio}
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    ⬇️ ดาวน์โหลด MP3
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-[#2a2a4a] rounded-lg text-sm text-gray-400 hover:border-purple-500/50 transition-all"
                  >
                    🔄 สร้างใหม่
                  </button>
                </div>

                <button
                  onClick={copyScript}
                  className="w-full py-3 border border-[#2a2a4a] rounded-lg text-sm text-gray-400 hover:border-purple-500/50 transition-all"
                >
                  📋 คัดลอกบท + Hashtags
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info */}
        {step === 1 && (
          <div className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 max-w-3xl">
            <div className="text-sm font-medium text-purple-300 mb-1">💡 วิธีใช้</div>
            <ol className="text-xs text-gray-400 space-y-1">
              <li>1. กรอกชื่อสินค้า + เลือกสไตล์คลิป</li>
              <li>2. AI จะเขียนบทพากย์ให้อัตโนมัติ (ใช้ Gemini)</li>
              <li>3. กดสร้างเสียงพากย์ (ใช้ edge-tts ฟรี)</li>
              <li>4. ดาวน์โหลดไฟล์เสียง → เอาไปตัดคลิปต่อ</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
