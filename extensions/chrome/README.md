# LuminexLabs Chrome Extension

## วิธีติดตั้ง (Developer Mode)

1. เปิด Chrome
2. ไปที่ `chrome://extensions/`
3. เปิด **Developer mode** (มุมขวาบน)
4. กด **Load unpacked**
5. เลือกโฟลเดอร์ `extensions/chrome/public`
6. Extension จะขึ้นใน toolbar ด้านบน

## วิธีใช้งาน

### 1. เชื่อมต่อ TikTok
- คลิกไอคอน Extension บน toolbar
- กดปุ่ม **"เชื่อมต่อ TikTok"**
- ระบบจะดึง cookies และ session จากหน้า TikTok ที่เปิดอยู่
- ข้อมูลจะถูกเก็บไว้ใน local storage ของ Chrome

### 2. ดึงข้อมูลสินค้า
- เปิดหน้า TikTok Shop ที่ต้องการ
- กดปุ่ม **"ดึงข้อมูลจากหน้านี้"**
- ระบบจะดึง: ชื่อสินค้า, ราคา, รูป, commission rate
- ข้อมูลจะถูกบันทึกไปยัง Supabase อัตโนมัติ

### 3. ดูสรุปผล
- Popup แสดงสรุป commission วันนี้
- แสดงสินค้าล่าสุดที่ดึงมา
- กด **"รีเฟรชข้อมูล"** เพื่อดึงใหม่

## ไฟล์ใน Extension

```
extensions/chrome/public/
├── manifest.json      # Extension configuration
├── background.js      # Background service worker
├── content.js        # Content script (runs on TikTok pages)
├── popup.html        # Extension popup UI
├── popup.js          # Popup logic
└── icons/           # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## API Integration

Extension ต่อกับ Supabase โดยตรงผ่าน REST API:

- `POST /rest/v1/products` — บันทึกสินค้า
- `GET /rest/v1/products` — ดึงสินค้า
- `GET /rest/v1/commissions` — ดึง commission

## TODO

- [ ] Auto Post to TikTok (ต้องใช้ TikTok Creator API)
- [ ] Push notifications เมื่อมี commission ใหม่
- [ ] Sync ข้อมูลอัตโนมัติทุก X นาที
- [ ] ดึงข้อมูลจาก Shopee, Lazada ด้วย
