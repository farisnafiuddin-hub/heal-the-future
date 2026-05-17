import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import sharp from 'sharp'
import { GoogleGenAI } from '@google/genai'

const app = express()
const port = Number(process.env.PORT || 3000)
const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 2)
const allowedTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxUploadMb * 1024 * 1024 },
})

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null

app.use(cors())
app.use(express.json({ limit: '1mb' }))

const normalizePace = (value) => {
  const match = String(value || '').replace(/[lI]/g, '1').match(/(\d{1,2})\s*[:.]\s*(\d{2})/)
  return match ? `${Number(match[1])}:${String(match[2]).padStart(2, '0')}` : null
}

const normalizeTime = (value) => {
  const clean = String(value || '').replace(/[lI]/g, '1')
  const hms = clean.match(/(\d{1,2})\s*[:.]\s*(\d{2})\s*[:.]\s*(\d{2})/)
  if (hms) return `${Number(hms[1])}:${String(hms[2]).padStart(2, '0')}:${String(hms[3]).padStart(2, '0')}`
  const ms = clean.match(/(\d{1,3})\s*[:.]\s*(\d{2})/)
  return ms ? `${Number(ms[1])}:${String(ms[2]).padStart(2, '0')}` : null
}

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null
  const cleaned = String(value).replace(',', '.').replace(/[^0-9.\-]/g, '')
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

const safeJson = (text = '') => {
  const cleaned = String(text).replace(/```json|```/g, '').trim()
  const match = cleaned.match(/\{[\s\S]*\}/)
  const json = match ? match[0] : cleaned
  return JSON.parse(json)
}

const buildFallbackResult = (notes = 'Vision API belum aktif atau gagal membaca gambar.') => ({
  distance_km: null,
  average_pace_min_km: null,
  moving_time: null,
  elevation_gain_m: null,
  max_elevation_m: null,
  calories: null,
  confidence_score: 10,
  analysis_status: 'LOW_CONFIDENCE',
  notes,
  detected_fields: {
    distance: false,
    pace: false,
    moving_time: false,
    elevation_gain: false,
    max_elevation: false,
    calories: false,
  },
  engine: 'server-fallback',
})

const normalizeVisionResult = (raw = {}) => {
  const distance = toNumberOrNull(raw.distance_km ?? raw.distance ?? raw.jarak)
  const pace = normalizePace(raw.average_pace_min_km ?? raw.pace ?? raw.pace_min_km)
  const movingTime = normalizeTime(raw.moving_time ?? raw.movingTime ?? raw.waktu_bergerak)
  const elevationGain = toNumberOrNull(raw.elevation_gain_m ?? raw.elevationGain ?? raw.kenaikan_elevasi)
  const maxElevation = toNumberOrNull(raw.max_elevation_m ?? raw.maxElevation ?? raw.elevasi_maks)
  const calories = toNumberOrNull(raw.calories ?? raw.kalori)

  const detectedFields = {
    distance: distance !== null,
    pace: pace !== null,
    moving_time: movingTime !== null,
    elevation_gain: elevationGain !== null,
    max_elevation: maxElevation !== null,
    calories: calories !== null,
  }

  const importantCount = [detectedFields.distance, detectedFields.pace, detectedFields.moving_time, detectedFields.elevation_gain, detectedFields.max_elevation].filter(Boolean).length
  const computedConfidence = Math.round((importantCount / 5) * 100)
  const modelConfidence = Number(raw.confidence_score ?? raw.confidence ?? 0)
  const confidence = Math.max(computedConfidence, Number.isFinite(modelConfidence) ? modelConfidence : 0)

  return {
    distance_km: distance,
    average_pace_min_km: pace,
    moving_time: movingTime,
    elevation_gain_m: elevationGain,
    max_elevation_m: maxElevation,
    calories,
    confidence_score: Math.min(99, Math.max(10, Math.round(confidence))),
    analysis_status:
      confidence >= 80
        ? 'HIGH_CONFIDENCE'
        : confidence >= 40
        ? 'PARTIAL_CONFIDENCE'
        : 'LOW_CONFIDENCE',
    notes:
      raw.notes ||
      (confidence >= 80
        ? 'AI Vision berhasil memahami mayoritas data tracker dari gambar.'
        : confidence >= 40
        ? 'Sebagian field berhasil dibaca, tetapi beberapa angka perlu dicek ulang.'
        : 'AI belum cukup yakin membaca gambar. Gunakan screenshot yang lebih jelas atau koreksi manual.'),
    detected_fields: detectedFields,
    engine: raw.engine || 'gemini-2.5-flash',
  }
}

