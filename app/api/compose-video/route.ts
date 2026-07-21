'use client'

import { useRef, useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

interface UseVideoComposerReturn {
  loading: boolean
  progress: number
  error: string | null
  composeVideo: (params: ComposeParams) => Promise<Blob | null>
  cancel: () => void
}

interface ComposeParams {
  audioData: Blob
  productName: string
  productImageUrl?: string | null
  outputFormat?: string
}

export function useVideoComposer(): UseVideoComposerReturn {
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  async function getFFmpeg() {
    if (ffmpegRef.current) return ffmpegRef.current

    const ffmpeg = new FFmpeg()

    ffmpeg.on('progress', ({ progress: p }) => {
      setProgress(Math.round(p * 100))
    })

    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message)
    })

    // Load FFmpeg WASM from CDN
    const baseURL = 'https://unjs.github.io/ffmpeg.js'
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    })

    ffmpegRef.current = ffmpeg
    return ffmpeg
  }

  async function composeVideo({
    audioData,
    productName,
    productImageUrl,
  }: ComposeParams): Promise<Blob | null> {
    setLoading(true)
    setProgress(0)
    setError(null)

    try {
      const ffmpeg = await getFFmpeg()

      // Write audio file
      const audioDataArray = new Uint8Array(await audioData.arrayBuffer())
      await ffmpeg.writeFile('audio.mp3', audioDataArray)

      // Write image file
      let imageFile = 'bg.jpg'
      if (productImageUrl) {
        try {
          const imgRes = await fetch(productImageUrl)
          const imgBlob = await imgRes.blob()
          const imgData = new Uint8Array(await imgBlob.arrayBuffer())
          await ffmpeg.writeFile('image.jpg', imgData)
          imageFile = 'image.jpg'
        } catch {
          // fall through to generate background
        }
      }

      // If no image, generate a background with product name
      if (imageFile === 'bg.jpg') {
        // Create a simple gradient/image with ffmpeg
        // For now, create a blank bg
        await ffmpeg.exec([
          '-f', 'lavfi', '-i', `color=c=0x1a1a2e:s=720:1280:d=1`,
          '-y', 'bg.jpg',
        ])
        imageFile = 'bg.jpg'
      }

      // Compose video: loop image + audio → MP4
      await ffmpeg.exec([
        '-loop', '1', '-i', imageFile,
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
      const blob = new Blob([data], { type: 'video/mp4' })

      // Cleanup
      await ffmpeg.deleteFile('audio.mp3')
      await ffmpeg.deleteFile(imageFile)
      await ffmpeg.deleteFile('output.mp4')

      setLoading(false)
      return blob
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Video composition failed'
      setError(msg)
      setLoading(false)
      return null
    }
  }

  function cancel() {
    if (ffmpegRef.current) {
      ffmpegRef.current.terminate()
      ffmpegRef.current = null
    }
    setLoading(false)
    setProgress(0)
  }

  return { loading, progress, error, composeVideo, cancel }
}
