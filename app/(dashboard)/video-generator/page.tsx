'use client'

import { useState, useRef } from 'react'
import { PLATFORM_LABELS, VIDEO_TEMPLATES, VOICES } from '@/lib/types'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

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
  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productDesc, setProductDesc] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('short_8')
  const [selectedVoice, setSelectedVoice] = useState('th_pitcha_f')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [scriptResult, setScriptResult] = useState<ScriptResult | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
  const ffmpegRef = useRef<FFmpeg | null>(null)

  async function loadFFmpeg() {
    if (ffmpegRef.current) return ffmpegRef.current

    const ffmpeg = new FFmpeg()
    ffmpeg.on('progress', ({ progress: p }) => {
      setProgress(Math.round(p * 100))
    })
    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message)
    })

    await ffmpeg.load({
      coreURL: 'https://unjs.github.io/ffmpeg.js/ffmpeg-core.js',
      wasmURL: 'https://unjs.github.io/ffmpeg.js/ffmpeg-core.wasm',
    })

    ffmpegRef.current = ffmpeg
    setFfmpegLoaded(true)
    return ffmpeg
  }

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
          platform: 'tiktok',
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
    } catch {
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
        body: JSON.stringify({ text: scriptResult.script, voice: voiceId }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || 'สร้างเสียงไม่ได้')
        return
      }
      const blob = await fetch(data.audio).then(r => r.blob())
      const url = URL.createObjectURL(blob)
      setAudioBlob(blob)
      setAudioUrl(url)
      setStep(3)
    } catch {
      setError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้')
    } finally {
      setLoading(false)
    }
  }

  async function handleComposeVideo() {
    if (!audioBlob) return
    setLoading(true)
    setProgress(0)
    setError(null)
    setVideoUrl(null)

    try {
      const ffmpeg = await loadFFmpeg()

      // Write audio
      await ffmpeg.writeFile('audio.mp3', await fetchFile(audioBlob))

      // Generate a styled background image (simple gradient)
      // Create a dark gradient bg using canvas in browser
      const canvas = document.createElement('canvas')
      canvas.width = 720
      canvas.height = 1280
      const ctx = canvas.getContext('2d')!
      const gradient = ctx.createLinearGradient(0, 0, 0, 1280)
      gradient.addColorStop(0, '#1a1a2e')
      gradient.addColorStop(0.5, '#16213e')
      gradient.addColorStop(1, '#0f0f23')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 720, 1280)

      // Draw product name
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 36px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(productName || 'สินค้า', 360, 640)

      const bgBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9)
      })
      await ffmpeg.writeFile('bg.jpg', await fetchFile(bgBlob))

      // Compose video
      await ffmpeg.exec([
        '-loop', '1', '-i', 'bg.jpg',
        '-i', 'audio.mp3',
        '-c:v', 'libx264',
        '-tune', 'stillimage',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-pix_fmt', 'yuv420p',
        '-shortest',
        '-movflags', '+faststart',
        '-y', 'output.mp4',
      ])

      const data = await ffmpeg.readFile('output.mp4')
      const vBlob = new Blob([data], { type: 'video/mp4' })
      const vUrl = URL.createObjectURL(vBlob)
      setVideoBlob(vBlob)
      setVideoUrl(vUrl)

      // Cleanup
      await ffmpeg.deleteFile('audio.mp3')
      await ffmpeg.deleteFile('bg.jpg')
      await ffmpeg.deleteFile('output.mp4')

      setStep(4)
    } catch (err) {
      console.error(err)
      setError('ตัดคลิปไม่สำเร็จ ลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  function downloadAudio() {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `tiktok-script-${Date.now()}.mp3`
    a.click()
  }

  function downloadVideo() {
    if (!videoUrl) return
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = `tiktok-video-${Date.now()}.mp4`
    a.click()
  }

  function copyScript() {
    if (!scriptResult) return
    navigator.clipboard.writeText(
      `${scriptResult.title}\n\n${scriptResult.script}\n\n${scriptResult.hashtags.join(' ')}`
    )
  }

  function copyHashtags() {
    if (!scriptResult) return
    navigator.clipboard.writeText(scriptResult.hashtags.join(' '))
  }

  const stepLabels = [
    { n: 1, label: 'สินค้า', icon: '📦' },
    { n: 2, label: 'AI บท', icon: '✍️' },
    { n: 3, label: 'AI เสียง', icon: '🎙️' },
    { n: 4, label: 'ตัดคลิป', icon: '🎬' },
  ]

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <header className="bg-[#1a1a2e] border-b border-[#2a2a4a] px-7 py-4 flex items-center sticky top-0 z-10">
        <h1 className="text-base font-semibold">🎬 Video Generator</h1>
        <span className="ml-3 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
          AI Powered
        </span>
        {ffmpegLoaded && (
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
            FFmpeg ✓
          </span>
        )}
      </header>

      <div className="p-7 max-w-5xl">
        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {stepLabels.map((s, i) => (
            <div key={s.n} className="flex items-center">
              <button
                onClick={() => step > s.n && setStep(s.n)}
                className={`flex items-center gap-2 ${step >= s.n ? 'text-purple-400' : 'text-gray-500'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step > s.n ? 'bg-green-500 text-white' :
                  step === s.n ? 'bg-purple-500 text-white' : 'bg-[#2a2a4a]'
                }`}>
                  {step > s.n ? '✓' : s.icon}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
              </button>
              {i < stepLabels.length - 1 && (
                <div className={`flex-1 w-12 sm:w-16 h-px mx-2 ${step > s.n ? 'bg-green-500' : 'bg-[#2a2a4a]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* Progress bar */}
        {loading && progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>⏳ กำลังประมวลผล...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-[#2a2a4a] rounded-full h-2">
              <div
                className="h-2 rounded-full bg-purple-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview */}
          <div>
            <div className="bg-[#111] rounded-xl border border-[#2a2a4a] aspect-[9/16] max-w-[270px] mx-auto overflow-hidden relative">
              {step >= 4 && videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full object-cover"
                  controlsList="nodownload"
                />
              ) : step === 3 && audioUrl ? (
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                    <span className="text-2xl">🎙️</span>
                  </div>
                  <div className="text-sm text-white font-medium mb-2">เสียงพร้อมแล้ว!</div>
                  <audio src={audioUrl} controls className="w-full mt-2" controlsList="nodownload" />
                  {step === 3 && !videoUrl && (
                    <div className="mt-4 text-xs text-gray-500">กด &quot;ตัดคลิป&quot; เพื่อสร้าง MP4</div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center text-xl mb-3">
                    {stepLabels[step - 1]?.icon || '📦'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {step === 1 ? 'กรอกข้อมูลสินค้า' :
                     step === 2 ? 'รอ AI เขียนบท' :
                     step === 3 ? 'กดสร้างเสียง' : 'รอตัดคลิป'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Step 1: Product */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-2">ชื่อสินค้า *</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    placeholder="เช่น หน้ากากอนามัย N95"
                    className="w-full bg-[#111] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2">ราคา (บาท)</label>
                  <input
                    type="number"
                    value={productPrice}
                    onChange={e => setProductPrice(e.target.value)}
                    placeholder="299"
                    className="w-full bg-[#111] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2">รายละเอียดเพิ่มเติม</label>
                  <textarea
                    value={productDesc}
                    onChange={e => setProductDesc(e.target.value)}
                    placeholder="คุณสมบัติ, จุดเด่น..."
                    rows={3}
                    className="w-full bg-[#111] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500 outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2">สไตล์คลิป</label>
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
                <div>
                  <label className="block text-xs text-gray-500 mb-2">เสียงพากย์</label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
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

            {/* Step 2: Script */}
            {step === 2 && scriptResult && (
              <>
                <div className="bg-[#111] rounded-xl border border-[#2a2a4a] p-4">
                  <div className="text-xs text-gray-500 mb-1">หัวข้อวิดีโอ</div>
                  <div className="font-semibold text-white text-lg mb-3">{scriptResult.title}</div>
                  <div className="text-xs text-gray-500 mb-1">📝 สคริปต์</div>
                  <div className="bg-[#0f0f0f] rounded-lg p-3 text-sm text-gray-300 leading-relaxed max-h-44 overflow-y-auto mb-3">
                    {scriptResult.script}
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-gray-500"># Hashtags</div>
                    <button onClick={copyHashtags} className="text-xs text-purple-400 hover:text-purple-300">📋 copy</button>
                  </div>
                  <div className="text-xs text-gray-400">{scriptResult.hashtags?.join(' ') || '—'}</div>
                  <div className="mt-2 text-xs text-gray-500">⏱️ {scriptResult.duration || '~15 วินาที'}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={copyScript} className="flex-1 py-3 border border-[#2a2a4a] rounded-lg text-sm text-gray-400 hover:border-purple-500/50 transition-all">
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
                <button onClick={() => { setStep(1); setScriptResult(null) }} className="w-full py-2 text-sm text-gray-500 hover:text-white transition-all">
                  ← กลับไปแก้ข้อมูลสินค้า
                </button>
              </>
            )}

            {/* Step 3: Audio ready */}
            {step === 3 && audioUrl && (
              <>
                <div className="bg-[#111] rounded-xl border border-green-500/30 p-5">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🎙️</div>
                    <div className="font-semibold text-green-400">เสียงพร้อมแล้ว!</div>
                  </div>
                  <audio src={audioUrl} controls className="w-full" controlsList="nodownload" />
                  <div className="flex gap-2 mt-4">
                    <button onClick={downloadAudio} className="flex-1 py-2.5 bg-green-500/20 border border-green-500/40 rounded-lg text-sm text-green-400 hover:bg-green-500/30 transition-all">
                      ⬇️ MP3
                    </button>
                    <button onClick={copyHashtags} className="flex-1 py-2.5 border border-[#2a2a4a] rounded-lg text-sm text-gray-400 hover:border-purple-500/50 transition-all">
                      📋 Hashtags
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleComposeVideo}
                  disabled={loading}
                  className="w-full py-3.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  {loading ? '⏳ กำลังตัดคลิป...' : '🎬 ตัดคลิป MP4 (FFmpeg)'}
                </button>

                <button onClick={() => { setStep(1); setAudioUrl(null); setAudioBlob(null) }} className="w-full py-2 text-sm text-gray-500 hover:text-white transition-all">
                  🔄 เริ่มใหม่
                </button>
              </>
            )}

            {/* Step 4: Video ready */}
            {step === 4 && videoUrl && (
              <>
                <div className="bg-[#111] rounded-xl border border-green-500/30 p-5">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🎉</div>
                    <div className="font-semibold text-green-400">คลิปพร้อมแล้ว!</div>
                    <div className="text-xs text-gray-400 mt-1">MP4 • พร้อมอัปโหลด TikTok</div>
                  </div>
                  <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-lg"
                    controlsList="nodownload"
                  />
                  <button
                    onClick={downloadVideo}
                    className="w-full mt-4 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    ⬇️ ดาวน์โหลด MP4
                  </button>
                </div>

                <div className="bg-[#111] rounded-xl border border-[#2a2a4a] p-4">
                  <div className="text-xs text-gray-500 mb-2">📋 ข้อมูลสำหรับโพสต์</div>
                  <div className="text-xs text-gray-400 mb-1">#{scriptResult?.title}</div>
                  <div className="text-xs text-gray-600 break-all">{scriptResult?.hashtags?.join(' ') || ''}</div>
                </div>

                <button
                  onClick={() => { setStep(1); setScriptResult(null); setAudioUrl(null); setAudioBlob(null); setVideoUrl(null); setVideoBlob(null) }}
                  className="w-full py-3 border border-[#2a2a4a] rounded-lg text-sm text-gray-400 hover:border-purple-500/50 transition-all"
                >
                  🔄 สร้างคลิปใหม่
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <div className="text-sm font-medium text-purple-300 mb-1">💡 วิธีใช้ Video Generator</div>
          <ol className="text-xs text-gray-400 space-y-1">
            <li>1. กรอกชื่อสินค้า + เลือกสไตล์คลิป</li>
            <li>2. AI เขียนบทพากย์ให้อัตโนมัติ (Gemini)</li>
            <li>3. กดสร้างเสียงพากย์ (edge-tts ฟรี)</li>
            <li>4. กด &quot;ตัดคลิป MP4&quot; → FFmpeg ประกอบภาพพื้นหลัง + เสียง → ได้ไฟล์ MP4</li>
            <li>5. ดาวน์โหลด MP4 → อัปโหลด TikTok</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