const optimizeImageForVision = async (buffer) => {
  const meta = await sharp(buffer).metadata()
  const width = meta.width || 1280
  const height = meta.height || 720

  // Light crop strategy: keep the full screenshot, but remove excessive transparent/black border by trimming if possible.
  // Vision models need context, so do not over-crop too aggressively.
  return sharp(buffer)
    .rotate()
    .resize({ width: Math.min(1280, width), withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .sharpen({ sigma: 1.1 })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer()
}

app.get('/api/health', (_, res) => {
  res.json({
    ok: true,
    service: 'Heal The Future Vision API',
    vision_enabled: Boolean(ai),
    max_upload_mb: maxUploadMb,
  })
})

app.post('/api/analyze-tracker', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(buildFallbackResult('Tidak ada file gambar yang diterima.'))
    }

    const mime = req.file.mimetype || 'image/jpeg'
    if (!allowedTypes.has(mime)) {
      return res.status(400).json(buildFallbackResult('Format tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP.'))
    }

    if (!ai) {
      return res.status(200).json(buildFallbackResult('GEMINI_API_KEY belum diatur. Frontend akan mencoba Browser OCR fallback.'))
    }

    const optimized = await optimizeImageForVision(req.file.buffer)

    const prompt = `
Kamu adalah AI Vision Analyst khusus screenshot olahraga, Strava, running tracker, jogging tracker, dan health dashboard.
Tugasmu membaca gambar seperti manusia, memahami layout, lalu mengekstrak data menjadi JSON valid.

Ambil field berikut jika terlihat:
- distance_km: jarak olahraga dalam kilometer, contoh 5.14
- average_pace_min_km: pace rata-rata dalam format M:SS, contoh "8:19"
- moving_time: waktu bergerak dalam format MM:SS atau H:MM:SS, contoh "42:47"
- elevation_gain_m: kenaikan elevasi meter, contoh 3
- max_elevation_m: elevasi maksimum meter, contoh 18
- calories: kalori jika ada, kalau tidak terlihat isi null

Kembalikan HANYA JSON valid tanpa markdown, tanpa komentar, tanpa teks tambahan.

Schema wajib:
{
  "distance_km": number|null,
  "average_pace_min_km": "M:SS"|null,
  "moving_time": "MM:SS"|"H:MM:SS"|null,
  "elevation_gain_m": number|null,
  "max_elevation_m": number|null,
  "calories": number|null,
  "confidence_score": number,
  "analysis_status": "HIGH_CONFIDENCE"|"PARTIAL_CONFIDENCE"|"LOW_CONFIDENCE",
  "notes": "alasan singkat dan konkret",
  "detected_fields": {
    "distance": boolean,
    "pace": boolean,
    "moving_time": boolean,
    "elevation_gain": boolean,
    "max_elevation": boolean,
    "calories": boolean
  }
}

Aturan confidence:
90-100 jika distance, pace, moving time, elevation gain, max elevation terbaca jelas.
70-89 jika 4 field utama terbaca jelas.
40-69 jika hanya sebagian field utama terbaca.
10-39 jika gambar blur, bukan tracker, atau layout tidak dikenali.
Jangan mengarang angka. Jika tidak terlihat, pakai null.
`

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: [
        { text: prompt },
        { inlineData: { data: optimized.toString('base64'), mimeType: 'image/jpeg' } },
      ],
    })

    const parsed = safeJson(response.text || '')
    const normalized = normalizeVisionResult(parsed)
    res.json(normalized)
  } catch (error) {
    console.error('Analyze tracker error:', error)
    res.status(500).json(buildFallbackResult('Server gagal memproses gambar. Coba screenshot yang lebih jelas atau cek API key.'))
  }
})

app.use((error, req, res, next) => {
  if (error?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json(buildFallbackResult(`Ukuran file terlalu besar. Maksimal ${maxUploadMb} MB.`))
  }
  next(error)
})

app.listen(port, () => {
  console.log(`Heal The Future Vision API running on http://localhost:${port}`)
  console.log(`Vision enabled: ${Boolean(ai)}`)
})
