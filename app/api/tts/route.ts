import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { promisify } from 'util'

const exec = promisify(spawn)

export async function POST(req: NextRequest) {
  try {
    const { text, voice } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const pythonScript = `
import asyncio
import sys
import json
import base64
import os
from edge_tts import Communicate

async def main():
    data = json.loads(sys.stdin.read())
    text = data.get('text', '')
    voice = data.get('voice', 'th-TH-NiwatNeural')
    output_path = '/tmp/tts_edge.mp3'

    tts = Communicate(text=text, voice=voice)
    await tts.save(output_path)

    with open(output_path, 'rb') as f:
        audio_b64 = base64.b64encode(f.read()).decode('utf-8')

    os.remove(output_path)
    print(json.dumps({'success': True, 'audio': audio_b64, 'format': 'mp3'}))

asyncio.run(main())
`

    const result = await exec('python3', ['-c', pythonScript], {
      input: JSON.stringify({ text, voice: voice || 'th-TH-NiwatNeural' }),
      timeout: 30000,
    })

    const stdout = result.stdout.toString()
    const stderr = result.stderr.toString()

    if (stderr && !stdout.includes('success')) {
      console.error('TTS stderr:', stderr)
    }

    let data
    try {
      data = JSON.parse(stdout)
    } catch {
      return NextResponse.json({ error: 'TTS failed', stderr }, { status: 500 })
    }

    if (!data.success) {
      return NextResponse.json({ error: data.error || 'TTS failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      audio: data.audio,
      format: 'mp3',
    })
  } catch (err) {
    console.error('tts error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
