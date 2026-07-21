#!/usr/bin/env python3
"""edge-tts wrapper for Next.js API route"""
import asyncio
import sys
import json
import base64
import os
from edge_tts import Communicate

async def main():
    try:
        data = json.load(sys.stdin)
        text = data.get('text', '')
        voice = data.get('voice', 'th-TH-NiwatNeural')
        output_path = data.get('output', '/tmp/tts_output.mp3')

        if not text:
            print(json.dumps({'error': 'text is required'}))
            sys.exit(1)

        tts = Communicate(text=text, voice=voice)
        await tts.save(output_path)

        with open(output_path, 'rb') as f:
            audio_b64 = base64.b64encode(f.read()).decode('utf-8')

        os.remove(output_path)

        print(json.dumps({
            'success': True,
            'audio': audio_b64,
            'format': 'mp3',
            'size': len(audio_b64)
        }))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    asyncio.run(main())
