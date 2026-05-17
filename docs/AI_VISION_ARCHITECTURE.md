# Heal The Future AI Vision Architecture

## Frontend mode
React melakukan validasi file, kompresi gambar, preview, OCR fallback, dan update realtime.

## Backend mode recommended
Set `.env`:

```env
VITE_TRACKER_VISION_ENDPOINT=http://localhost:3000/api/analyze-tracker
GEMINI_API_KEY=your_key
```

Jalankan:

```bash
npm install
npm run dev
cd server
npm install
npm run dev
```

Alur:
1. User upload screenshot
2. Frontend validasi JPG/PNG/WEBP max 2 MB
3. Frontend kirim ke backend Vision API
4. Backend compress dengan Sharp
5. Gemini Vision return JSON
6. Frontend update private/public tracker realtime
7. Jika confidence rendah, UI meminta review manual

## Confidence behavior
- 90-100: auto-fill penuh
- 60-89: auto-fill + warning review
- <60: jangan paksa angka, tampilkan review/manual
