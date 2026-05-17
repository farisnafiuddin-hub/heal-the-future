# Heal The Future - Upgraded Package

Isi upgrade:
- `src/App.jsx` versi realtime + ML-ready.
- `server/` Vision API backend template memakai Gemini + Sharp.
- `.env.example` untuk konfigurasi frontend/backend.
- `datasets/` struktur dataset Strava/OCR.
- `training/` template preprocessing dan ResNet50V2 classifier.
- `docs/AI_VISION_ARCHITECTURE.md` penjelasan arsitektur.

## Jalankan frontend
```bash
npm install
npm run dev
```

## Jalankan backend Vision API
```bash
cd server
npm install
cp ../.env.example .env
# isi GEMINI_API_KEY di .env
npm run dev
```

## Hubungkan frontend ke backend
Buat file `.env` di root:
```env
VITE_TRACKER_VISION_ENDPOINT=http://localhost:3000/api/analyze-tracker
```

Jika endpoint kosong, App.jsx tetap memakai OCR browser fallback.
