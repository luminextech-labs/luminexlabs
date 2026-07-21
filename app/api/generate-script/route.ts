import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

const TEMPLATE_PROMPTS: Record<string, string> = {
  short_8: 'คลิปสั้นมือถือแนวตลกหรือน่าสนใจ จบเร็ว ใช้คำน้อย เน้นจุดเด่นสินค้า ไม่เกิน 8 วินาที',
  short_24: 'คลิปสั้น 24 วินาที เน้นความน่าสนใจ มี hook แรง จบที่ call-to-action',
  podcast: 'สนทนา 2 คน พี่น้อง/เพื่อน คุยเรื่องสินค้านี้ธรรมชาติ ไม่เป็นทางการ ให้ข้อมูลจริง',
  story: 'เล่าเรื่องราวผู้ใช้หรือประสบการณ์ส่วนตัว ยาวกว่าปกติ สร้างอารมณ์',
  unboxing: 'แกะกล่อง ลองใช้ โชว์สินค้าจริง ความรู้สึกตอนได้ของ รีวิวตามสไตล์',
  review: 'รีวิวเชิงลึก ข้อดี-ข้อเสีย สรุปแนะนำหรือไม่แนะนำ',
  trend: 'จับเทรนด์ ทำตาม challenge หรือใช้เสียงประกอบที่กำลังฮิต',
  custom: 'สร้างสคริปต์ตามความต้องการ',
}

export async function POST(req: NextRequest) {
  try {
    const { productName, productPrice, productDesc, platform, templateId } = await req.json()

    if (!productName) {
      return NextResponse.json({ error: 'productName is required' }, { status: 400 })
    }

    const templateStyle = TEMPLATE_PROMPTS[templateId || 'short_8'] || TEMPLATE_PROMPTS.short_8
    const platformLabel = platform === 'tiktok' ? 'TikTok' : platform

    const prompt = `คุณเป็นนักเขียนสคริปต์วิดีโอ TikTok มืออาชีพ

สินค้า: ${productName}
ราคา: ${productPrice ? `฿${productPrice}` : 'ไม่ระบุ'}
รายละเอียด: ${productDesc || 'ไม่มีรายละเอียดเพิ่มเติม'}
แพลตฟอร์ม: ${platformLabel}
สไตล์: ${templateStyle}

จงเขียนสคริปต์วิดีโอ TikTok ตามข้อมูลด้านบน

**รูปแบบที่ต้องการ (ตอบเป็น JSON เท่านั้น หัวข้อเป็นภาษาไทย):**
\`\`\`json
{
  "title": "หัวข้อวิดีโอ (สั้น กระชับ และน่าดู)",
  "script": "บทพากย์ทั้งหมดเป็นภาษาไทย พูดธรรมชาติ ไม่ต้องทางการ เหมาะกับคนทั่วไป",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
  "duration": "ระยะเวลาวิดีโอโดยประมาณ เช่น \"8 วินาที\" หรือ \"24 วินาที\""
}
\`\`\`

**ข้อกำหนด:**
- สคริปต์ต้องเป็นภาษาไทยที่พูดได้จริง ไม่ใช่ภาษาเขียน
- ไม่เกิน 60 วินาทีเสมอ
- มี hook ที่น่าสนใจใน 3 วินาทีแรก
- จบที่ call-to-action เช่น "กดไลค์ กดติดตาม" หรือ "ไปดูสินค้าได้ที่ลิงก์"
- ไม่โกหกหรือสร้างข้อมูลเท็จเกี่ยวกับสินค้า
- ใช้คำพูดที่คนไทยพูดจริงๆ ไม่เรียบร้อยเกินไป`

    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.8,
          maxOutputTokens: 1024,
        },
      }),
    })

    if (!geminiRes.ok) {
      const err = await geminiRes.text()
      return NextResponse.json({ error: 'Gemini API failed', details: err }, { status: 500 })
    }

    const geminiData = await geminiRes.json()
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return NextResponse.json({ error: 'No response from Gemini' }, { status: 500 })
    }

    // Parse JSON response
    let scriptData
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        scriptData = JSON.parse(jsonMatch[0])
      } else {
        scriptData = JSON.parse(text)
      }
    } catch {
      return NextResponse.json({ error: 'Failed to parse Gemini response', raw: text }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      script: scriptData,
      productName,
      templateId,
    })
  } catch (err) {
    console.error('generate-script error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
