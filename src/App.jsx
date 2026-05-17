import { useEffect, useRef, useState } from "react"
import { jsPDF } from "jspdf"

const WEIGHT_KG = 77
const DAILY_WATER_TARGET = 2.5
const DAILY_CAL_TARGET = 2350

const MAX_TRACKER_FILE_SIZE_MB = 2
const MAX_TRACKER_FILE_SIZE = MAX_TRACKER_FILE_SIZE_MB * 1024 * 1024
const TRACKER_IMAGE_MAX_WIDTH = 1280
const TRACKER_IMAGE_QUALITY = 0.86
const ALLOWED_TRACKER_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const TRACKER_UPLOAD_GUIDE = "Format terbaik JPG/JPEG, PNG/WEBP didukung. Maksimal 2 MB, lebar ideal 900–1280 px, gambar lurus, tidak blur, tidak terpotong, dan angka Strava terlihat penuh."

const media = {
  heroVideo: "/video-joging.mp4",
  joggingGroup: "/foto-joging-ber4.jpeg",
  joggingRun: "/joging.jpeg",
  joggingNight: "/joging-sama-bagas.jpeg",
  joggingBench: "/whatsapp-094437.jpeg",
  waterBottle: "/joging-picts.jpeg",
  market: "/sayuran.jpeg",
  chicken: "/dada-ayam.jpeg",
  itbNight: "/whatsapp-095613.jpeg",
  speaker: "/whatsapp-095614.jpeg",
  geprek: "/ayam-geprek-sambal-matah.jpeg",
  kangkung: "/nasi-cah-kangkung-telur.jpeg",
  dvd: "/dvd.png",
}

const pages = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "activity", label: "Activity", icon: "🏃" },
  { id: "nutrition", label: "Nutrition", icon: "🍽️" },
  { id: "gallery", label: "Gallery", icon: "📸" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "tracker", label: "Tracker Pribadi", icon: "🔐" },
  { id: "publicTracker", label: "Public Report", icon: "🧾" },
]

const analysisTabs = ["jadwal", "hidrasi", "jogging", "kalori", "makro"]

const week = [
  { day: "Sen", type: "Kuliah padat", kcal: 1470, water: 2.3, run: 0, focus: 8 },
  { day: "Sel", type: "Kuliah + lab", kcal: 1470, water: 2.4, run: 0, focus: 9 },
  { day: "Rab", type: "Kuliah teknikal", kcal: 1510, water: 2.4, run: 0, focus: 8 },
  { day: "Kam", type: "Kuliah + jogging", kcal: 1470, water: 2.7, run: 2.0, focus: 6 },
  { day: "Jum", type: "Jogging sore", kcal: 1470, water: 2.7, run: 2.4, focus: 5 },
  { day: "Sab", type: "Long run", kcal: 1770, water: 2.9, run: 2.8, focus: 4 },
  { day: "Min", type: "Recovery", kcal: 1500, water: 2.5, run: 2.0, focus: 2 },
]

const playlist = [
  { title: "Raindance", artist: "Dave & Tems", src: "/raindance.mp3", duration: "3:33" },
  { title: "Love Me Not", artist: "Ravyn Lenae", src: "/love-me-not.mp3", duration: "3:09" },
  { title: "Rindu Sendiri (Dilan 1990)", artist: "Iqbaal Ramadhan", src: "/rindu-sendiri.mp3", duration: "4:18" },
  { title: "Pompeii", artist: "Bastille", src: "/pompeii.mp3", duration: "3:34" },
  { title: "Blockkids", artist: "THIZZY52", src: "/blockkids.mp3", duration: "2:45" },
  { title: "33x", artist: "Perunggu", src: "/33x.mp3", duration: "4:21" },
]

const meals = [
  {
    title: "Ayam Geprek Sambal Matah",
    image: media.geprek,
    kcal: "±850 kkal",
    protein: "±35 g protein",
    note: "Menu energi tinggi untuk hari kuliah padat atau setelah jogging. Karbo dari nasi, protein dari ayam, dan rasa pedas sebagai mood booster.",
  },
  {
    title: "Nasi Cah Kangkung Telur",
    image: media.kangkung,
    kcal: "±650 kkal",
    protein: "±22 g protein",
    note: "Menu lebih ringan, murah, berserat, dan cocok untuk makan malam ketika tetap ingin kenyang tanpa terasa terlalu berat.",
  },
  {
    title: "Meal Prep Pasar Lokal",
    image: media.market,
    kcal: "fleksibel",
    protein: "dada ayam 1/2 kg",
    note: "Dada ayam, wortel, pokcoy, pisang, dan bumbu bisa jadi basis masak hemat untuk beberapa porsi dalam seminggu.",
  },
]

const gallery = [
  { src: media.joggingGroup, label: "Community run" },
  { src: media.joggingRun, label: "Track session" },
  { src: media.joggingNight, label: "Night recovery" },
  { src: media.joggingBench, label: "Rest moment" },
  { src: media.waterBottle, label: "Hydration support" },
  { src: media.itbNight, label: "Personal identity" },
  { src: media.speaker, label: "Presentation growth" },
  { src: media.geprek, label: "Meal energy" },
  { src: media.kangkung, label: "Balanced food" },
]

function Logo() {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[#FC4C02] text-xl font-black text-white shadow-xl shadow-orange-500/25">
      <div className="absolute -right-4 -top-4 h-10 w-10 rounded-full border-2 border-white/40" />
      <div className="absolute -bottom-3 -left-3 h-9 w-9 rounded-full border-2 border-white/30" />
      <span className="relative">H</span>
    </div>
  )
}

function Card({ children, className = "" }) {
  return (
    <div className={`min-w-0 overflow-hidden rounded-[32px] border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl sm:p-6 ${className}`}>
      {children}
    </div>
  )
}

function Stat({ value, label, dark = false }) {
  return (
    <Card className={dark ? "bg-[#121417] text-white" : ""}>
      <h3 className="break-words text-2xl font-black leading-tight text-[#FC4C02] sm:text-3xl xl:text-4xl">{value}</h3>
      <p className={`mt-2 font-semibold ${dark ? "text-gray-300" : "text-gray-500"}`}>{label}</p>
    </Card>
  )
}

function TrackerMetricCard({ value, label, unit = "", uncertain = false }) {
  const rawValue = String(value ?? "--").trim()
  const compactValue = rawValue.length > 4

  return (
    <div className={`flex min-h-[128px] min-w-0 flex-col justify-center rounded-[28px] border p-4 text-center shadow-xl sm:min-h-[140px] sm:p-5 ${uncertain ? "border-yellow-500/30 bg-yellow-500/10" : "border-white/10 bg-black/45"}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400 sm:text-xs">
        {label}
      </p>

      <div className="mt-4 flex min-w-0 flex-wrap items-baseline justify-center gap-x-1 gap-y-1 text-[#FC4C02]">
        <span className={`${compactValue ? "text-[clamp(1.45rem,4.6vw,2.55rem)]" : "text-[clamp(1.8rem,5vw,3rem)]"} max-w-full break-words font-black leading-none tracking-tight`}>
          {rawValue}
        </span>
        {unit && (
          <span className="shrink-0 text-[clamp(0.7rem,1.7vw,1rem)] font-black uppercase text-gray-500">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

function RangeControl({ label, value, min, max, step, unit, onChange }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="font-black">{label}</p>
        <p className="font-black text-[#FC4C02]">
          {value}
          {unit}
        </p>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[#FC4C02]"
      />
    </div>
  )
}

function HydrationBottle({ liters }) {
  const percent = Math.min(100, Math.round((liters / DAILY_WATER_TARGET) * 100))

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-[370px] w-[155px]">
        <div className="absolute left-1/2 top-0 z-20 h-10 w-20 -translate-x-1/2 rounded-t-2xl border-[6px] border-[#121417]/20 bg-white shadow-md" />
        <div className="absolute left-1/2 top-8 z-10 h-[335px] w-[145px] -translate-x-1/2 overflow-hidden rounded-[44px] border-[8px] border-[#121417]/20 bg-white shadow-2xl">
          <div className="absolute left-1/2 top-5 z-30 h-5 w-20 -translate-x-1/2 rounded-full bg-[#121417]/10" />
          <div className="absolute inset-x-7 top-16 z-30 h-16 rounded-3xl border border-black/5 bg-white/45 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0077FF] via-[#26C6FF] to-[#B9F6FF] transition-all duration-700 ease-out"
            style={{ height: `${percent}%` }}
          >
            <div className="absolute -top-4 left-[-25%] h-8 w-[150%] animate-pulse rounded-[50%] bg-cyan-100/90" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-black/10" />
          <div className="absolute inset-0 z-40 flex items-center justify-center text-3xl xl:text-4xl font-black text-[#121417] mix-blend-multiply">
            {percent}%
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-3xl font-black">{liters.toFixed(1)} L dari 2.5 L</p>
      <p className="text-lg font-bold text-gray-500">
        {liters >= DAILY_WATER_TARGET ? "Target aman" : `Sisa ${(DAILY_WATER_TARGET - liters).toFixed(1)} L lagi`}
      </p>
    </div>
  )
}

function Bar({ value, max = 100, label, color = "bg-[#FC4C02]" }) {
  const pct = Math.min(100, Math.round((value / max) * 100))

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm font-bold">
        <span>{label}</span>
        <span className="text-[#FC4C02]">{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function PageTitle({ eyebrow, title, desc }) {
  return (
    <div className="mb-10">
      <p className="mb-4 text-sm font-black uppercase tracking-[0.28em] text-[#FC4C02]">{eyebrow}</p>
      <h2 className="text-4xl md:text-5xl font-black tracking-tight">{title}</h2>
      {desc && <p className="mt-5 max-w-3xl text-lg leading-relaxed text-gray-600">{desc}</p>}
    </div>
  )
}

function CalorieRing({ value }) {
  const pct = Math.min(100, Math.round((value / DAILY_CAL_TARGET) * 100))

  return (
    <div className="relative flex h-72 w-72 items-center justify-center rounded-full bg-[#102544]">
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `conic-gradient(#06b6d4 0 ${pct}%, rgba(255,255,255,0.12) ${pct}% 100%)` }}
      />
      <div className="absolute inset-8 rounded-full bg-[#102544]" />
      <div className="relative text-center">
        <h4 className="text-3xl xl:text-4xl font-black text-cyan-300">{value.toLocaleString("id-ID")}</h4>
        <p className="text-blue-200">kkal</p>
      </div>
    </div>
  )
}

function MacroDonut({ dailyScore, hydrationScore = 0, activityScore = 0, calorieScore = 0 }) {
  const safeScore = Math.max(0, Math.min(100, Number(dailyScore) || 0))
  const h = Math.max(0, Math.min(100, Number(hydrationScore) || 0))
  const a = Math.max(0, Math.min(100, Number(activityScore) || 0))
  const c = Math.max(0, Math.min(100, Number(calorieScore) || 0))

  return (
    <div className="mx-auto w-full max-w-[360px]">
      <div
        className="relative mx-auto h-56 w-56 rounded-full shadow-2xl sm:h-64 sm:w-64 md:h-72 md:w-72"
        style={{
          background: `conic-gradient(#06b6d4 0 ${h * 0.5}%, #22c55e ${h * 0.5}% ${h * 0.5 + a * 0.25}%, #fb923c ${h * 0.5 + a * 0.25}% ${h * 0.5 + a * 0.25 + c * 0.25}%, rgba(255,255,255,0.14) ${h * 0.5 + a * 0.25 + c * 0.25}% 100%)`,
        }}
      >
        <div className="absolute inset-10 flex items-center justify-center rounded-full bg-[#102544] text-center sm:inset-12 md:inset-14">
          <div>
            <h4 className="text-3xl font-black text-cyan-300 sm:text-4xl">{safeScore}%</h4>
            <p className="text-sm font-bold text-blue-200">Live Readiness</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-black uppercase tracking-[0.18em] text-blue-200">
        <div className="rounded-2xl bg-white/10 px-2 py-3">Hyd {h}%</div>
        <div className="rounded-2xl bg-white/10 px-2 py-3">Act {a}%</div>
        <div className="rounded-2xl bg-white/10 px-2 py-3">Cal {c}%</div>
      </div>
    </div>
  )
}

export default function App() {
  const audioRef = useRef(null)

  const [page, setPage] = useState("home")
  const [analysisTab, setAnalysisTab] = useState("hidrasi")
  const [water, setWater] = useState(1.2)
  const [speed, setSpeed] = useState(7)
  const [distance, setDistance] = useState(2.8)
  const [portion, setPortion] = useState(1.5)
  const [snack, setSnack] = useState(300)
  const [papayaJuice, setPapayaJuice] = useState(true)

  const [stravaDistance, setStravaDistance] = useState(2.39)
  const [stravaPaceMin, setStravaPaceMin] = useState(8)
  const [stravaPaceSec, setStravaPaceSec] = useState(17)
  const [stravaMovingTime, setStravaMovingTime] = useState("19:49")
  const [stravaElevationGain, setStravaElevationGain] = useState(0)
  const [stravaMaxElevation, setStravaMaxElevation] = useState(766)

  // Public tracker has its own isolated Strava/OCR state.
  // This prevents uploads from Public Tracker from overwriting Private Tracker, and vice versa.
  const [publicStravaDistance, setPublicStravaDistance] = useState(0)
  const [publicStravaPaceMin, setPublicStravaPaceMin] = useState(0)
  const [publicStravaPaceSec, setPublicStravaPaceSec] = useState(0)
  const [publicStravaMovingTime, setPublicStravaMovingTime] = useState("--")
  const [publicStravaElevationGain, setPublicStravaElevationGain] = useState(0)
  const [publicStravaMaxElevation, setPublicStravaMaxElevation] = useState(0)

  const PRIVATE_TRACKER_PIN = "220406"
  const [privateTrackerPin, setPrivateTrackerPin] = useState("")
  const [isPrivateTrackerUnlocked, setIsPrivateTrackerUnlocked] = useState(false)
  const [privateEmail, setPrivateEmail] = useState("farisnafiuddin@gmail.com")

  const [selectedDay, setSelectedDay] = useState("Senin")
  const [privateTrackerTab, setPrivateTrackerTab] = useState("daily")
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem("healFutureReports")
    return saved ? JSON.parse(saved) : []
})

  const [uploadedTrackerImage, setUploadedTrackerImage] = useState(null)
  const [uploadedTrackerPreview, setUploadedTrackerPreview] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [ocrStatus, setOcrStatus] = useState("idle")
  const [ocrText, setOcrText] = useState("")
  const [detectedTrackerData, setDetectedTrackerData] = useState(null)

  const [publicUploadedTrackerImage, setPublicUploadedTrackerImage] = useState(null)
  const [publicUploadedTrackerPreview, setPublicUploadedTrackerPreview] = useState("")
  const [publicOcrStatus, setPublicOcrStatus] = useState("idle")
  const [publicOcrText, setPublicOcrText] = useState("")
  const [publicDetectedTrackerData, setPublicDetectedTrackerData] = useState(null)

  const [publicForm, setPublicForm] = useState({
    fullName: "",
    birthDate: "",
    email: "",
    accessPassword: "",
    gender: "male",
    height: 170,
    weight: 70,
    water: 1.5,
    distance: 2,
    speed: 7,
    mealCalories: 2000,
    snackCalories: 250,
  })

  const [publicReports, setPublicReports] = useState(() => {
    const saved = localStorage.getItem("healFuturePublicReports")
    return saved ? JSON.parse(saved) : []
  })
  const [publicLookupEmail, setPublicLookupEmail] = useState("")
  const [publicLookupPassword, setPublicLookupPassword] = useState("")

  const [currentSong, setCurrentSong] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)

  const duration = Math.round((distance / speed) * 60)
  const burned = Math.round(distance * WEIGHT_KG * 1.03)
  const loops = Math.round(distance / 0.4)

  const stravaPaceDecimal = stravaPaceMin + stravaPaceSec / 60
  const stravaEstimatedSpeed = Number((60 / stravaPaceDecimal).toFixed(2))
  const stravaEstimatedCalories = Math.round(stravaDistance * WEIGHT_KG * 1.03)
  const publicStravaEstimatedCalories = Math.round((publicStravaDistance || publicForm.distance || 0) * WEIGHT_KG * 1.03)
  const stravaLoops = Math.round(stravaDistance / 0.4)

  const generateStravaAnalysis = () => {
    const paceText = `${stravaPaceMin}:${String(stravaPaceSec).padStart(2, "0")} /km`

    if (stravaDistance >= 2.3 && stravaPaceDecimal <= 8.5) {
      return `Aktivitas jogging ini cukup solid. Dengan jarak ${stravaDistance.toFixed(2)} km dan pace rata-rata ${paceText}, tubuh menunjukkan kapasitas kardio yang stabil. Waktu bergerak ${stravaMovingTime} menandakan sesi ini efektif untuk menjaga endurance tanpa beban berlebihan.`
    }

    if (stravaPaceDecimal > 9) {
      return `Pace jogging masih berada di zona ringan. Ini cocok untuk recovery run atau membangun kebiasaan lari, tetapi jika ingin meningkatkan performa kardio, kamu bisa menaikkan intensitas secara bertahap sambil menjaga jarak ${stravaDistance.toFixed(2)} km tetap konsisten.`
    }

    if (stravaDistance < 2) {
      return `Jarak jogging masih pendek, tetapi tetap berguna untuk membangun konsistensi. Fokus utama berikutnya adalah menjaga ritme, mempertahankan pace ${paceText}, lalu menambah jarak sedikit demi sedikit.`
    }

    return `Jogging ini berada dalam kategori stabil. Kombinasi jarak ${stravaDistance.toFixed(2)} km, pace ${paceText}, waktu bergerak ${stravaMovingTime}, kenaikan elevasi ${stravaElevationGain} m, dan elevasi maks ${stravaMaxElevation} m menunjukkan aktivitas yang cukup baik untuk menjaga kebugaran harian.`
  }

  const foodCalories = Math.round(portion * 1400)
  const papayaCalories = papayaJuice ? 86 : 0
  const grossCalories = foodCalories + snack + papayaCalories
  const netCalories = Math.max(0, grossCalories - burned)
  const caloriePercent = Math.min(100, Math.round((grossCalories / DAILY_CAL_TARGET) * 100))

  const hydrationScore = Math.min(100, Math.round((water / DAILY_WATER_TARGET) * 100))
  const activityScore = Math.min(100, Math.round((distance / 2.8) * 100))
  const calorieScore = grossCalories >= 2200 && grossCalories <= 2500 ? 100 : grossCalories < 2200 ? 70 : 75
  const dailyScore = Math.round((hydrationScore + activityScore + calorieScore) / 3)

  const carbGram = Math.round((grossCalories * 0.5) / 4)
  const proteinGram = Math.round((grossCalories * 0.25) / 4)
  const fatGram = Math.round((grossCalories * 0.25) / 9)
  const weeklyRun = week.reduce((sum, item) => sum + item.run, 0).toFixed(1)

  const currentTrack = playlist[currentSong]

  const unlockPrivateTracker = () => {
    if (privateTrackerPin === PRIVATE_TRACKER_PIN) {
      setIsPrivateTrackerUnlocked(true)
      setPrivateTrackerPin("")
    } else {
      alert("Password Tracker Pribadi belum sesuai.")
    }
  }

  const updatePublicForm = (field, value) => {
    setPublicForm((prev) => ({ ...prev, [field]: value }))
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthGap = today.getMonth() - birth.getMonth()
    if (monthGap < 0 || (monthGap === 0 && today.getDate() < birth.getDate())) age -= 1
    return Math.max(0, age)
  }

  const publicAge = calculateAge(publicForm.birthDate)
  const publicHeightMeter = Number(publicForm.height) / 100
  const publicBMI = publicHeightMeter > 0 ? Number((Number(publicForm.weight) / (publicHeightMeter * publicHeightMeter)).toFixed(1)) : 0
  const isPublicAdult = publicAge >= 20
  const publicBMIStatus =
    !publicForm.birthDate
      ? "Lengkapi data"
      : !isPublicAdult
      ? "Usia <20: butuh BMI-for-age percentile"
      : publicBMI < 18.5
      ? "Underweight"
      : publicBMI < 25
      ? "Healthy Weight"
      : publicBMI < 30
      ? "Overweight"
      : publicBMI < 35
      ? "Obesity Class 1"
      : publicBMI < 40
      ? "Obesity Class 2"
      : "Obesity Class 3"

  const publicWaterTarget = Number(Math.max(1.8, Number(publicForm.weight) * 0.033).toFixed(1))
  const publicHydrationScore = Math.min(100, Math.round((Number(publicForm.water) / publicWaterTarget) * 100))
  const publicActivityScore = Math.min(100, Math.round((Number(publicForm.distance) / 3) * 100))
  const publicBurned = Math.round(Number(publicForm.distance) * Number(publicForm.weight) * 1.03)
  const publicDuration = Math.round((Number(publicForm.distance) / Number(publicForm.speed)) * 60)
  const publicGrossCalories = Number(publicForm.mealCalories) + Number(publicForm.snackCalories)
  const publicNetCalories = Math.max(0, publicGrossCalories - publicBurned)
  const publicBMR = Math.round(
    10 * Number(publicForm.weight) + 6.25 * Number(publicForm.height) - 5 * publicAge + (publicForm.gender === "male" ? 5 : -161),
  )
  const publicMaintenanceCalories = Math.max(0, Math.round(publicBMR * 1.45))
  const publicCalorieScore =
    publicMaintenanceCalories === 0
      ? 70
      : Math.abs(publicGrossCalories - publicMaintenanceCalories) <= 250
      ? 100
      : Math.abs(publicGrossCalories - publicMaintenanceCalories) <= 500
      ? 80
      : 65
  const publicBMIScore = !isPublicAdult ? 70 : publicBMI >= 18.5 && publicBMI < 25 ? 100 : publicBMI >= 25 && publicBMI < 30 ? 75 : 65
  const publicScore = Math.round((publicHydrationScore + publicActivityScore + publicCalorieScore + publicBMIScore) / 4)
  const publicCarbGram = Math.round((publicGrossCalories * 0.5) / 4)
  const publicProteinGram = Math.round((publicGrossCalories * 0.25) / 4)
  const publicFatGram = Math.round((publicGrossCalories * 0.25) / 9)

  const generatePublicAnalysis = () => {
    if (!publicForm.fullName || !publicForm.birthDate || !publicForm.email || !publicForm.accessPassword) {
      return "Lengkapi nama, tanggal lahir, email, dan password laporan agar sistem bisa membuat laporan personal yang lengkap."
    }

    if (!isPublicAdult) {
      return `${publicForm.fullName} berusia ${publicAge} tahun. Untuk usia di bawah 20 tahun, BMI sebaiknya dinilai dengan BMI-for-age percentile, bukan kategori BMI dewasa. Sistem tetap menampilkan estimasi aktivitas, hidrasi, kalori, dan makro, tetapi interpretasi BMI perlu dianggap sebagai screening awal.`
    }

    if (publicScore >= 88) {
      return `${publicForm.fullName} memiliki kondisi harian yang sangat solid. BMI berada pada kategori ${publicBMIStatus}, hidrasi mencapai ${publicHydrationScore}%, aktivitas jogging ${publicForm.distance} km, dan estimasi kalori berada cukup dekat dengan kebutuhan harian. Pola ini menunjukkan kesiapan tubuh yang baik untuk aktivitas akademik, olahraga ringan, dan recovery harian.`
    }

    if (publicHydrationScore < 75) {
      return `${publicForm.fullName} perlu memprioritaskan hidrasi. Kebutuhan air estimasi berada di sekitar ${publicWaterTarget} L per hari, sedangkan input saat ini baru ${publicForm.water} L. Kekurangan cairan dapat memengaruhi fokus, performa jogging, recovery, dan rasa lelah pada sore hari.`
    }

    if (publicActivityScore < 60) {
      return `${publicForm.fullName} menunjukkan aktivitas kardio yang masih rendah untuk hari ini. Jogging ${publicForm.distance} km sudah baik sebagai awal, tetapi peningkatan bertahap menuju 2.5–3 km dapat membantu stamina, pembakaran kalori, dan kualitas tidur.`
    }

    if (publicCalorieScore < 80) {
      return `${publicForm.fullName} memiliki selisih kalori yang cukup jauh dari estimasi maintenance ${publicMaintenanceCalories} kkal. Jika terlalu rendah, tubuh bisa terasa lemas; jika terlalu tinggi, komposisi tubuh bisa kurang efisien. Fokus utama adalah menjaga porsi makan, snack, dan protein agar lebih stabil.`
    }

    return `${publicForm.fullName} berada pada kondisi yang cukup stabil. BMI ${publicBMI} (${publicBMIStatus}), hidrasi ${publicHydrationScore}%, jogging ${publicForm.distance} km, dan daily score ${publicScore}%. Masih ada ruang peningkatan pada konsistensi hidrasi, aktivitas fisik, dan penyesuaian kalori terhadap kebutuhan tubuh.`
  }

  const savePublicReports = (updatedReports) => {
    setPublicReports(updatedReports)
    localStorage.setItem("healFuturePublicReports", JSON.stringify(updatedReports))
  }

  const visiblePublicReports = publicReports.filter(
    (report) =>
      publicLookupEmail &&
      publicLookupPassword &&
      report.email.toLowerCase() === publicLookupEmail.toLowerCase() &&
      report.accessPassword === publicLookupPassword,
  )

  const buildPublicReport = () => {
    const now = new Date()
    return {
      id: Date.now(),
      fullName: publicForm.fullName,
      birthDate: publicForm.birthDate,
      age: publicAge,
      email: publicForm.email,
      accessPassword: publicForm.accessPassword,
      gender: publicForm.gender,
      date: now.toLocaleDateString("id-ID"),
      time: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      timestamp: now.toISOString(),
      height: Number(publicForm.height),
      weight: Number(publicForm.weight),
      bmi: publicBMI,
      bmiStatus: publicBMIStatus,
      water: Number(publicForm.water),
      waterTarget: publicWaterTarget,
      hydrationScore: publicHydrationScore,
      distance: Number(publicForm.distance),
      speed: Number(publicForm.speed),
      duration: publicDuration,
      burned: publicBurned,
      grossCalories: publicGrossCalories,
      netCalories: publicNetCalories,
      maintenanceCalories: publicMaintenanceCalories,
      carbGram: publicCarbGram,
      proteinGram: publicProteinGram,
      fatGram: publicFatGram,
      score: publicScore,
      analysis: generatePublicAnalysis(),
      hasUploadedImage: Boolean(uploadedTrackerPreview),
      uploadedImageName: uploadedTrackerImage?.name || "",
      visualAnalysis: generateVisualTrackerAnalysis(),
      stravaDistance: Number(stravaDistance.toFixed(2)),
      stravaPace: `${stravaPaceMin}:${String(stravaPaceSec).padStart(2, "0")} /km`,
      stravaMovingTime,
      stravaElevationGain,
      stravaMaxElevation,
      stravaEstimatedSpeed,
      stravaEstimatedCalories,
      detectedTrackerData,
    }
  }

  const savePublicReport = () => {
    if (!publicForm.fullName || !publicForm.birthDate || !publicForm.email || !publicForm.accessPassword) {
      alert("Lengkapi Nama Lengkap, Tanggal Lahir, Email, dan Password Laporan terlebih dahulu.")
      return null
    }
    const report = buildPublicReport()
    savePublicReports([report, ...publicReports])
    return report
  }

  const deletePublicReport = (id) => {
    savePublicReports(publicReports.filter((report) => report.id !== id))
  }

  const buildPrivateReport = () => {
    const now = new Date()
    return {
      id: Date.now(),
      email: privateEmail,
      day: selectedDay,
      date: now.toLocaleDateString("id-ID"),
      time: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      water: Number(water.toFixed(1)),
      distance: Number(distance.toFixed(1)),
      speed,
      duration,
      burned,
      stravaDistance: Number(stravaDistance.toFixed(2)),
      stravaPace: `${stravaPaceMin}:${String(stravaPaceSec).padStart(2, "0")} /km`,
      stravaMovingTime,
      stravaElevationGain,
      stravaMaxElevation,
      stravaEstimatedSpeed,
      stravaEstimatedCalories,
      stravaLoops,
      stravaAnalysis: generateStravaAnalysis(),
      grossCalories,
      netCalories,
      dailyScore,
      carbGram,
      proteinGram,
      fatGram,
      status: getHealthStatus(dailyScore, water, distance, grossCalories),
      analysis: generateDailyAnalysis(),
      reportType: "daily",
      detectedTrackerData,
    }
  }

  const createPrivateReportPDF = (report = null, options = { save: true }) => {
  const data = report || buildPrivateReport()
  const doc = new jsPDF()

  const orange = [252, 76, 2]
  const dark = [18, 20, 23]
  const muted = [95, 105, 120]
  const light = [245, 245, 245]

  const addHeader = () => {
    doc.setFillColor(...dark)
    doc.rect(0, 0, 210, 34, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.text("Heal The Future", 14, 15)

    doc.setTextColor(...orange)
    doc.text("Private Health Report", 14, 25)

    doc.setTextColor(230, 230, 230)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(`Generated: ${data.date} • ${data.time}`, 145, 15)
  }

  const pill = (x, y, w, h, title, value, note = "") => {
    doc.setFillColor(...light)
    doc.roundedRect(x, y, w, h, 4, 4, "F")

    doc.setTextColor(...orange)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(15)
    doc.text(String(value), x + 5, y + 10)

    doc.setTextColor(...muted)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(title, x + 5, y + 17)

    if (note) doc.text(note, x + 5, y + 23)
  }

  const sectionTitle = (title, y) => {
    doc.setTextColor(...orange)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.text(title, 14, y)
  }

  const paragraph = (text, x, y, width = 182) => {
    doc.setTextColor(...dark)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9.5)

    const lines = doc.splitTextToSize(text || "-", width)
    doc.text(lines, x, y)

    return y + lines.length * 5
  }

  addHeader()

  doc.setTextColor(...dark)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text(`Daily Tracker - ${data.day}`, 14, 46)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...muted)
  doc.text(`Email: ${data.email || "-"} • Report Type: ${data.reportType || "daily"}`, 14, 53)

  pill(14, 66, 42, 28, "Daily Score", `${data.dailyScore}%`, data.status)
  pill(61, 66, 42, 28, "Hydration", `${data.water} L`, `Target ${DAILY_WATER_TARGET} L`)
  pill(108, 66, 42, 28, "Jogging", `${data.distance} km`, `${data.duration} min`)
  pill(155, 66, 42, 28, "Calories", `${data.grossCalories}`, `Net ${data.netCalories}`)

  sectionTitle("Realtime Intelligence", 112)

  let y = 120
  y = paragraph(data.realtimeInsight || data.analysis, 14, y)

  sectionTitle("Running / Strava Analysis", y + 8)
  y += 16

  y = paragraph(
    `Jarak ${data.stravaDistance ?? data.distance} km, pace ${
      data.stravaPace || "-"
    }, moving time ${data.stravaMovingTime || "-"}, elevation gain ${
      data.stravaElevationGain || 0
    } m, max elevation ${data.stravaMaxElevation || 0} m, estimated speed ${
      data.stravaEstimatedSpeed || data.speed
    } km/jam, calories burned ${data.stravaEstimatedCalories || data.burned} kkal.`,
    14,
    y,
  )

  y = paragraph(data.stravaAnalysis || "Analisis jogging belum tersedia.", 14, y + 3)

  if (y > 230) {
    doc.addPage()
    addHeader()
    y = 46
  }

  sectionTitle("Nutrition & Macro Estimate", y + 8)
  y += 16

  pill(14, y, 55, 25, "Carbohydrate", `${data.carbGram}g`)
  pill(77, y, 55, 25, "Protein", `${data.proteinGram}g`)
  pill(140, y, 55, 25, "Fat", `${data.fatGram}g`)

  y += 40

  sectionTitle("Visual Tracker Analysis", y)
  y += 8

  y = paragraph(data.visualAnalysis || "Belum ada foto tracker yang diupload.", 14, y)

  sectionTitle("Medical Note", y + 8)

  paragraph(
    "Laporan ini bersifat estimasi untuk edukasi dan monitoring kebiasaan harian. Ini bukan pengganti diagnosis, konsultasi dokter, ahli gizi, atau tenaga kesehatan profesional.",
    14,
    y + 16,
  )

  const fileName = `private-health-report-${data.day || "daily"}-${data.date.replaceAll("/", "-")}.pdf`

  if (options?.save === false) {
    return {
      fileName,
      url: URL.createObjectURL(doc.output("blob")),
    }
  }

  doc.save(fileName)
  return { fileName }
}

  const downloadPrivatePDF = () => {
    const report = reports[0] || saveDailyReport()
    if (report) createPrivateReportPDF(report)
  }

  const openPrivateEmailDraft = () => {
    const report = reports[0] || saveDailyReport()
    if (!report) return

    const targetEmail = privateEmail || "farisnafiuddin@gmail.com"
    const subject = encodeURIComponent(`Tracker Pribadi Report - ${report.day} ${report.date}`)
    const body = encodeURIComponent(
      `Halo,

Berikut ringkasan Private Tracker dari Heal The Future.

Hari: ${report.day}
Tanggal: ${report.date}
Jam: ${report.time}
Hidrasi: ${report.water} L
Jogging: ${report.distance} km
Pace Strava: ${report.stravaPace || "-"}
Moving Time: ${report.stravaMovingTime || "-"}
Kalori: ${report.grossCalories} kkal
Score: ${report.dailyScore}%
Status: ${report.status}

AI Analysis:
${report.analysis || generateDailyAnalysis()}

Laporan ini bersifat estimasi dan bukan diagnosis medis.`
    )

    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`
  }

  const createPublicReportPDF = (report = null) => {
  const data = report || buildPublicReport()
  const doc = new jsPDF()

  const orange = [252, 76, 2]
  const dark = [18, 20, 23]
  const muted = [95, 105, 120]
  const light = [245, 245, 245]

  const addHeader = () => {
    doc.setFillColor(...dark)
    doc.rect(0, 0, 210, 34, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.text("Heal The Future", 14, 15)

    doc.setTextColor(...orange)
    doc.text("Public Health Report", 14, 25)

    doc.setTextColor(230, 230, 230)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(`Generated: ${data.date} • ${data.time}`, 145, 15)
  }

  const pill = (x, y, w, h, title, value, note = "") => {
    doc.setFillColor(...light)
    doc.roundedRect(x, y, w, h, 4, 4, "F")
    doc.setTextColor(...orange)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(15)
    doc.text(String(value), x + 5, y + 10)

    doc.setTextColor(...muted)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.text(title, x + 5, y + 17)

    if (note) doc.text(note, x + 5, y + 23)
  }

  const sectionTitle = (title, y) => {
    doc.setTextColor(...orange)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.text(title, 14, y)
  }

  const paragraph = (text, x, y, width = 182) => {
    doc.setTextColor(...dark)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9.5)
    const lines = doc.splitTextToSize(text || "-", width)
    doc.text(lines, x, y)
    return y + lines.length * 5
  }

  addHeader()

  doc.setTextColor(...dark)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text(data.fullName || "User", 14, 46)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...muted)
  doc.text(`${data.email || "-"} • ${data.gender === "male" ? "Male" : "Female"} • ${data.age} tahun`, 14, 53)
  doc.text(`Tinggi ${data.height} cm • Berat ${data.weight} kg`, 14, 59)

  pill(14, 68, 42, 28, "Health Score", `${data.score}%`)
  pill(61, 68, 42, 28, "BMI", data.bmi, data.bmiStatus)
  pill(108, 68, 42, 28, "Hydration", `${data.water} L`, `Target ${data.waterTarget} L`)
  pill(155, 68, 42, 28, "Jogging", `${data.distance} km`, `${data.duration} min`)

  sectionTitle("Public Health Analysis", 112)

  let y = 120
  y = paragraph(data.analysis, 14, y)

  sectionTitle("Nutrition & Energy", y + 8)
  y += 16

  y = paragraph(
    `Kalori masuk ${data.grossCalories} kkal, net calories ${data.netCalories} kkal, maintenance estimate ${data.maintenanceCalories} kkal. Makro: karbo ${data.carbGram}g, protein ${data.proteinGram}g, lemak ${data.fatGram}g.`,
    14,
    y,
  )

  if (y > 220) {
    doc.addPage()
    addHeader()
    y = 46
  }

  sectionTitle("Visual Tracker Analysis", y + 8)
  y += 16

  y = paragraph(data.visualAnalysis || "Belum ada foto tracker yang diupload.", 14, y)

  sectionTitle("Medical Note", y + 8)

  paragraph(
    "Laporan ini bersifat estimasi untuk edukasi dan monitoring kebiasaan harian. Ini bukan pengganti diagnosis, konsultasi dokter, ahli gizi, atau tenaga kesehatan profesional.",
    14,
    y + 16,
  )

  doc.save(`public-health-report-${data.fullName || "user"}.pdf`)
}

  const downloadPublicPDF = () => {
  const report = publicReports[0] || savePublicReport()
  if (report) createPublicReportPDF(report)
}

  const getHealthStatus = (score, hydration, run, calories) => {
    if (score >= 90 && hydration >= 2.3 && run >= 2.5 && calories >= 2200 && calories <= 2500) return "Optimal Performance"
    if (hydration < 2) return "Hydration Needs Attention"
    if (run < 1.5) return "Low Activity"
    if (calories > 2600) return "High Calorie Intake"
    if (calories < 2000) return "Low Energy Intake"
    return "Stable Condition"
  }

  const saveReports = (updatedReports) => {
    setReports(updatedReports)
    localStorage.setItem("healFutureReports", JSON.stringify(updatedReports))
  }

  const saveDailyReport = () => {
    const now = new Date()
    const newReport = {
      id: Date.now(),
      day: selectedDay,
      date: now.toLocaleDateString("id-ID"),
      time: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      timestamp: now.toISOString(),
      water: Number(water.toFixed(1)),
      distance: Number(distance.toFixed(1)),
      speed,
      duration,
      burned,
      stravaDistance: Number(stravaDistance.toFixed(2)),
      stravaPace: `${stravaPaceMin}:${String(stravaPaceSec).padStart(2, "0")} /km`,
      stravaMovingTime,
      stravaElevationGain,
      stravaMaxElevation,
      stravaEstimatedSpeed,
      stravaEstimatedCalories,
      stravaLoops,
      stravaAnalysis: generateStravaAnalysis(),
      grossCalories,
      netCalories,
      dailyScore,
      carbGram,
      proteinGram,
      fatGram,
      status: getHealthStatus(dailyScore, water, distance, grossCalories),
      realtimeHealthStatus,
      realtimeRecoveryStatus,
      realtimeInsight,
      hasUploadedImage: Boolean(uploadedTrackerPreview),
      uploadedImageName: uploadedTrackerImage?.name || "",
      reportType: "daily",
      detectedTrackerData,
      visualAnalysis: uploadedTrackerPreview
      ? "Foto tracker berhasil diupload. Sistem membaca gambar ini sebagai referensi visual untuk mendukung analisis jogging, pace, durasi, dan aktivitas harian."
      : "Belum ada foto tracker yang diupload.",
    }

    saveReports([newReport, ...reports])
    return newReport
  }

  const deleteReport = (id) => {
    saveReports(reports.filter((report) => report.id !== id))
  }

  const clearReports = () => {
    if (window.confirm("Hapus semua report yang tersimpan?")) saveReports([])
  }

  const dailyReportsOnly = reports.filter((report) => report.reportType === "daily" || !report.reportType)

  const weeklyReports = dailyReportsOnly.slice(0, 7)

  const monthlyReports = dailyReportsOnly.slice(0, 30)
  const yearlyReports = dailyReportsOnly.slice(0, 365)
  const weeklyDateRange =
    weeklyReports.length > 0
      ? `${weeklyReports[weeklyReports.length - 1].date} - ${weeklyReports[0].date}`
      : "Belum ada rentang tanggal"
const realtimeHealthStatus =
  dailyScore >= 90
    ? "Excellent"
    : dailyScore >= 75
    ? "Strong"
    : dailyScore >= 60
    ? "Balanced"
    : "Needs Attention"

const realtimeRecoveryStatus =
  water >= DAILY_WATER_TARGET && grossCalories >= 2200 && grossCalories <= 2600
    ? "Recovery Stable"
    : water < DAILY_WATER_TARGET
    ? "Hydration Priority"
    : "Energy Balance Check"

const realtimeInsight = `Realtime analysis: kondisi saat ini berada pada level ${realtimeHealthStatus}. Hidrasi ${water.toFixed(
  1,
)} L, jogging ${distance.toFixed(1)} km, kalori ${grossCalories} kkal, dan daily score ${dailyScore}%. Status recovery: ${realtimeRecoveryStatus}.`


const liveWeeklyStatus = dailyScore >= 85 ? "Strong" : dailyScore >= 70 ? "Balanced" : "Improve"
const liveActivityTrend = distance >= 4 ? "High" : distance >= 2.5 ? "Active" : "Light"
const liveHydrationTrend = water >= DAILY_WATER_TARGET ? "Optimal" : water >= 1.8 ? "Good" : "Low"
const liveRecoveryTrend = hydrationScore >= 80 && calorieScore >= 80 ? "Stable" : hydrationScore < 70 ? "Hydrate" : "Check"

const generateLiveSessionAnalysis = () => {
  return `Realtime session insight: score saat ini ${dailyScore}%, hidrasi ${water.toFixed(1)} L (${hydrationScore}%), jogging ${distance.toFixed(1)} km (${activityScore}%), dan kalori ${grossCalories} kkal (${calorieScore}%). Sistem membaca data langsung dari slider/input dan hasil OCR, bukan menunggu laporan mingguan disimpan. Fokus utama saat ini: ${hydrationScore < 75 ? "naikkan hidrasi" : activityScore < 75 ? "naikkan aktivitas secara bertahap" : calorieScore < 80 ? "stabilkan asupan energi" : "pertahankan pola hari ini"}.`
}
  const weeklySummary = {
    
  totalRun: weeklyReports.reduce((sum, item) => sum + (item.distance || 0), 0),

  avgWater: weeklyReports.length
    ? weeklyReports.reduce((sum, item) => sum + (item.water || 0), 0) / weeklyReports.length
    : 0,

  avgCalories: weeklyReports.length
    ? Math.round(weeklyReports.reduce((sum, item) => sum + (item.grossCalories || 0), 0) / weeklyReports.length)
    : 0,

  avgScore: weeklyReports.length
    ? Math.round(weeklyReports.reduce((sum, item) => sum + (item.dailyScore || 0), 0) / weeklyReports.length)
    : 0,

  totalBurned: weeklyReports.reduce((sum, item) => sum + (item.burned || 0), 0),

  totalCalories: weeklyReports.reduce((sum, item) => sum + (item.grossCalories || 0), 0),

  totalHydration: weeklyReports.reduce((sum, item) => sum + (item.water || 0), 0),

  totalSessions: weeklyReports.length,
}

const monthlySummary = {
  totalRun: monthlyReports.reduce((sum, item) => sum + (item.distance || 0), 0),

  avgWater: monthlyReports.length
    ? monthlyReports.reduce((sum, item) => sum + (item.water || 0), 0) / monthlyReports.length
    : 0,

  avgCalories: monthlyReports.length
    ? Math.round(monthlyReports.reduce((sum, item) => sum + (item.grossCalories || 0), 0) / monthlyReports.length)
    : 0,

  avgScore: monthlyReports.length
    ? Math.round(monthlyReports.reduce((sum, item) => sum + (item.dailyScore || 0), 0) / monthlyReports.length)
    : 0,

  totalBurned: monthlyReports.reduce((sum, item) => sum + (item.burned || 0), 0),

  totalCalories: monthlyReports.reduce((sum, item) => sum + (item.grossCalories || 0), 0),

  totalHydration: monthlyReports.reduce((sum, item) => sum + (item.water || 0), 0),

  totalSessions: monthlyReports.length,
}

const yearlySummary = {
  totalRun: yearlyReports.reduce((sum, item) => sum + (item.distance || 0), 0),

  avgWater: yearlyReports.length
    ? yearlyReports.reduce((sum, item) => sum + (item.water || 0), 0) / yearlyReports.length
    : 0,

  avgCalories: yearlyReports.length
    ? Math.round(yearlyReports.reduce((sum, item) => sum + (item.grossCalories || 0), 0) / yearlyReports.length)
    : 0,

  avgScore: yearlyReports.length
    ? Math.round(yearlyReports.reduce((sum, item) => sum + (item.dailyScore || 0), 0) / yearlyReports.length)
    : 0,

  totalBurned: yearlyReports.reduce((sum, item) => sum + (item.burned || 0), 0),

  totalCalories: yearlyReports.reduce((sum, item) => sum + (item.grossCalories || 0), 0),

  totalHydration: yearlyReports.reduce((sum, item) => sum + (item.water || 0), 0),

  totalSessions: yearlyReports.length,
}

  const normalizeTrackerText = (text = "") =>
    text
      .toLowerCase()
      .replace(/[|]/g, "1")
      .replace(/[lI]/g, "1")
      .replace(/,/g, ".")
      .replace(/rata\s*2/g, "rata rata")
      .replace(/rata-?rata/g, "rata rata")
      .replace(/k\s*m/g, "km")
      .replace(/\/\s*k\s*m/g, "/km")
      .replace(/([0-9])\s+([.:])\s+([0-9])/g, "$1$2$3")
      .replace(/([0-9])\s+([0-9]{2})\s*km/g, "$1.$2 km")
      .replace(/[^a-z0-9:.\/\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim()

  const numberFrom = (value, fallback = null) => {
    if (value === null || value === undefined || value === "") return fallback
    const parsed = Number(String(value).replace(",", "."))
    return Number.isFinite(parsed) ? parsed : fallback
  }

  const safePaceText = (min, sec) => {
    const m = Number.isFinite(Number(min)) ? Number(min) : 0
    const s = Number.isFinite(Number(sec)) ? Number(sec) : 0
    return `${m}:${String(s).padStart(2, "0")}`
  }

  const getTrackerUnderstandingStatus = (confidence = 0) => {
    if (confidence >= 85) return "HIGH_CONFIDENCE"
    if (confidence >= 55) return "PARTIAL_CONFIDENCE"
    if (confidence >= 30) return "LOW_CONFIDENCE"
    return "FAILED"
  }

  const getTrackerUnderstandingLabel = (status) => {
    if (status === "HIGH_CONFIDENCE") return "AI memahami gambar dengan sangat baik"
    if (status === "PARTIAL_CONFIDENCE") return "AI membaca sebagian data, perlu cek ulang"
    if (status === "LOW_CONFIDENCE") return "AI kurang yakin, koreksi manual disarankan"
    return "AI belum memahami gambar dengan aman"
  }

  const cropLikelyTrackerPanel = (imageDataUrl, mode = "panel") =>
    new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const w = img.width
        const h = img.height
        const crop =
          mode === "top"
            ? { x: Math.round(w * 0.04), y: Math.round(h * 0.02), w: Math.round(w * 0.92), h: Math.round(h * 0.62) }
            : { x: Math.round(w * 0.03), y: Math.round(h * 0.04), w: Math.round(w * 0.94), h: Math.round(h * 0.72) }

        const targetWidth = 1200
        const scale = Math.min(2.2, Math.max(1, targetWidth / crop.w))
        canvas.width = Math.round(crop.w * scale)
        canvas.height = Math.round(crop.h * scale)

        const ctx = canvas.getContext("2d")
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.92))
      }
      img.onerror = () => resolve(imageDataUrl)
      img.src = imageDataUrl
    })

  const preprocessTrackerImageForOCR = (imageDataUrl, mode = "normal") =>
    new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const scale = Math.min(2.4, Math.max(1.2, 1400 / img.width))
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)

        const ctx = canvas.getContext("2d")
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
          const contrast = mode === "hard" ? 1.8 : 1.35
          const boosted = Math.max(0, Math.min(255, (gray - 128) * contrast + 128))
          const bw = mode === "hard" ? (boosted > 155 ? 255 : 0) : boosted > 215 ? 255 : boosted > 110 ? 45 : 0
          data[i] = bw
          data[i + 1] = bw
          data[i + 2] = bw
        }

        ctx.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL("image/png"))
      }
      img.onerror = () => resolve(imageDataUrl)
      img.src = imageDataUrl
    })

  const findFirstTimeAfter = (text, labels = []) => {
    const matches = []
    labels.forEach((label) => {
      const index = text.indexOf(label)
      if (index >= 0) {
        const slice = text.slice(index, index + 130)
        const match = slice.match(/(\d{1,2})[:.](\d{2})/)
        if (match) matches.push(match)
      }
    })
    return matches[0] || null
  }

  const findDistanceFromText = (text) => {
    const labeled = text.match(/(?:jarak|distance)[^0-9]{0,80}(\d{1,3}(?:\.\d{1,2})?)\s*km/)
    if (labeled) return labeled
    const all = [...text.matchAll(/(\d{1,3}(?:\.\d{1,2})?)\s*km/g)]
    return all.find((m) => Number(m[1]) >= 0.2 && Number(m[1]) <= 80) || null
  }

  const parseTrackerText = (rawText = "", fileName = "", words = []) => {
    const normalized = normalizeTrackerText(`${rawText} ${fileName}`)
    const corrected = normalized
      .replace(/(\d{1,2})(\d{2})\s*km/g, (_, a, b) => `${a}.${b} km`)
      .replace(/(\d)\s*\.\s*(\d{2})\s*km/g, "$1.$2 km")
      .replace(/(\d{1,2})\s*[:.]\s*(\d{2})/g, "$1:$2")

    const kmMatches = [...corrected.matchAll(/(\d{1,3}(?:\.\d{1,2})?)\s*km/g)]
    const timeMatches = [...corrected.matchAll(/(\d{1,2})[:.](\d{2})/g)]
    const meterMatches = [...corrected.matchAll(/(\d{1,4})\s*m/g)]

    const distanceMatch = findDistanceFromText(corrected) || kmMatches[0]
    const paceMatch =
      corrected.match(/(?:pace|rata rata)[^0-9]{0,90}(\d{1,2})[:.](\d{2})\s*(?:\/\s*km|per\s*km|km)?/) ||
      corrected.match(/(\d{1,2})[:.](\d{2})\s*\/\s*km/) ||
      timeMatches.find((m) => Number(m[1]) >= 3 && Number(m[1]) <= 20)

    const movingMatch =
      findFirstTimeAfter(corrected, ["waktu bergerak", "moving time", "bergerak"]) ||
      timeMatches.find((m) => `${Number(m[1])}:${m[2]}` !== `${Number(paceMatch?.[1])}:${paceMatch?.[2]}` && Number(m[1]) >= 10)

    const elevationGainMatch =
      corrected.match(/(?:kenaikan elevasi|elevation gain|gain)[^0-9]{0,80}(\d{1,4})\s*m/) ||
      meterMatches[0]

    const maxElevationMatch =
      corrected.match(/(?:elevasi maks|max elevation|elevasi maksimum|max)[^0-9]{0,90}(\d{1,4})\s*m/) ||
      (meterMatches.length > 1 ? meterMatches[meterMatches.length - 1] : null)

    const distanceDetected = Boolean(distanceMatch)
    const paceDetected = Boolean(paceMatch)
    const movingDetected = Boolean(movingMatch)
    const gainDetected = Boolean(elevationGainMatch)
    const maxDetected = Boolean(maxElevationMatch)

    const detectedDistance = distanceDetected ? numberFrom(distanceMatch?.[1], stravaDistance) : stravaDistance
    const detectedPaceMin = paceDetected ? numberFrom(paceMatch?.[1], stravaPaceMin) : stravaPaceMin
    const detectedPaceSec = paceDetected ? numberFrom(paceMatch?.[2], stravaPaceSec) : stravaPaceSec
    const detectedMovingTime = movingDetected ? `${Number(movingMatch[1])}:${String(movingMatch[2]).padStart(2, "0")}` : stravaMovingTime
    const detectedElevationGain = gainDetected ? numberFrom(elevationGainMatch?.[1], stravaElevationGain) : stravaElevationGain
    const detectedMaxElevation = maxDetected ? numberFrom(maxElevationMatch?.[1], stravaMaxElevation) : stravaMaxElevation
    const detectedSpeed = detectedPaceMin > 0 ? Number((60 / (detectedPaceMin + detectedPaceSec / 60)).toFixed(2)) : speed
    const detectedCalories = Math.round(Math.max(0.1, detectedDistance) * WEIGHT_KG * 1.03)

    const fields = [distanceDetected, paceDetected, movingDetected, gainDetected, maxDetected]
    const fieldsFound = fields.filter(Boolean).length
    const textQuality = rawText.length > 80 ? 12 : rawText.length > 30 ? 7 : rawText.length > 8 ? 3 : 0
    const confidence = Math.max(10, Math.min(99, fieldsFound * 17 + textQuality))
    const analysisStatus = getTrackerUnderstandingStatus(confidence)

    return {
      distance: detectedDistance,
      paceMin: detectedPaceMin,
      paceSec: detectedPaceSec,
      movingTime: detectedMovingTime,
      elevationGain: detectedElevationGain,
      maxElevation: detectedMaxElevation,
      speed: detectedSpeed,
      calories: detectedCalories,
      confidence,
      analysisStatus,
      source: rawText ? "Hybrid Browser OCR + Smart Strava Parser" : "Fallback / Manual Context",
      notes:
        analysisStatus === "HIGH_CONFIDENCE"
          ? "AI memahami mayoritas field utama pada screenshot tracker."
          : analysisStatus === "PARTIAL_CONFIDENCE"
          ? "Sebagian data berhasil dibaca, tetapi beberapa field perlu dicek ulang secara manual."
          : "OCR belum cukup yakin. Data lama dipertahankan agar sistem tidak mengisi angka salah seperti 0.00.",
      fields: {
        distance: distanceDetected,
        pace: paceDetected,
        movingTime: movingDetected,
        elevationGain: gainDetected,
        maxElevation: maxDetected,
      },
      rawText,
      normalizedText: corrected,
      words,
    }
  }

  const readTrackerImageText = async (imageDataUrl) => {
    try {
      setOcrText("Menyiapkan area utama tracker agar OCR tidak membaca seluruh halaman...")
      const croppedPanel = await cropLikelyTrackerPanel(imageDataUrl, "panel")
      const enhancedImage = await preprocessTrackerImageForOCR(croppedPanel, "normal")
      const workerModule = await import(/* @vite-ignore */ "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js")

      const runOCR = async (source, psm = "6") => {
        const result = await workerModule.recognize(source, "eng+ind", {
          logger: () => {},
          tessedit_pageseg_mode: psm,
          preserve_interword_spaces: "1",
          tessedit_char_whitelist: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:.,/ kmKMJarakPaceRataWaktuBergerakKenaikanElevasiMaksDistanceMovingTimeElevationGainMax",
        })
        return {
          text: result?.data?.text || "",
          words: result?.data?.words || [],
        }
      }

      setOcrText("AI OCR membaca angka utama: jarak, pace, waktu, elevasi...")
      const first = await runOCR(enhancedImage, "6")
      const quickResult = buildSmartTrackerDetection(first, uploadedTrackerImage?.name || "")

      if (quickResult.confidence >= 70) {
        return first
      }

      setOcrText("Confidence belum tinggi, menjalankan second-pass scan pada gambar asli...")
      const second = await runOCR(croppedPanel, "11")
      return {
        text: `${first.text}\n${second.text}`.trim(),
        words: [...(first.words || []), ...(second.words || [])],
      }
    } catch (error) {
      console.warn("OCR engine fallback:", error)
      return { text: "", words: [] }
    }
  }

  const buildSmartTrackerDetection = (ocrResult = { text: "", words: [] }, fileName = "") => {
    const text = typeof ocrResult === "string" ? ocrResult : ocrResult.text
    const words = typeof ocrResult === "string" ? [] : ocrResult.words
    return parseTrackerText(text, fileName, words)
  }

  const applySmartTrackerDetection = (detected, scope = "private") => {
    const safeDetected = {
      ...detected,
      confidence: Number(detected?.confidence || 0),
      fields: detected?.fields || {},
    }

    if (scope === "public") {
      setPublicDetectedTrackerData(safeDetected)
    } else {
      setDetectedTrackerData(safeDetected)
    }

    const detectedFieldCount = Object.values(safeDetected.fields || {}).filter(Boolean).length
    const enoughForAutoFill =
      safeDetected.confidence >= 45 ||
      detectedFieldCount >= 3 ||
      safeDetected.analysisStatus === "HIGH_CONFIDENCE" ||
      safeDetected.source?.includes("AI Vision Backend")

    if (!enoughForAutoFill) {
      scope === "public" ? setPublicOcrStatus("failed") : setOcrStatus("failed")
      return
    }

    const trustedVision = safeDetected.source?.includes("AI Vision Backend")

    if (scope === "public") {
      if (safeDetected.fields.distance || trustedVision) {
        setPublicStravaDistance(safeDetected.distance)
        setPublicForm((prev) => ({ ...prev, distance: Number(safeDetected.distance.toFixed(2)) }))
      }

      if (safeDetected.fields.pace || trustedVision) {
        setPublicStravaPaceMin(safeDetected.paceMin)
        setPublicStravaPaceSec(safeDetected.paceSec)
        setPublicForm((prev) => ({ ...prev, speed: safeDetected.speed }))
      }

      if (safeDetected.fields.movingTime || trustedVision) setPublicStravaMovingTime(safeDetected.movingTime)
      if (safeDetected.fields.elevationGain || trustedVision) setPublicStravaElevationGain(safeDetected.elevationGain)
      if (safeDetected.fields.maxElevation || trustedVision) setPublicStravaMaxElevation(safeDetected.maxElevation)
      return
    }

    if (safeDetected.fields.distance || trustedVision) {
      setStravaDistance(safeDetected.distance)
      setDistance(Number(safeDetected.distance.toFixed(1)))
    }

    if (safeDetected.fields.pace || trustedVision) {
      setStravaPaceMin(safeDetected.paceMin)
      setStravaPaceSec(safeDetected.paceSec)
      setSpeed(safeDetected.speed)
    }

    if (safeDetected.fields.movingTime || trustedVision) setStravaMovingTime(safeDetected.movingTime)
    if (safeDetected.fields.elevationGain || trustedVision) setStravaElevationGain(safeDetected.elevationGain)
    if (safeDetected.fields.maxElevation || trustedVision) setStravaMaxElevation(safeDetected.maxElevation)
  }

  const trackerFieldIsTrusted = (field, tracker = detectedTrackerData) => {
    if (!tracker) return true
    if (tracker.analysisStatus === "HIGH_CONFIDENCE") return true
    if (tracker.analysisStatus === "FAILED") return false
    // Field-level trust is more important than global confidence.
    // Example: OCR may detect moving time perfectly while distance is unclear.
    return Boolean(tracker.fields?.[field]) && Number(tracker.confidence || 0) >= 25
  }

  const getTrackerDisplayValue = (field, value, fallback = "--", tracker = detectedTrackerData) => {
    return trackerFieldIsTrusted(field, tracker) ? value : fallback
  }

  const validateTrackerFile = (file) => {
    if (!file) return false

    if (!ALLOWED_TRACKER_TYPES.includes(file.type)) {
      alert("Format file tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP agar AI detector bisa membaca data tracker dengan stabil.")
      return false
    }

    if (file.size > MAX_TRACKER_FILE_SIZE) {
      alert(`Ukuran file terlalu besar. Maksimal ${MAX_TRACKER_FILE_SIZE_MB} MB agar OCR cepat, konkret, dan realtime.`)
      return false
    }

    return true
  }

  const compressTrackerImageToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const scale = Math.min(1, TRACKER_IMAGE_MAX_WIDTH / img.width)
          const canvas = document.createElement("canvas")
          canvas.width = Math.max(1, Math.round(img.width * scale))
          canvas.height = Math.max(1, Math.round(img.height * scale))

          const ctx = canvas.getContext("2d")
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          const outputType = file.type === "image/png" ? "image/png" : "image/jpeg"
          resolve(canvas.toDataURL(outputType, TRACKER_IMAGE_QUALITY))
        }
        img.onerror = () => reject(new Error("Gagal membaca gambar tracker."))
        img.src = reader.result
      }
      reader.onerror = () => reject(new Error("Gagal membuka file gambar."))
      reader.readAsDataURL(file)
    })

  const analyzeTrackerWithVisionBackend = async (file) => {
    const endpoint = import.meta.env?.VITE_TRACKER_VISION_ENDPOINT || "http://localhost:3000/api/analyze-tracker"

    const formData = new FormData()
    formData.append("image", file)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12000)

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) throw new Error("Vision backend gagal membaca gambar.")
    const data = await response.json()

    const serverFields = data.detected_fields || {}
    const serverFieldCount = Object.values(serverFields).filter(Boolean).length
    const serverConfidence = Number(data.confidence_score ?? data.confidence ?? 0)

    // If backend is alive but AI key/OCR result is not valid, do not lock UI in FAILED.
    // Return null so frontend browser OCR fallback can still try reading the screenshot.
    if (serverConfidence < 30 && serverFieldCount === 0) {
      return null
    }

    const pace = String(data.average_pace_min_km || data.pace || "0:00").match(/(\d{1,2})[:.](\d{2})/)
    const detected = {
      distance: Number(data.distance_km ?? data.distance ?? stravaDistance),
      paceMin: Number(pace?.[1] ?? stravaPaceMin),
      paceSec: Number(pace?.[2] ?? stravaPaceSec),
      movingTime: data.moving_time || data.movingTime || stravaMovingTime,
      elevationGain: Number(data.elevation_gain_m ?? data.elevationGain ?? stravaElevationGain),
      maxElevation: Number(data.max_elevation_m ?? data.maxElevation ?? stravaMaxElevation),
      speed: 0,
      calories: Number(data.calories ?? 0),
      confidence: Number(data.confidence_score ?? data.confidence ?? 95),
      analysisStatus: data.analysis_status || getTrackerUnderstandingStatus(Number(data.confidence_score ?? 95)),
      source: "AI Vision Backend JSON Extractor",
      notes: data.notes || "Data dibaca oleh backend Vision API.",
      fields: {
        distance: data.distance_km !== null && data.distance_km !== undefined,
        pace: Boolean(data.average_pace_min_km || data.pace),
        movingTime: Boolean(data.moving_time || data.movingTime),
        elevationGain: data.elevation_gain_m !== null && data.elevation_gain_m !== undefined,
        maxElevation: data.max_elevation_m !== null && data.max_elevation_m !== undefined,
        calories: data.calories !== null && data.calories !== undefined,
      },
      rawText: JSON.stringify(data, null, 2),
      words: [],
    }

    detected.speed = detected.paceMin > 0 ? Number((60 / (detected.paceMin + detected.paceSec / 60)).toFixed(2)) : speed
    detected.calories = detected.calories || Math.round(detected.distance * WEIGHT_KG * 1.03)
    return detected
  }

  const handleTrackerImageUpload = async (file, scope = "private") => {
    if (!file) return
    if (!validateTrackerFile(file)) return

    const setImage = scope === "public" ? setPublicUploadedTrackerImage : setUploadedTrackerImage
    const setPreview = scope === "public" ? setPublicUploadedTrackerPreview : setUploadedTrackerPreview
    const setDetected = scope === "public" ? setPublicDetectedTrackerData : setDetectedTrackerData
    const setStatus = scope === "public" ? setPublicOcrStatus : setOcrStatus
    const setText = scope === "public" ? setPublicOcrText : setOcrText

    setImage(file)
    setDetected({
      confidence: 0,
      analysisStatus: "PROCESSING",
      notes: "Gambar diterima. Sistem sedang mengoptimasi ukuran dan menyiapkan analisis.",
      source: "Processing",
      fields: {},
    })
    setStatus("processing")
    setText("Mengoptimasi gambar tracker di browser...")

    try {
      const imageDataUrl = await compressTrackerImageToDataUrl(file)
      setPreview(imageDataUrl)

      let detected = null

      try {
        setText("Mencoba AI Vision Backend JSON Extractor...")
        detected = await analyzeTrackerWithVisionBackend(file)
      } catch (backendError) {
        console.warn("Vision backend unavailable:", backendError)
      }

      if (!detected) {
        setText("Backend Vision belum aktif. Menjalankan Hybrid Browser OCR + Smart Parser...")
        const ocrResult = await readTrackerImageText(imageDataUrl)
        setText(ocrResult.text || "OCR tidak menemukan teks yang cukup jelas.")
        detected = buildSmartTrackerDetection(ocrResult, file.name || "")
      }

      applySmartTrackerDetection(detected, scope)
      setStatus((detected.confidence >= 30 || Object.values(detected.fields || {}).filter(Boolean).length >= 2) ? "completed" : "failed")
    } catch (error) {
      console.warn(error)
      setDetected({
        confidence: 0,
        analysisStatus: "FAILED",
        notes: "Gambar gagal diproses. Gunakan JPG/JPEG/PNG/WEBP maksimal 2 MB dengan angka Strava yang jelas.",
        source: "System Error",
        fields: {},
      })
      alert("Gambar gagal diproses. Gunakan JPG/JPEG/PNG/WEBP maksimal 2 MB dengan angka Strava yang jelas.")
      setStatus("failed")
    }
  }

  const handleTrackerDrop = (event) => {
    event.preventDefault()
    setDragActive(false)

    const file = event.dataTransfer.files?.[0]

    if (file) {
      handleTrackerImageUpload(file, "private")
    }
  }

const handleTrackerDragOver = (event) => {
  event.preventDefault()
  setDragActive(true)
}

const handleTrackerDragLeave = () => {
  setDragActive(false)
}

const generateVisualTrackerAnalysis = () => {
  if (!uploadedTrackerPreview) {
    return "Belum ada foto tracker yang diupload. Upload screenshot Strava atau tracker jogging agar sistem bisa membuat analisis visual."
  }

  const confidence = detectedTrackerData?.confidence || 0
  const status = detectedTrackerData?.analysisStatus || getTrackerUnderstandingStatus(confidence)
  const statusText = getTrackerUnderstandingLabel(status)

  return `Foto tracker berhasil dianalisis sebagai referensi visual. Sistem membaca jarak sekitar ${stravaDistance.toFixed(
    2,
  )} km, pace ${stravaPaceMin}:${String(stravaPaceSec).padStart(
    2,
    "0",
  )} /km, waktu bergerak ${stravaMovingTime}, kenaikan elevasi ${stravaElevationGain} m, dan elevasi maksimum ${stravaMaxElevation} m. Tingkat pemahaman AI saat ini ${confidence}% (${statusText}). Sumber analisis: ${detectedTrackerData?.source || "Hybrid OCR"}. ${detectedTrackerData?.notes || "Jika confidence rendah, sistem tidak akan memaksa autofill angka yang meragukan. Field akan ditandai Review agar data tetap aman dan tidak misleading."}`
}

const autoDetectStravaData = async (scope = "private") => {
  const currentPreview = scope === "public" ? publicUploadedTrackerPreview : uploadedTrackerPreview
  const currentImage = scope === "public" ? publicUploadedTrackerImage : uploadedTrackerImage
  const setStatus = scope === "public" ? setPublicOcrStatus : setOcrStatus
  const setDetected = scope === "public" ? setPublicDetectedTrackerData : setDetectedTrackerData
  const setText = scope === "public" ? setPublicOcrText : setOcrText

  if (!currentPreview) {
    alert("Upload foto tracker dulu.")
    return
  }

  setStatus("processing")
  setDetected((prev) => ({
    ...(prev || {}),
    confidence: prev?.confidence || 0,
    analysisStatus: "PROCESSING",
    notes: "Menjalankan ulang AI detector pada gambar yang sudah diupload.",
  }))

  try {
    let detected = null

    if (uploadedTrackerImage) {
      try {
        setText("Mencoba AI Vision Backend JSON Extractor...")
        detected = await analyzeTrackerWithVisionBackend(uploadedTrackerImage)
      } catch (backendError) {
        console.warn("Vision backend unavailable:", backendError)
      }
    }

    if (!detected) {
      const ocrResult = await readTrackerImageText(currentPreview)
      setText(ocrResult.text || "OCR tidak menemukan teks yang cukup jelas.")
      detected = buildSmartTrackerDetection(ocrResult, currentImage?.name || "")
    }

    applySmartTrackerDetection(detected, scope)
    setStatus((detected.confidence >= 30 || Object.values(detected.fields || {}).filter(Boolean).length >= 2) ? "completed" : "failed")
  } catch (error) {
    console.warn(error)
    setStatus("failed")
  }
}

const generateRecoveryPrediction = () => {
  if (
    hydrationScore >= 90 &&
    activityScore >= 80 &&
    calorieScore >= 80
  ) {
    return "Recovery tubuh diprediksi sangat baik dalam 24 jam ke depan. Kondisi hidrasi, aktivitas, dan energi terlihat stabil."
  }

  if (hydrationScore < 70) {
    return "Recovery tubuh diprediksi melambat karena hidrasi masih cukup rendah. Prioritaskan cairan dan tidur."
  }

  if (grossCalories < 2000) {
    return "Recovery tubuh diprediksi kurang optimal akibat energi harian yang masih rendah."
  }

  if (distance >= 5 && proteinGram < 100) {
    return "Aktivitas cukup tinggi tetapi protein masih rendah. Recovery otot mungkin kurang maksimal."
  }

  return "Recovery tubuh diprediksi cukup stabil dengan beberapa area kecil yang masih bisa ditingkatkan."
}

const generateHealthRiskDetection = () => {
  const risks = []

  if (hydrationScore < 70) {
    risks.push("Dehydration Risk: hidrasi cukup rendah dan bisa memengaruhi fokus, stamina, serta recovery.")
  }

  if (distance >= 4 && grossCalories < 2200) {
    risks.push("Low Fuel Risk: aktivitas jogging cukup tinggi tetapi asupan kalori masih rendah.")
  }

  if (weeklySummary.totalRun > 18 && weeklySummary.avgScore < 75) {
    risks.push("Overload Risk: total jogging mingguan cukup tinggi tetapi weekly score belum optimal.")
  }

  if (weeklySummary.avgWater < 2) {
    risks.push("Weekly Hydration Risk: rata-rata hidrasi mingguan masih kurang dari standar target harian.")
  }

  if (risks.length === 0) {
    risks.push("Tidak ada risiko besar yang terdeteksi. Kondisi saat ini relatif stabil.")
  }

  return risks
}
  const generateSmartRecommendations = () => {
  const recommendations = []

  if (hydrationScore < 85) {
    recommendations.push("Naikkan hidrasi secara bertahap sampai mendekati 2.5 L per hari. Prioritaskan minum setelah bangun, setelah makan, dan setelah jogging.")
  }

  if (activityScore < 80) {
    recommendations.push("Tambah aktivitas jogging bertahap menuju 2.5–3 km per sesi agar endurance dan pembakaran kalori lebih stabil.")
  }

  if (calorieScore < 80) {
    recommendations.push("Perbaiki keseimbangan kalori harian. Jika terlalu rendah tubuh bisa mudah lelah, jika terlalu tinggi komposisi tubuh bisa kurang efisien.")
  }

  if (proteinGram < 100) {
    recommendations.push("Pertimbangkan menaikkan asupan protein dari telur, ayam, tempe, tahu, ikan, atau susu agar recovery otot lebih baik.")
  }

  if (recommendations.length === 0) {
    recommendations.push("Pertahankan pola saat ini. Fokus berikutnya adalah konsistensi hidrasi, protein, tidur, dan recovery.")
  }

  return recommendations
}

const generateFatiguePrediction = () => {
  if (weeklySummary.totalRun > 18 && weeklySummary.avgScore < 75) return "Fatigue risk tinggi: volume jogging mingguan cukup besar sementara skor recovery belum optimal."
  if (hydrationScore < 70) return "Fatigue risk sedang: hidrasi rendah dapat mempercepat rasa lelah dan menurunkan fokus."
  if (grossCalories < 2000 && distance >= 3) return "Fatigue risk sedang: energi masuk relatif rendah dibanding aktivitas hari ini."
  return "Fatigue risk rendah: beban aktivitas, hidrasi, dan energi masih terlihat stabil."
}

const generateHydrationPrediction = () => {
  const gap = Math.max(0, DAILY_WATER_TARGET - water).toFixed(1)
  if (water >= DAILY_WATER_TARGET) return "Prediksi hidrasi baik: kebutuhan cairan harian sudah terpenuhi."
  if (water < 1.5) return `Prediksi hidrasi rendah: tambahkan sekitar ${gap} L secara bertahap hari ini.`
  return `Prediksi hidrasi cukup, tetapi masih kurang sekitar ${gap} L dari target ideal.`
}

const generateReadinessScore = () => {
  return Math.round((dailyScore + Math.min(100, weeklySummary.avgScore || dailyScore) + hydrationScore) / 3)
}

const generateDailyAnalysis = () => {
    const hydrationStatus =
      water >= DAILY_WATER_TARGET
        ? "hidrasi sudah memenuhi target harian"
        : `hidrasi masih kurang ${(DAILY_WATER_TARGET - water).toFixed(1)} L dari target harian`

    const activityStatus =
      distance >= 2.5
        ? "aktivitas jogging hari ini sudah kuat untuk menjaga stamina dan kardio"
        : "aktivitas jogging hari ini masih bisa ditingkatkan secara bertahap"

    const calorieStatus =
      grossCalories >= 2200 && grossCalories <= 2500
        ? "asupan kalori hari ini cukup seimbang dengan target energi"
        : grossCalories < 2200
        ? "asupan kalori hari ini masih cenderung rendah"
        : "asupan kalori hari ini cenderung tinggi"

    return `Analisis harian untuk ${selectedDay}: daily score hari ini ${dailyScore}%. Secara khusus untuk hari ini, ${hydrationStatus}, ${activityStatus}, dan ${calorieStatus}. Hidrasi tercatat ${water.toFixed(
     1,
    )} L, jogging ${distance.toFixed(1)} km, kalori masuk ${grossCalories} kkal, net kalori setelah jogging ${netCalories} kkal, dengan estimasi makro karbo ${carbGram}g, protein ${proteinGram}g, dan lemak ${fatGram}g. Fokus utama hari ini adalah menjaga konsistensi tanpa membaca data ini sebagai laporan mingguan.`
}
const generateMonthlyAnalysis = () => {
  if (monthlyReports.length === 0) {
    return "Belum ada data bulanan. Simpan daily report secara konsisten agar sistem bisa membaca pola aktivitas, hidrasi, kalori, dan recovery dalam 30 hari terakhir."
  }

  if (monthlySummary.avgScore >= 90) {
    return `Bulan ini performa kesehatan terlihat sangat kuat. Rata-rata score ${monthlySummary.avgScore}%, total jogging ${monthlySummary.totalRun.toFixed(1)} km, total hidrasi ${monthlySummary.totalHydration.toFixed(1)} L, dan total sesi tersimpan ${monthlySummary.totalSessions}. Pola ini menunjukkan konsistensi tinggi dalam aktivitas, hidrasi, energi, dan recovery.`
  }

  if (monthlySummary.avgWater < 2.1) {
    return `Analisis bulanan menunjukkan hidrasi masih menjadi prioritas utama. Rata-rata air minum ${monthlySummary.avgWater.toFixed(1)} L per hari masih di bawah target ideal. Jika pola ini berlanjut, fokus, stamina, dan recovery bisa kurang optimal.`
  }

  if (monthlySummary.totalRun < 20) {
    return `Total jogging bulan ini masih cukup ringan, yaitu ${monthlySummary.totalRun.toFixed(1)} km. Untuk peningkatan stamina, target bulan berikutnya bisa dinaikkan secara bertahap dengan menambah sesi pendek 2–3 km.`
  }

  return `Bulan ini kondisi cukup stabil. Rata-rata score ${monthlySummary.avgScore}%, total jogging ${monthlySummary.totalRun.toFixed(1)} km, rata-rata hidrasi ${monthlySummary.avgWater.toFixed(1)} L, dan rata-rata kalori ${monthlySummary.avgCalories} kkal. Masih ada ruang peningkatan pada konsistensi hidrasi, aktivitas kardio, dan distribusi energi harian.`
}

  const generateYearlyAnalysis = () => {
    if (yearlyReports.length === 0) {
    return "Belum ada data tahunan. Sistem membutuhkan histori aktivitas jangka panjang untuk membaca pola kesehatan, hidrasi, dan performa tubuh secara menyeluruh."
  }

  if (yearlySummary.avgScore >= 90) {
    return `Performa kesehatan tahunan terlihat sangat optimal. Rata-rata yearly score mencapai ${yearlySummary.avgScore}%, total jogging ${yearlySummary.totalRun.toFixed(1)} km, dan hidrasi harian stabil di ${yearlySummary.avgWater.toFixed(1)} L. Konsistensi ini menunjukkan pola hidup aktif dan recovery tubuh yang sangat baik.`
  }

  if (yearlySummary.avgWater < 2.1) {
    return `Analisis tahunan menunjukkan hidrasi masih menjadi area yang perlu ditingkatkan. Rata-rata hidrasi harian hanya ${yearlySummary.avgWater.toFixed(1)} L. Dalam jangka panjang, pola ini dapat memengaruhi energi, fokus, dan recovery tubuh.`
  }

  if (yearlySummary.totalRun < 120) {
    return `Total jogging tahunan masih relatif rendah yaitu ${yearlySummary.totalRun.toFixed(1)} km. Aktivitas fisik sudah berjalan, namun konsistensi kardio jangka panjang masih bisa ditingkatkan untuk mendukung kesehatan metabolik dan daya tahan tubuh.`
  }

  return `Kondisi kesehatan tahunan terlihat cukup stabil. Total jogging ${yearlySummary.totalRun.toFixed(1)} km, rata-rata score ${yearlySummary.avgScore}%, hidrasi ${yearlySummary.avgWater.toFixed(1)} L, dan kalori rata-rata ${yearlySummary.avgCalories} kkal. Sistem melihat pola aktivitas dan recovery cukup baik dengan ruang peningkatan pada konsistensi harian.`
}

const generateWeeklyAnalysis = () => {

    if (weeklyReports.length === 0) {
      return "Belum ada data mingguan. Simpan beberapa report harian terlebih dahulu agar sistem bisa membaca pola tubuh, aktivitas, hidrasi, dan energi mingguan."
    }

    if (weeklySummary.avgScore >= 90) {
      return `Minggu ini kondisi tubuh terlihat sangat optimal. Rata-rata daily score mencapai ${weeklySummary.avgScore}%, total jogging ${weeklySummary.totalRun.toFixed(1)} km, dan hidrasi rata-rata ${weeklySummary.avgWater.toFixed(1)} L per hari. Pola ini menunjukkan recovery, energi, dan aktivitas fisik berada dalam kondisi kuat. Pertahankan ritme ini dan fokus pada konsistensi protein untuk mendukung pemulihan otot.`
    }

    if (weeklySummary.avgWater < 2.1) {
      return `Analisis minggu ini menunjukkan hidrasi masih menjadi titik yang perlu diperbaiki. Rata-rata air minum hanya ${weeklySummary.avgWater.toFixed(1)} L per hari. Kondisi ini bisa membuat fokus, recovery, dan performa jogging menurun. Prioritas minggu depan adalah menaikkan hidrasi terutama setelah aktivitas fisik dan menjelang sore hari.`
    }

    if (weeklySummary.totalRun < 6) {
      return `Aktivitas jogging minggu ini masih relatif rendah dengan total ${weeklySummary.totalRun.toFixed(1)} km. Secara energi tubuh masih stabil, tetapi stimulus kardio belum terlalu kuat. Minggu depan bisa mulai naikkan target secara bertahap, misalnya tambah 1–2 sesi ringan dengan jarak 2 km agar adaptasi tubuh tetap aman.`
    }

    if (weeklySummary.avgCalories > 2600) {
      return `Asupan kalori minggu ini cenderung tinggi dengan rata-rata ${weeklySummary.avgCalories} kkal per hari. Jogging membantu membakar sebagian energi, tetapi jika pola ini berulang, komposisi tubuh bisa kurang efisien. Coba kontrol snack dan pilih menu tinggi protein agar kenyang lebih lama.`
    }

    return `Kondisi tubuh minggu ini cukup stabil. Rata-rata daily score ${weeklySummary.avgScore}%, total jogging ${weeklySummary.totalRun.toFixed(1)} km, hidrasi rata-rata ${weeklySummary.avgWater.toFixed(1)} L, dan kalori rata-rata ${weeklySummary.avgCalories} kkal. Secara umum sudah baik, tetapi masih ada ruang peningkatan pada konsistensi hidrasi, aktivitas, dan distribusi nutrisi harian.`
  }

  const playCurrentSong = () => {
    setTimeout(() => {
      audioRef.current?.play()
    }, 80)
  }

  const goToNextSong = () => {
    setCurrentSong((prev) => {
      if (isShuffle) return Math.floor(Math.random() * playlist.length)
      return prev === playlist.length - 1 ? 0 : prev + 1
    })
    playCurrentSong()
  }

  const goToPreviousSong = () => {
    setCurrentSong((prev) => (prev === 0 ? playlist.length - 1 : prev - 1))
    playCurrentSong()
  }

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play()
    else audio.pause()
  }

  useEffect(() => {
    if (isPlaying) playCurrentSong()
  }, [currentSong])

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#121417]">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_78%_10%,rgba(252,76,2,0.16),transparent_30%),radial-gradient(circle_at_10%_90%,rgba(18,20,23,0.08),transparent_25%)]" />

      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 md:px-8">
          <button onClick={() => setPage("home")} className="flex items-center gap-3 text-left">
            <Logo />
            <div>
              <h1 className="text-xl font-black tracking-tight md:text-2xl">
                Heal The <span className="text-[#FC4C02]">Future</span>
              </h1>
              <p className="text-xs font-semibold text-gray-500">By Muhammad Faris Nafiuddin</p>
            </div>
          </button>

          <div className="hidden gap-2 rounded-full border border-black/5 bg-[#F1F1EF] p-1 lg:flex">
            {pages.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`rounded-full px-4 py-2 text-sm font-black transition ${page === item.id ? "bg-white text-[#FC4C02] shadow-sm" : "text-gray-600 hover:bg-white hover:text-[#FC4C02]"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage("tracker")}
            className="rounded-full bg-[#FC4C02] px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#ff6b2c]"
          >
            Tracker Pribadi
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-8">
        {page === "home" && (
          <section className="grid min-h-[82vh] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
              <h1>Muhammad Faris Nafiuddin</h1>
              <p>Official Portfolio and Health Analysis Website of Muhammad Faris Nafiuddin</p>
              <p>Muhammad Faris Nafiuddin is the creator of Heal The Future.</p>
            </div>

            <div>
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-black/5 bg-white px-5 py-3 shadow-sm">
                <Logo />
                <div>
                  <p className="text-sm font-black text-[#FC4C02]">Cinematic Sport Lifestyle</p>
                  <p className="text-xs font-semibold text-gray-500">Running • Nutrition • Analysis • Growth</p>
                </div>
              </div>

              <h1 className="mb-5 text-6xl font-black leading-[0.92] tracking-tight md:text-8xl">
                Heal The <span className="text-[#FC4C02]">Future</span>
              </h1>
              <p className="mb-7 text-2xl font-bold text-[#121417]/80">By Muhammad Faris Nafiuddin</p>
              <p className="max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl">
                Website personal yang memadukan dokumentasi jogging, pola makan, meal prep, komunitas, simulator hidrasi, simulator jogging, dan analisis progress harian.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <button onClick={() => setPage("analysis")} className="rounded-2xl bg-[#FC4C02] px-8 py-4 font-black text-white shadow-2xl shadow-orange-500/25 transition hover:bg-[#ff6b2c]">
                  Buka Analysis
                </button>
                <button onClick={() => setPage("tracker")} className="rounded-2xl border border-black/10 bg-white px-8 py-4 font-black shadow-sm transition hover:shadow-xl">
                  Buka Tracker Pribadi
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-full bg-[#FC4C02]/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[42px] border border-white bg-white p-4 shadow-2xl">
                <video autoPlay muted loop playsInline poster={media.joggingGroup} className="h-[560px] w-full rounded-[32px] object-cover">
                  <source src={media.heroVideo} type="video/mp4" />
                </video>
                <div className="absolute bottom-8 left-8 right-8 rounded-3xl border border-white bg-white/90 p-6 shadow-xl backdrop-blur-2xl">
                  <p className="mb-3 text-sm font-black text-[#FC4C02]">Live Lifestyle Snapshot</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-2xl font-black">{weeklyRun}</h3>
                      <p className="text-xs font-bold text-gray-500">KM/Minggu</p>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">2.5L</h3>
                      <p className="text-xs font-bold text-gray-500">Hidrasi</p>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">{dailyScore}%</h3>
                      <p className="text-xs font-bold text-gray-500">Score</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {page === "activity" && (
          <section>
            <PageTitle eyebrow="Activity" title="Running process yang bisa dibaca jelas" desc="Foto dan video dipakai sebagai bukti proses. Bagian ini menunjukkan aktivitas jogging, progres, konsistensi, hydration support, dan recovery." />
            <div className="grid items-start gap-6 xl:grid-cols-[420px_1fr]">
              <div className="grid grid-cols-2 gap-5">
                <img src={media.joggingRun} className="h-72 w-full rounded-[32px] object-cover shadow-xl" />
                <img src={media.joggingGroup} className="mt-10 h-72 w-full rounded-[32px] object-cover shadow-xl" />
                <img src={media.waterBottle} className="-mt-10 h-72 w-full rounded-[32px] object-cover shadow-xl" />
                <img src={media.joggingNight} className="h-72 w-full rounded-[32px] object-cover shadow-xl" />
              </div>
              <Card className="p-8">
                <h3 className="mb-8 text-3xl font-black">Weekly Performance</h3>
                <div className="space-y-7">
                  <Bar value={92} label="Konsistensi" />
                  <Bar value={87} label="Cardio progress" />
                  <Bar value={90} label="Recovery" />
                  <Bar value={hydrationScore} label="Hydration support" />
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <Stat value={`${weeklyRun} km`} label="Total minggu ini" />
                  <Stat value="4x" label="Sesi jogging" />
                </div>
              </Card>
            </div>
          </section>
        )}

        {page === "analysis" && (
          <section>
            <PageTitle eyebrow="Analysis" title="Simulator & dashboard personal" desc="Pusat analisis untuk jadwal, hidrasi, jogging, kalori, makro nutrisi, dan progress harian. Setiap tab punya fungsi yang bisa digeser dan hasilnya tersambung ke daily score." />

            <div className="mb-8 flex flex-wrap gap-3 rounded-[30px] border border-black/5 bg-white p-3 shadow-lg">
              {analysisTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAnalysisTab(tab)}
                  className={`rounded-2xl px-5 py-3 font-black capitalize transition ${analysisTab === tab ? "bg-[#FC4C02] text-white shadow-lg shadow-orange-500/20" : "bg-[#F4F4F2] text-gray-600 hover:bg-white hover:shadow"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {analysisTab === "jadwal" && (
              <div className="grid gap-4 md:grid-cols-7">
                {week.map((item) => (
                  <Card key={item.day}>
                    <h3 className="text-2xl font-black text-[#FC4C02]">{item.day}</h3>
                    <p className="mt-3 font-black">{item.type}</p>
                    <p className="mt-3 text-sm font-semibold text-gray-500">{item.kcal} kkal</p>
                    <p className="text-sm font-semibold text-gray-500">Air {item.water} L</p>
                    <p className="text-sm font-semibold text-gray-500">Run {item.run} km</p>
                  </Card>
                ))}
              </div>
            )}

            {analysisTab === "hidrasi" && (
              <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                <Card className="flex justify-center p-8"><HydrationBottle liters={water} /></Card>
                <Card className="p-8">
                  <h3 className="mb-3 text-3xl font-black">Cek Status Hidrasi</h3>
                  <p className="mb-8 leading-relaxed text-gray-600">Geser slider sesuai air yang sudah diminum. Botol akan terisi mengikuti progress menuju target 2.5 liter per hari.</p>
                  <RangeControl label="Air yang sudah diminum" value={water} min={0} max={3} step={0.1} unit=" L" onChange={setWater} />
                  <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <Stat value={`${hydrationScore}%`} label="Target" />
                    <Stat value={`${Math.max(0, DAILY_WATER_TARGET - water).toFixed(1)} L`} label="Sisa" />
                    <Stat value={water >= DAILY_WATER_TARGET ? "Aman" : "Perlu minum"} label="Status" />
                  </div>
                </Card>
              </div>
            )}

            {analysisTab === "jogging" && (
              <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
                <Card className="p-8">
                  <h3 className="mb-3 text-3xl font-black">Strava Jogging Analysis</h3>
                  <p className="mb-8 text-gray-600">Masukkan data dari Strava untuk membaca performa jogging berdasarkan jarak, pace, waktu bergerak, dan elevasi.</p>

                  <div className="space-y-7">
                    <RangeControl label="Jarak" value={stravaDistance} min={0.5} max={10} step={0.01} unit=" km" onChange={setStravaDistance} />
                    <RangeControl label="Pace menit" value={stravaPaceMin} min={4} max={15} step={1} unit=" min" onChange={setStravaPaceMin} />
                    <RangeControl label="Pace detik" value={stravaPaceSec} min={0} max={59} step={1} unit=" sec" onChange={setStravaPaceSec} />

                    <div>
                      <p className="mb-3 font-black">Waktu bergerak</p>
                      <input
                        value={stravaMovingTime}
                        onChange={(event) => setStravaMovingTime(event.target.value)}
                        placeholder="19:49"
                        className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 font-bold outline-none"
                      />
                    </div>

                    <RangeControl label="Kenaikan elevasi" value={stravaElevationGain} min={0} max={500} step={1} unit=" m" onChange={setStravaElevationGain} />
                    <RangeControl label="Elevasi maks" value={stravaMaxElevation} min={0} max={2000} step={1} unit=" m" onChange={setStravaMaxElevation} />
                  </div>
                </Card>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <Stat value={`${stravaDistance.toFixed(2)} km`} label="Jarak" />
                    <Stat value={`${stravaPaceMin}:${String(stravaPaceSec).padStart(2, "0")} /km`} label="Pace rata-rata" />
                    <Stat value={stravaMovingTime} label="Waktu bergerak" />
                    <Stat value={`${stravaElevationGain} m`} label="Kenaikan elevasi" />
                    <Stat value={`${stravaMaxElevation} m`} label="Elevasi maks" />
                    <Stat value={`${stravaEstimatedCalories}`} label="Kkal terbakar" />
                  </div>

                  <Card className="p-8">
                    <h3 className="mb-3 text-2xl font-black text-[#FC4C02]">AI Running Analysis</h3>
                    <p className="leading-relaxed text-gray-600">{generateStravaAnalysis()}</p>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <Stat value={`${stravaEstimatedSpeed} km/jam`} label="Estimasi speed" />
                      <Stat value={`${stravaLoops}x`} label="Putaran 400m" />
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {analysisTab === "kalori" && (
              <div className="rounded-[36px] bg-[#102544] p-8 text-white shadow-2xl">
                <h3 className="mb-3 text-3xl xl:text-4xl font-black">Pencapaian Kalori Harian — Simulasi Interaktif</h3>
                <p className="mb-10 text-lg text-blue-200">Geser slider untuk melihat estimasi kalori dari kombinasi makan, snack, jus pepaya, dan jogging.</p>
                <div className="grid gap-10 lg:grid-cols-3">
                  <RangeControl label="Porsi Makan Utama" value={portion} min={1} max={3} step={0.1} unit="x" onChange={setPortion} />
                  <RangeControl label="Snack Tambahan" value={snack} min={0} max={800} step={50} unit=" kkal" onChange={setSnack} />
                  <div>
                    <p className="mb-3 font-black">Jus Pepaya</p>
                    <button onClick={() => setPapayaJuice(!papayaJuice)} className={`h-12 w-24 rounded-full p-1 transition ${papayaJuice ? "bg-cyan-400" : "bg-white/20"}`}>
                      <div className={`h-10 w-10 rounded-full bg-[#102544] transition ${papayaJuice ? "translate-x-12" : ""}`} />
                    </button>
                    <p className="mt-3 text-blue-200">{papayaJuice ? "+86 kkal/hari" : "Tidak dihitung"}</p>
                  </div>
                </div>
                <div className="mt-14 grid items-center gap-10 lg:grid-cols-[0.7fr_1.3fr]">
                  <div className="flex justify-center"><CalorieRing value={grossCalories} /></div>
                  <div className="space-y-8">
                    <Bar value={foodCalories} max={2500} label="Makan Utama" color="bg-cyan-400" />
                    <Bar value={snack} max={800} label="Snack Tambahan" color="bg-orange-300" />
                    <Bar value={papayaCalories} max={200} label="Jus Pepaya" color="bg-green-400" />
                    <Bar value={burned} max={600} label="Kalori Terbakar Jogging" color="bg-red-400" />
                    <div className="rounded-[28px] bg-white/10 p-6">
                      <p className="text-xl font-black text-cyan-300">Net kalori setelah jogging: {netCalories} kkal</p>
                      <p className="mt-2 text-blue-100">Progress target kalori: {caloriePercent}% dari {DAILY_CAL_TARGET} kkal.</p>
                    </div>
                    <p className={`text-2xl font-black ${grossCalories >= 2200 && grossCalories <= 2500 ? "text-green-400" : "text-yellow-300"}`}>
                      {grossCalories >= 2200 && grossCalories <= 2500 ? "✅ Sesuai target harian — optimal" : grossCalories < 2200 ? "⚠️ Kalori masih kurang dari target" : "⚠️ Kalori melebihi target harian"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analysisTab === "makro" && (
              <div className="rounded-[36px] bg-[#102544] p-8 text-white shadow-2xl">
                <h3 className="mb-3 text-3xl xl:text-4xl font-black">Resume Makro Nutrisi & Daily Readiness</h3>
                <p className="mb-10 text-lg text-blue-200">Ringkasan ini berubah real-time berdasarkan hidrasi, jogging, kalori, dan asupan harian.</p>
                <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="mx-auto max-w-[420px]">
                    <MacroDonut dailyScore={dailyScore} hydrationScore={hydrationScore} activityScore={activityScore} calorieScore={calorieScore} />
                  </div>
                  <div className="space-y-7">
                    <div className="grid grid-cols-3 gap-4">
                      <Stat value={`${carbGram}g`} label="Karbo" dark />
                      <Stat value={`${proteinGram}g`} label="Protein" dark />
                      <Stat value={`${fatGram}g`} label="Lemak" dark />
                    </div>
                    <div className="space-y-5">
                      <Bar value={hydrationScore} label={`Hidrasi ${water.toFixed(1)}L / 2.5L`} color="bg-cyan-400" />
                      <Bar value={activityScore} label={`Jogging ${distance.toFixed(1)} km`} color="bg-green-400" />
                      <Bar value={calorieScore} label={`Kalori ${grossCalories} kkal`} color="bg-orange-300" />
                    </div>
                    <div className="rounded-[28px] bg-white/10 p-6">
                      <h4 className="mb-3 text-2xl font-black text-[#FC4C02]">Status Harian</h4>
                      <p className="leading-relaxed text-blue-100">
                        {dailyScore >= 90 ? "Kondisi harian sangat baik. Hidrasi, aktivitas, dan kalori sudah mendukung recovery dan performa." : dailyScore >= 75 ? "Kondisi cukup baik, tapi masih ada bagian yang bisa ditingkatkan. Cek hidrasi, jogging, atau kalori." : "Kondisi belum optimal. Perhatikan hidrasi, asupan kalori, dan aktivitas harian."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {page === "nutrition" && (
          <section>
            <PageTitle eyebrow="Nutrition" title="Healthy cooking & food analysis" desc="Makanan ditampilkan sebagai bagian dari proses pengembangan diri, bukan sekadar galeri. Setiap menu mendukung analisis energi, protein, dan budget." />
            <div className="grid gap-8 md:grid-cols-3">
              {meals.map((meal) => (
                <Card key={meal.title} className="overflow-hidden p-0">
                  <img src={meal.image} className="h-[300px] w-full object-cover" />
                  <div className="p-7">
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#FC4C02]/10 px-3 py-1 text-xs font-black text-[#FC4C02]">{meal.kcal}</span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-600">{meal.protein}</span>
                    </div>
                    <h3 className="mb-3 text-2xl font-black">{meal.title}</h3>
                    <p className="leading-relaxed text-gray-600">{meal.note}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {page === "gallery" && (
          <section>
            <PageTitle eyebrow="Gallery" title="Visual process & documentation" desc="Foto dipakai untuk memperkuat cerita progress: jogging, hydration, masak, campus life, dan pengembangan diri." />
            <div className="columns-1 gap-6 space-y-6 md:columns-3">
              {gallery.map((item) => (
                <div key={item.src} className="break-inside-avoid overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
                  <img src={item.src} className="w-full transition duration-700 hover:scale-105" />
                  <p className="p-4 font-black text-[#FC4C02]">{item.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {page === "music" && (
          <section className="min-h-screen rounded-[40px] bg-[#08090B] px-6 py-12 text-white shadow-2xl">
            <div className="text-center">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-[#FC4C02]">Music Player</p>
              <h2 className="text-3xl xl:text-4xlxl:text-5xl font-black">Music Player</h2>
              <p className="mt-4 text-gray-400">Play your favorite songs and stay in the zone.</p>
            </div>
            <div className="mt-12 flex justify-center">
              <img src={media.dvd} className={`w-[420px] rounded-full drop-shadow-2xl ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "5s" }} />
            </div>
            <div className="mt-8 text-center">
              <h3 className="text-3xl font-black">{currentTrack.title}</h3>
              <p className="text-gray-400">{currentTrack.artist}</p>
            </div>
            <audio ref={audioRef} src={currentTrack.src} loop={isRepeat} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={goToNextSong} controls className="mx-auto mt-6 w-full max-w-3xl" />
            <div className="mt-8 flex justify-center gap-5">
              <button onClick={() => setIsShuffle(!isShuffle)} className={`rounded-2xl px-5 py-3 font-black ${isShuffle ? "bg-[#FC4C02]" : "bg-white/10"}`}>🔀</button>
              <button onClick={goToPreviousSong} className="rounded-2xl bg-white/10 px-5 py-3 font-black">⏮</button>
              <button onClick={togglePlay} className="rounded-full bg-white px-7 py-5 text-2xl font-black text-black">{isPlaying ? "⏸" : "▶"}</button>
              <button onClick={goToNextSong} className="rounded-2xl bg-white/10 px-5 py-3 font-black">⏭</button>
              <button onClick={() => setIsRepeat(!isRepeat)} className={`rounded-2xl px-5 py-3 font-black ${isRepeat ? "bg-[#FC4C02]" : "bg-white/10"}`}>🔁</button>
            </div>
            <div className="mx-auto mt-10 max-w-4xl rounded-[30px] border border-white/10 bg-white/5 p-5">
              <h3 className="mb-5 text-2xl font-black">Playlist</h3>
              <div className="space-y-3">
                {playlist.map((song, index) => (
                  <button key={song.title} onClick={() => { setCurrentSong(index); setIsPlaying(true) }} className={`flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left transition ${currentSong === index ? "bg-white/10 text-[#FC4C02]" : "hover:bg-white/5"}`}>
                    <div>
                      <p className="font-black">{song.title}</p>
                      <p className="text-sm text-gray-400">{song.artist}</p>
                    </div>
                    <p className="font-bold text-gray-400">{song.duration}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {page === "tracker" && !isPrivateTrackerUnlocked && (
          <section className="rounded-[40px] bg-[#08090B] px-6 py-16 text-white shadow-2xl">
            <div className="mx-auto max-w-xl rounded-[32px] border border-white/10 bg-white/5 p-8 text-center">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-[#FC4C02]">Private Access</p>
              <h2 className="text-3xl xl:text-4xl font-black">Tracker Pribadi</h2>
              <p className="mt-4 text-gray-400">Masukkan password untuk membuka tracker pribadi keluarga.</p>
              <input
                type="password"
                value={privateTrackerPin}
                onChange={(event) => setPrivateTrackerPin(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") unlockPrivateTracker() }}
                className="mt-8 w-full rounded-2xl bg-white/10 px-5 py-4 text-center text-2xl font-black tracking-[0.4em] outline-none"
                placeholder="••••••"
              />
              <button onClick={unlockPrivateTracker} className="mt-5 w-full rounded-2xl bg-[#FC4C02] px-8 py-4 font-black text-white shadow-xl shadow-orange-500/20 hover:bg-[#ff6b2c]">
                Buka Tracker Pribadi
              </button>
              <p className="mt-5 text-xs leading-relaxed text-gray-500">
                Catatan: proteksi PIN ini cocok untuk akses ringan di sisi tampilan. Untuk keamanan kuat dari peretasan, gunakan autentikasi backend.
              </p>
            </div>
          </section>
        )}

        {page === "tracker" && isPrivateTrackerUnlocked && (
          <section className="rounded-[40px] bg-[#08090B] px-6 py-12 text-white shadow-2xl">
            <div className="mb-10 text-center">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-[#FC4C02]">Private Smart Health Tracker</p>
              <h2 className="text-3xl xl:text-4xl font-black">Tracker Pribadi</h2>
              <p className="mt-4 text-gray-400">Simpan laporan harian, gunakan analysis tools, dan baca ringkasan mingguan berdasarkan aktivitas, hidrasi, kalori, dan makro.</p>

<div className="mt-8 rounded-[36px] border border-[#FC4C02]/20 bg-gradient-to-br from-[#FC4C02]/20 via-black/40 to-black/60 p-7">
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FC4C02]">
        Global Health Dashboard
      </p>

      <h2 className="mt-2 text-3xl font-black">
        Realtime Body Overview
      </h2>

      <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-300">
        Dashboard ini membaca kondisi hidrasi, aktivitas, kalori, recovery,
        dan kualitas kebiasaan harian secara realtime berdasarkan tracker.
      </p>
    </div>

    <div className="rounded-[28px] border border-[#FC4C02]/20 bg-black/30 px-6 py-5">
      <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
        Live Daily Score
      </p>

      <p className="mt-2 text-5xl font-black text-[#FC4C02]">
        {dailyScore}%
      </p>
    </div>
  </div>

<div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
  <Stat value={realtimeHealthStatus} label="Health Status" dark />
  <Stat value={realtimeRecoveryStatus} label="Recovery Status" dark />
  <Stat value={`${hydrationScore}%`} label="Hydration Score" dark />
  <Stat value={`${activityScore}%`} label="Activity Score" dark />
</div>

<div className="mt-6 rounded-[28px] bg-black/20 p-6">
  <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FC4C02]">
    Live Realtime Insight
  </p>

  <p className="mt-4 leading-8 text-gray-300">
    {realtimeInsight}
  </p>
</div>

</div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              { id: "daily", label: "Daily Tracker" },
              { id: "analysis", label: "Analysis Tools" },
              { id: "weekly", label: "Weekly Summary" },
             ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPrivateTrackerTab(tab.id)}
                className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
                  privateTrackerTab === tab.id
                  ? "bg-[#FC4C02] text-white shadow-lg shadow-orange-500/20"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {privateTrackerTab === "daily" && (
          <>
            <div className="grid gap-6 lg:grid-cols-4">
              <Stat value={`${water.toFixed(1)} L`} label="Hidrasi Saat Ini" dark />
              <Stat value={`${distance.toFixed(1)} km`} label="Jogging Saat Ini" dark />
              <Stat value={`${grossCalories}`} label="Kalori Saat Ini" dark />
              <Stat value={`${dailyScore}%`} label="Daily Score" dark />
            </div>
<div className="mt-8 rounded-[32px] border border-[#FC4C02]/20 bg-[#FC4C02]/10 p-6">
  <p className="text-xs font-black uppercase tracking-[0.3em] text-[#FC4C02]">
    Realtime Health Intelligence
  </p>

  <div className="mt-5 grid gap-4 md:grid-cols-2">
    <Stat value={realtimeHealthStatus} label="Current Health Status" dark />
    <Stat value={realtimeRecoveryStatus} label="Recovery Status" dark />
  </div>

  <div className="mt-6 space-y-5 rounded-[28px] bg-black/20 p-6">
  <Bar value={hydrationScore} label={`Hydration Score ${hydrationScore}%`} color="bg-cyan-400" />
  <Bar value={activityScore} label={`Activity Score ${activityScore}%`} color="bg-green-400" />
  <Bar value={calorieScore} label={`Calorie Score ${calorieScore}%`} color="bg-orange-300" />

  <p className="pt-3 leading-8 text-gray-300">{realtimeInsight}</p>
</div>
</div>
<div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6">
  <p className="text-xs font-black uppercase tracking-[0.3em] text-[#FC4C02]">
    AI Smart Recommendations
  </p>

  <h3 className="mt-2 text-2xl font-black">
    Action Plan Hari Ini
  </h3>

  <div className="mt-6 space-y-3">
    {generateSmartRecommendations().map((item, index) => (
      <div
        key={index}
        className="rounded-2xl border border-white/10 bg-black/20 p-4"
      >
        <p className="text-sm leading-7 text-gray-300">
          {index + 1}. {item}
        </p>
      </div>
    ))}
  </div>
</div>
<div className="mt-8 rounded-[32px] border border-red-500/20 bg-red-500/10 p-6">
  <p className="text-xs font-black uppercase tracking-[0.3em] text-red-300">
    AI Health Risk Detection
  </p>

  <h3 className="mt-2 text-2xl font-black">
    Risk Check Hari Ini
  </h3>

  <div className="mt-6 space-y-3">
    {generateHealthRiskDetection().map((item, index) => (
      <div
        key={index}
        className="rounded-2xl border border-red-500/20 bg-black/20 p-4"
      >
        <p className="text-sm leading-7 text-gray-300">
          {index + 1}. {item}
        </p>
      </div>
    ))}
  </div>
</div>
<div className="mt-8 rounded-[32px] border border-green-500/20 bg-green-500/10 p-6">
  <p className="text-xs font-black uppercase tracking-[0.3em] text-green-300">
    AI Recovery Prediction
  </p>

  <h3 className="mt-2 text-2xl font-black">
    Prediksi Recovery 24 Jam
  </h3>

  <div className="mt-6 rounded-[28px] bg-black/20 p-6">
    <p className="leading-8 text-gray-300">
      {generateRecoveryPrediction()}
    </p>
  </div>
</div>

<div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6"></div>
            <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6">
              <h3 className="mb-5 text-2xl font-black text-[#FC4C02]">Save Daily Report</h3>
              <label className="mb-4 block space-y-2">
                <span className="text-sm font-bold text-gray-300">Email tujuan laporan</span>
                <input type="email" value={privateEmail} onChange={(e) => setPrivateEmail(e.target.value)} className="w-full rounded-2xl bg-white/10 px-5 py-4 font-bold outline-none" placeholder="email@example.com" />
              </label>

              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <select value={selectedDay} onChange={(event) => setSelectedDay(event.target.value)} className="rounded-2xl bg-white/10 px-5 py-4 font-black text-white outline-none">
                  {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((day) => (
                    <option key={day} value={day} className="text-black">{day}</option>
                  ))}
                </select>
                <button onClick={saveDailyReport} className="rounded-2xl bg-[#FC4C02] px-8 py-4 font-black text-white shadow-xl shadow-orange-500/20 transition hover:bg-[#ff6b2c]">Save Report</button>
              </div>

              <div
  onDrop={handleTrackerDrop}
  onDragOver={handleTrackerDragOver}
  onDragLeave={handleTrackerDragLeave}
  className={`mt-6 rounded-[28px] border-2 border-dashed p-6 text-center transition ${
    dragActive ? "border-[#FC4C02] bg-[#FC4C02]/10" : "border-white/20 bg-white/5"
  }`}
>
  <p className="text-lg font-black text-[#FC4C02]">Photo Detector</p>
  <p className="mt-2 text-sm text-gray-300">
    Drag foto Strava ke sini atau upload manual untuk membantu analisis visual tracker.
  </p>
  <p className="mx-auto mt-3 max-w-2xl text-xs leading-6 text-gray-400">
    {TRACKER_UPLOAD_GUIDE}
  </p>

  <div className="mt-6 overflow-hidden rounded-[24px] border border-white/10 bg-black/20 p-4">
  <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-[#FC4C02]">
    Contoh Foto Strava
  </p>

  <img
    src="/Contoh Foto Strava.jpeg"
    alt="Contoh Foto Strava"
    className="max-h-[260px] w-full rounded-[18px] bg-white object-contain"
  />

  <p className="mt-3 text-sm text-gray-300">
    Contoh foto yang ideal menampilkan jarak, pace rata-rata, waktu bergerak,
    kenaikan elevasi, dan elevasi maks dengan jelas.
  </p>
</div>

<label className="mt-5 inline-block cursor-pointer rounded-2xl bg-white px-5 py-3 font-black text-black hover:bg-gray-200">
  Upload Foto
  
    <input
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp"
      className="hidden"
      onChange={(event) => handleTrackerImageUpload(event.target.files?.[0], "private")}
    />
  </label>

  {uploadedTrackerPreview && (
  <div className="mt-6 space-y-5">
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20 p-3">
      <img
        src={uploadedTrackerPreview}
        alt="Uploaded tracker preview"
        className="max-h-[420px] w-full rounded-[18px] object-contain"
      />

      <button
        onClick={autoDetectStravaData}
        className="mt-4 rounded-2xl bg-[#FC4C02] px-5 py-3 font-black text-white hover:bg-[#ff6b2c]"
      >
        Auto Detect Tracker Data
      </button>

      <div className="mt-5 flex flex-wrap gap-3">
  <div
    className={`rounded-2xl px-4 py-2 text-sm font-black ${
      ocrStatus === "processing"
        ? "bg-yellow-500/20 text-yellow-300"
        : ocrStatus === "completed"
        ? "bg-green-500/20 text-green-300"
        : "bg-white/10 text-white"
    }`}
  >
    {ocrStatus === "processing"
      ? "AI Scanning Tracker..."
      : ocrStatus === "completed"
      ? "Tracker Successfully Analyzed"
      : "Waiting OCR"}
  </div>

  <div className="rounded-2xl bg-[#FC4C02]/10 px-4 py-2 text-sm font-black text-[#FC4C02]">
    Smart Detection Enabled
  </div>

  {detectedTrackerData && (
    <div
      className={`rounded-2xl px-4 py-2 text-sm font-black ${
        detectedTrackerData.confidence >= 85
          ? "bg-green-500/10 text-green-300"
          : detectedTrackerData.confidence >= 55
          ? "bg-yellow-500/10 text-yellow-300"
          : detectedTrackerData.confidence >= 30
          ? "bg-orange-500/10 text-orange-300"
          : "bg-red-500/10 text-red-300"
      }`}
    >
      AI Confidence {detectedTrackerData.confidence}% • {detectedTrackerData.analysisStatus || "PROCESSING"}
    </div>
  )}
</div>
      <p className="mt-3 text-sm leading-7 text-gray-300">
        {detectedTrackerData?.notes || "Foto berhasil terbaca. Sistem visual tracker siap membaca data jogging dan aktivitas."}
      </p>
      {detectedTrackerData && (
        <p className="mt-2 text-xs leading-6 text-gray-500">
          Field terbaca: Distance {detectedTrackerData.fields?.distance ? "✓" : "—"} • Pace {detectedTrackerData.fields?.pace ? "✓" : "—"} • Moving Time {detectedTrackerData.fields?.movingTime ? "✓" : "—"} • Elevation Gain {detectedTrackerData.fields?.elevationGain ? "✓" : "—"} • Max Elevation {detectedTrackerData.fields?.maxElevation ? "✓" : "—"}
        </p>
      )}
    </div>

    <div className="rounded-[32px] border border-[#FC4C02]/20 bg-gradient-to-br from-[#FC4C02]/10 to-black/40 p-8 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#FC4C02]">
            AI VISUAL ENGINE
          </p>

          <h3 className="mt-2 text-3xl font-black">
            Smart Running Analysis
          </h3>
        </div>

        <div className="rounded-2xl border border-[#FC4C02]/30 bg-[#FC4C02]/10 px-5 py-3">
          <p className="text-xs uppercase tracking-[0.25em] text-[#FC4C02]">
            Tracker Status
          </p>

          <p className="mt-1 text-lg font-black">
            {uploadedTrackerPreview ? "Tracker Detected" : "Waiting Upload"}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <div className="min-w-0 rounded-3xl bg-black/30 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
            Distance
          </p>

          <p className="mt-3 break-words text-2xl font-black leading-tight text-[#FC4C02] xl:text-3xl">
            {stravaDistance.toFixed(2)} km
          </p>
        </div>

        <div className="min-w-0 rounded-3xl bg-black/30 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
            Pace
          </p>

          <p className="mt-3 break-words text-2xl font-black leading-tight text-[#FC4C02] xl:text-3xl">
            {stravaPaceMin}:{String(stravaPaceSec).padStart(2, "0")}
          </p>
        </div>

        <div className="min-w-0 rounded-3xl bg-black/30 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
            Moving Time
          </p>

          <p className="mt-3 break-words text-2xl font-black leading-tight text-[#FC4C02] xl:text-3xl">
            {stravaMovingTime}
          </p>
        </div>

        <div className="min-w-0 rounded-3xl bg-black/30 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
            Calories
          </p>

          <p className="mt-3 break-words text-2xl font-black leading-tight text-[#FC4C02] xl:text-3xl">
            {stravaEstimatedCalories}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-black/30 p-6">
        <p className="text-sm leading-8 text-gray-300">
          {generateVisualTrackerAnalysis()}
        </p>
      </div>
    </div>
  </div>
)}
</div>

<div className="mt-4 flex flex-wrap gap-3">
 <button onClick={downloadPrivatePDF} className="rounded-2xl bg-white px-5 py-3 font-black text-black hover:bg-gray-200">Download PDF Analysis</button>
 <button onClick={openPrivateEmailDraft} className="rounded-2xl bg-[#FC4C02] px-5 py-3 font-black text-white hover:bg-[#ff6b2c]">Kirim Email</button>
</div>
            </div>
         </>
        )}

      {privateTrackerTab === "analysis" && (
        <div className="mt-8 space-y-8">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-[#FC4C02]">
              Smart Analysis Tools
            </p>

            <h3 className="text-3xl font-black">
              Analysis & Macro Intelligence
            </h3>

            <p className="mt-4 max-w-3xl text-gray-400">
              Gunakan tools analisis untuk membaca hidrasi, jogging,
              kalori, makro, performa harian, dan pola tubuh secara lebih mendalam.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <Stat value={`${water.toFixed(1)} L`} label="Hydration" dark />
              <Stat value={`${distance.toFixed(1)} km`} label="Running" dark />
              <Stat value={`${grossCalories}`} label="Calories" dark />
              <Stat value={`${dailyScore}%`} label="Health Score" dark />
            </div>

            <div className="mt-8 grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="mx-auto max-w-[420px]">
                <MacroDonut dailyScore={dailyScore} hydrationScore={hydrationScore} activityScore={activityScore} calorieScore={calorieScore} />
              </div>

              <div className="space-y-7">
                <div className="grid grid-cols-3 gap-4">
                  <Stat value={`${carbGram}g`} label="Karbo" dark />
                  <Stat value={`${proteinGram}g`} label="Protein" dark />
                  <Stat value={`${fatGram}g`} label="Lemak" dark />
                </div>

                <div className="space-y-5">
                  <Bar value={hydrationScore} label={`Hidrasi ${water.toFixed(1)}L / 2.5L`} color="bg-cyan-400" />
                  <Bar value={activityScore} label={`Jogging ${distance.toFixed(1)} km`} color="bg-green-400" />
                  <Bar value={calorieScore} label={`Kalori ${grossCalories} kkal`} color="bg-orange-300" />
                </div>

                <div className="rounded-[28px] bg-black/20 p-6">
                  <h4 className="mb-3 text-2xl font-black text-[#FC4C02]">AI Daily Analysis</h4>
                  <div className="space-y-6">
  <div className="rounded-[28px] border border-[#FC4C02]/20 bg-[#FC4C02]/10 p-6">
    <p className="text-xs font-black uppercase tracking-[0.3em] text-[#FC4C02]">
      REALTIME SESSION INSIGHT
    </p>

    <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      <div className="min-w-0 rounded-3xl bg-black/30 p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
          Weekly Status
        </p>

        <p className="mt-3 text-lg font-black leading-tight text-[#FC4C02] sm:text-xl">
          {liveWeeklyStatus}
        </p>
      </div>

      <div className="min-w-0 rounded-3xl bg-black/30 p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
          Activity Trend
        </p>

        <p className="mt-3 text-lg font-black leading-tight text-[#FC4C02] sm:text-xl">
          {liveActivityTrend}
        </p>
      </div>

      <div className="min-w-0 rounded-3xl bg-black/30 p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
          Hydration Trend
        </p>

        <p className="mt-3 text-lg font-black leading-tight text-[#FC4C02] sm:text-xl">
          {liveHydrationTrend}
        </p>
      </div>

      <div className="min-w-0 rounded-3xl bg-black/30 p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
          Recovery
        </p>

        <p className="mt-3 text-lg font-black leading-tight text-[#FC4C02] sm:text-xl">
          {liveRecoveryTrend}
        </p>
      </div>
    </div>
  </div>

  <div className="rounded-[28px] bg-black/20 p-6">
    <p className="leading-8 text-gray-300">
      {generateLiveSessionAnalysis()}
    </p>
  </div>
</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
                <HydrationBottle liters={water} />
              </div>

              <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
                <h3 className="mb-3 text-3xl font-black text-[#FC4C02]">
                  Hydration Intelligence
                </h3>

                <p className="mb-8 leading-relaxed text-gray-300">
                  Analisis hidrasi membaca progress air minum harian, sisa kebutuhan cairan,
                  dan dampaknya terhadap fokus, recovery, energi, serta performa jogging.
                </p>

                <RangeControl
                  label="Air yang sudah diminum"
                  value={water}
                  min={0}
                  max={3}
                  step={0.1}
                  unit=" L"
                  onChange={setWater}
                />

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <Stat value={`${hydrationScore}%`} label="Target Hidrasi" dark />
                  <Stat value={`${Math.max(0, DAILY_WATER_TARGET - water).toFixed(1)} L`} label="Sisa Air" dark />
                  <Stat value={water >= DAILY_WATER_TARGET ? "Aman" : "Perlu Minum"} label="Status" dark />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
                <h3 className="mb-3 text-3xl font-black text-[#FC4C02]">
                  Strava Jogging Intelligence
                </h3>

                <p className="mb-8 text-gray-300">
                  Masukkan data dari Strava untuk membaca performa jogging berdasarkan jarak,
                  pace, waktu bergerak, dan elevasi.
                </p>

                <div className="space-y-7">
                  <RangeControl label="Jarak" value={stravaDistance} min={0.5} max={10} step={0.01} unit=" km" onChange={setStravaDistance} />
                  <RangeControl label="Pace menit" value={stravaPaceMin} min={4} max={15} step={1} unit=" min" onChange={setStravaPaceMin} />
                  <RangeControl label="Pace detik" value={stravaPaceSec} min={0} max={59} step={1} unit=" sec" onChange={setStravaPaceSec} />

                  <div>
                    <p className="mb-3 font-black">Waktu bergerak</p>
                    <input
                      value={stravaMovingTime}
                      onChange={(event) => setStravaMovingTime(event.target.value)}
                      placeholder="19:49"
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-4 font-bold text-white outline-none"
                    />
                  </div>

                  <RangeControl label="Kenaikan elevasi" value={stravaElevationGain} min={0} max={500} step={1} unit=" m" onChange={setStravaElevationGain} />
                  <RangeControl label="Elevasi maks" value={stravaMaxElevation} min={0} max={2000} step={1} unit=" m" onChange={setStravaMaxElevation} />
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <Stat value={`${stravaDistance.toFixed(2)} km`} label="Jarak" dark />
                  <Stat value={`${stravaPaceMin}:${String(stravaPaceSec).padStart(2, "0")} /km`} label="Pace" dark />
                  <Stat value={stravaMovingTime} label="Moving Time" dark />
                  <Stat value={`${stravaElevationGain} m`} label="Elevation Gain" dark />
                  <Stat value={`${stravaMaxElevation} m`} label="Max Elevation" dark />
                  <Stat value={`${stravaEstimatedCalories}`} label="Kkal Terbakar" dark />
                </div>

                <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
                  <h3 className="mb-3 text-2xl font-black text-[#FC4C02]">
                    AI Running Analysis
                  </h3>

                  <p className="leading-relaxed text-gray-300">
                    {generateStravaAnalysis()}
                  </p>
                </div>
              </div>
            </div>

          {privateTrackerTab === "weekly" && (
            <>
            <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 text-2xl font-black">Weekly AI Analysis</h3>
            <p className="mb-5 text-sm font-bold text-gray-400">
              Range: {weeklyDateRange} • Total Sessions: {weeklySummary.totalSessions}
            </p>
              <div className="grid gap-4 md:grid-cols-4">
  <Stat value={`${weeklySummary.totalRun.toFixed(1)} km`} label="Total Jogging" dark />
  <Stat value={`${weeklySummary.avgWater.toFixed(1)} L`} label="Rata-rata Hidrasi" dark />
  <Stat value={`${weeklySummary.avgCalories}`} label="Rata-rata Kalori" dark />
  <Stat value={`${weeklySummary.avgScore}%`} label="Weekly Score" dark />
</div>

<div className="mt-6 grid gap-4 md:grid-cols-4">
  <Stat value={`${weeklySummary.totalSessions}`} label="Sesi Tersimpan" dark />
  <Stat value={`${weeklySummary.totalBurned}`} label="Total Burned" dark />
  <Stat value={`${weeklySummary.totalCalories}`} label="Total Kalori" dark />
  <Stat value={`${weeklySummary.totalHydration.toFixed(1)} L`} label="Total Hidrasi" dark />
</div>
<div className="mt-6 rounded-[28px] bg-black/20 p-6">
  <p className="mb-5 text-sm font-black uppercase tracking-[0.25em] text-[#FC4C02]">
    Weekly Progress Chart
  </p>

  <div className="space-y-5">
    {weeklyReports.map((report, index) => (
      <div key={report.id || index}>
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-gray-300">
          <span>{report.day || `Day ${index + 1}`} • {report.date}</span>
          <span>{report.dailyScore || 0}%</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#FC4C02]"
            style={{ width: `${Math.min(100, report.dailyScore || 0)}%` }}
          />
        </div>
      </div>
    ))}

    {weeklyReports.length === 0 && (
      <p className="text-sm text-gray-400">
        Belum ada data harian untuk ditampilkan dalam weekly chart.
      </p>
    )}
  </div>
</div>
              <div className="mt-6 rounded-[28px] bg-white/10 p-6">
                <p className="leading-relaxed text-gray-200">{generateWeeklyAnalysis()}</p>
              </div>
            </div>
{/* MONTHLY AI ANALYSIS */}

<div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6">
  <h3 className="mb-2 text-2xl font-black">Monthly AI Analysis</h3>

  <p className="mb-5 text-sm font-bold text-gray-400">
    Last 30 Daily Reports • Total Sessions: {monthlySummary.totalSessions}
  </p>

  <div className="grid gap-4 md:grid-cols-4">
    <Stat value={`${monthlySummary.totalRun.toFixed(1)} km`} label="Monthly Jogging" dark />
    <Stat value={`${monthlySummary.avgWater.toFixed(1)} L`} label="Avg Hydration" dark />
    <Stat value={`${monthlySummary.avgCalories}`} label="Avg Calories" dark />
    <Stat value={`${monthlySummary.avgScore}%`} label="Monthly Score" dark />
  </div>

  <div className="mt-6 grid gap-4 md:grid-cols-4">
    <Stat value={`${monthlySummary.totalSessions}`} label="Total Sessions" dark />
    <Stat value={`${monthlySummary.totalBurned}`} label="Total Burned" dark />
    <Stat value={`${monthlySummary.totalCalories}`} label="Total Calories" dark />
    <Stat value={`${monthlySummary.totalHydration.toFixed(1)} L`} label="Total Hydration" dark />
  </div>
<div className="mt-6 rounded-[28px] bg-black/20 p-6">
  <p className="mb-5 text-sm font-black uppercase tracking-[0.25em] text-[#FC4C02]">
    Monthly Progress Chart
  </p>

  <div className="space-y-5">
    {monthlyReports.slice(0, 12).map((report, index) => (
      <div key={report.id || index}>
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-gray-300">
          <span>{report.day || `Day ${index + 1}`} • {report.date}</span>
          <span>{report.dailyScore || 0}%</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#FC4C02]"
            style={{ width: `${Math.min(100, report.dailyScore || 0)}%` }}
          />
        </div>
      </div>
    ))}

    {monthlyReports.length === 0 && (
      <p className="text-sm text-gray-400">
        Belum ada data harian untuk ditampilkan dalam monthly chart.
      </p>
    )}
  </div>
</div>
  <div className="mt-6 rounded-[28px] bg-white/10 p-6">
    <p className="leading-8 text-gray-200">
      {generateMonthlyAnalysis()}
    </p>
  </div>
</div>
{/* YEARLY AI ANALYSIS */}

<div className="mt-8 rounded-[32px] border border-[#FC4C02]/20 bg-[#FC4C02]/10 p-6">
  <h3 className="mb-2 text-2xl font-black">Yearly AI Analysis</h3>

  <p className="mb-5 text-sm font-bold text-gray-400">
    Last 365 Daily Reports • Total Sessions: {yearlySummary.totalSessions}
  </p>

  <div className="grid gap-4 md:grid-cols-4">
    <Stat value={`${yearlySummary.totalRun.toFixed(1)} km`} label="Yearly Jogging" dark />
    <Stat value={`${yearlySummary.avgWater.toFixed(1)} L`} label="Avg Hydration" dark />
    <Stat value={`${yearlySummary.avgCalories}`} label="Avg Calories" dark />
    <Stat value={`${yearlySummary.avgScore}%`} label="Yearly Score" dark />
  </div>

  <div className="mt-6 grid gap-4 md:grid-cols-4">
    <Stat value={`${yearlySummary.totalSessions}`} label="Total Sessions" dark />
    <Stat value={`${yearlySummary.totalBurned}`} label="Total Burned" dark />
    <Stat value={`${yearlySummary.totalCalories}`} label="Total Calories" dark />
    <Stat value={`${yearlySummary.totalHydration.toFixed(1)} L`} label="Total Hydration" dark />
  </div>
<div className="mt-6 rounded-[28px] bg-black/20 p-6">
  <p className="mb-5 text-sm font-black uppercase tracking-[0.25em] text-[#FC4C02]">
    Yearly Progress Chart
  </p>

  <div className="space-y-5">
    {yearlyReports.slice(0, 12).map((report, index) => (
      <div key={report.id || index}>
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-gray-300">
          <span>{report.day || `Month Point ${index + 1}`} • {report.date}</span>
          <span>{report.dailyScore || 0}%</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#FC4C02]"
            style={{ width: `${Math.min(100, report.dailyScore || 0)}%` }}
          />
        </div>
      </div>
    ))}

    {yearlyReports.length === 0 && (
      <p className="text-sm text-gray-400">
        Belum ada data harian untuk ditampilkan dalam yearly chart.
      </p>
    )}
  </div>
</div>
  <div className="mt-6 rounded-[28px] bg-black/20 p-6">
    <p className="leading-8 text-gray-200">
      {generateYearlyAnalysis()}
    </p>
  </div>
</div>
            <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-2xl font-black">Report History</h3>
                {reports.length > 0 && (
                  <button onClick={clearReports} className="rounded-xl bg-red-500/20 px-4 py-2 font-black text-red-200 hover:bg-red-500/30">Clear All</button>
                )}
              </div>

              {reports.length === 0 ? (
                <div className="rounded-[28px] bg-white/10 p-6 text-gray-300">Belum ada report tersimpan.</div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="rounded-[28px] bg-white/10 p-6">
                      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h4 className="text-2xl font-black text-[#FC4C02]">{report.day}</h4>
                          <p className="text-gray-300">Date: {report.date} • Jam: {report.time}</p>
                        </div>
                        <button onClick={() => deleteReport(report.id)} className="rounded-xl bg-red-500/20 px-4 py-2 font-black text-red-200 hover:bg-red-500/30">Delete</button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-4">
                        <div><p className="text-sm text-gray-400">Hidrasi</p><p className="font-black">{report.water} L</p></div>
                        <div><p className="text-sm text-gray-400">Jogging</p><p className="font-black">{report.distance} km</p></div>
                        <div><p className="text-sm text-gray-400">Kalori</p><p className="font-black">{report.grossCalories} kkal</p></div>
                        <div><p className="text-sm text-gray-400">Daily Score</p><p className="font-black">{report.dailyScore}%</p></div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-4">
                        <div><p className="text-sm text-gray-400">Karbo</p><p className="font-black">{report.carbGram}g</p></div>
                        <div><p className="text-sm text-gray-400">Protein</p><p className="font-black">{report.proteinGram}g</p></div>
                        <div><p className="text-sm text-gray-400">Lemak</p><p className="font-black">{report.fatGram}g</p></div>
                        <div><p className="text-sm text-gray-400">Status</p><p className="font-black text-[#FC4C02]">{report.status}</p></div>
                      </div>

                      {report.stravaDistance && (
                        <div className="mt-5 rounded-[22px] bg-white/10 p-5">
                          <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-[#FC4C02]">Strava Running Analysis</p>
                          <div className="grid gap-4 md:grid-cols-4">
                            <div><p className="text-sm text-gray-400">Jarak</p><p className="font-black">{report.stravaDistance} km</p></div>
                            <div><p className="text-sm text-gray-400">Pace</p><p className="font-black">{report.stravaPace}</p></div>
                            <div><p className="text-sm text-gray-400">Moving Time</p><p className="font-black">{report.stravaMovingTime}</p></div>
                            <div><p className="text-sm text-gray-400">Elevasi Maks</p><p className="font-black">{report.stravaMaxElevation} m</p></div>
                          </div>
                          <p className="mt-4 leading-relaxed text-gray-200">{report.stravaAnalysis}</p>

{report.realtimeInsight && (
  <div className="mt-4 rounded-2xl border border-[#FC4C02]/30 bg-[#FC4C02]/10 p-4">
    <p className="font-black text-[#FC4C02]">Realtime Intelligence Snapshot</p>

    <div className="mt-3 grid gap-3 md:grid-cols-2">
      <div className="rounded-2xl bg-black/20 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
          Health Status
        </p>
        <p className="mt-2 font-black text-white">
          {report.realtimeHealthStatus}
        </p>
      </div>

      <div className="rounded-2xl bg-black/20 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
          Recovery Status
        </p>
        <p className="mt-2 font-black text-white">
          {report.realtimeRecoveryStatus}
        </p>
      </div>
    </div>

    <p className="mt-3 text-sm leading-7 text-gray-300">
      {report.realtimeInsight}
    </p>
  </div>
)}

                          {report.hasUploadedImage && (
                            <div className="mt-4 rounded-2xl border border-[#FC4C02]/30 bg-[#FC4C02]/10 p-4">
                              <p className="font-black text-[#FC4C02]">Visual Tracker Attached</p>
                              <p className="mt-2 text-sm text-gray-300">
                                {report.visualAnalysis}
                              </p>
                              <p className="mt-2 text-xs text-gray-400">
                                File: {report.uploadedImageName || "Uploaded tracker image"}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
      )}
    </section>
  )}

        {page === "publicTracker" && (
          <section className="rounded-[40px] bg-[#08090B] px-6 py-12 text-white shadow-2xl">
            <div className="mb-10 text-center">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-[#FC4C02]">Public Smart Report</p>
              <h2 className="text-3xl xl:text-4xl font-black">Report Umum Tracker</h2>
              <p className="mx-auto mt-4 max-w-3xl text-gray-400">
                Tools umum untuk membuat analisis BMI, hidrasi, jogging, kalori, makro, dan PDF report personal berdasarkan data yang diisi pengguna.
              </p>
              <p className="mx-auto mt-3 max-w-3xl text-xs leading-relaxed text-gray-500">
                Data tersimpan di browser pengguna melalui localStorage. Untuk keamanan server-level, login sungguhan, dan pengiriman PDF otomatis sebagai attachment, gunakan backend seperti Supabase/Firebase + Netlify Functions.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
                <h3 className="mb-6 text-2xl font-black text-[#FC4C02]">Data Pengguna</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-bold text-gray-300">Nama Lengkap</span>
                    <input value={publicForm.fullName} onChange={(e) => updatePublicForm("fullName", e.target.value)} className="w-full rounded-2xl bg-white/10 px-4 py-3 font-bold outline-none" placeholder="Nama lengkap" />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-bold text-gray-300">Email</span>
                    <input type="email" value={publicForm.email} onChange={(e) => updatePublicForm("email", e.target.value)} className="w-full rounded-2xl bg-white/10 px-4 py-3 font-bold outline-none" placeholder="email@example.com" />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-bold text-gray-300">Password Laporan</span>
                    <input type="password" value={publicForm.accessPassword} onChange={(e) => updatePublicForm("accessPassword", e.target.value)} className="w-full rounded-2xl bg-white/10 px-4 py-3 font-bold outline-none" placeholder="Contoh: faris sehat 2026" />
                    <p className="text-xs leading-relaxed text-gray-500">
                      *Ini bukan password email pribadi. Buat password laporan yang mudah kamu ingat, tetapi tidak mudah ditebak orang lain.
                    </p>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-bold text-gray-300">Tanggal Lahir</span>
                    <input type="date" value={publicForm.birthDate} onChange={(e) => updatePublicForm("birthDate", e.target.value)} className="w-full rounded-2xl bg-white/10 px-4 py-3 font-bold outline-none" />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-bold text-gray-300">Gender</span>
                    <select value={publicForm.gender} onChange={(e) => updatePublicForm("gender", e.target.value)} className="w-full rounded-2xl bg-white/10 px-4 py-3 font-bold outline-none">
                      <option value="male" className="text-black">Male</option>
                      <option value="female" className="text-black">Female</option>
                    </select>
                  </label>
                </div>

                <div className="mt-8 space-y-7">
                  <RangeControl label="Tinggi Badan" value={publicForm.height} min={130} max={210} step={1} unit=" cm" onChange={(v) => updatePublicForm("height", v)} />
                  <RangeControl label="Berat Badan" value={publicForm.weight} min={35} max={140} step={1} unit=" kg" onChange={(v) => updatePublicForm("weight", v)} />
                  <RangeControl label="Air yang diminum" value={publicForm.water} min={0} max={5} step={0.1} unit=" L" onChange={(v) => updatePublicForm("water", v)} />
                  <RangeControl label="Jarak jogging" value={publicForm.distance} min={0} max={10} step={0.1} unit=" km" onChange={(v) => updatePublicForm("distance", v)} />
                  <RangeControl label="Kecepatan jogging" value={publicForm.speed} min={4} max={14} step={0.5} unit=" km/jam" onChange={(v) => updatePublicForm("speed", v)} />
                  <RangeControl label="Kalori makan utama" value={publicForm.mealCalories} min={800} max={3500} step={50} unit=" kkal" onChange={(v) => updatePublicForm("mealCalories", v)} />
                  <RangeControl label="Kalori snack" value={publicForm.snackCalories} min={0} max={1200} step={50} unit=" kkal" onChange={(v) => updatePublicForm("snackCalories", v)} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-6 text-2xl font-black text-[#FC4C02]">Realtime Analysis</h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Stat value={publicAge || "-"} label="Umur" dark />
                    <Stat value={publicBMI || "-"} label={`BMI ${publicBMIStatus}`} dark />
                    <Stat value={`${publicWaterTarget} L`} label="Target Air" dark />
                    <Stat value={`${publicScore}%`} label="Health Score" dark />
                  </div>

                  <div className="mt-6 space-y-4">
                    <Bar value={publicHydrationScore} label={`Hidrasi ${publicForm.water}L / ${publicWaterTarget}L`} color="bg-cyan-400" />
                    <Bar value={publicActivityScore} label={`Jogging ${publicForm.distance} km`} color="bg-green-400" />
                    <Bar value={publicCalorieScore} label={`Kalori ${publicGrossCalories} kkal`} color="bg-orange-300" />
                    <Bar value={publicBMIScore} label={`BMI ${publicBMIStatus}`} color="bg-purple-400" />
                  </div>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-4 text-2xl font-black">AI Style Report</h3>
                  <p className="leading-relaxed text-gray-200">{generatePublicAnalysis()}</p>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div><p className="text-sm text-gray-400">Karbo</p><p className="text-2xl font-black text-[#FC4C02]">{publicCarbGram}g</p></div>
                    <div><p className="text-sm text-gray-400">Protein</p><p className="text-2xl font-black text-[#FC4C02]">{publicProteinGram}g</p></div>
                    <div><p className="text-sm text-gray-400">Lemak</p><p className="text-2xl font-black text-[#FC4C02]">{publicFatGram}g</p></div>
                  </div>
                  <div
  onDrop={handleTrackerDrop}
  onDragOver={handleTrackerDragOver}
  onDragLeave={handleTrackerDragLeave}
  className={`mt-8 rounded-[28px] border-2 border-dashed p-6 text-center transition ${
    dragActive ? "border-[#FC4C02] bg-[#FC4C02]/10" : "border-white/20 bg-white/5"
  }`}
>
  <p className="text-lg font-black text-[#FC4C02]">
    Public Tracker Photo Detector
  </p>

  <p className="mt-2 text-sm text-gray-300">
    Upload screenshot tracker publik untuk membantu AI membaca aktivitas jogging dan visual report.
  </p>
  <p className="mx-auto mt-3 max-w-2xl text-xs leading-6 text-gray-400">
    {TRACKER_UPLOAD_GUIDE}
  </p>

  <div className="mt-6 overflow-hidden rounded-[24px] border border-white/10 bg-black/20 p-4">
    <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-[#FC4C02]">
      Contoh Foto Strava
    </p>

    <img
      src="/Contoh Foto Strava.jpeg"
      alt="Contoh Foto Strava"
      className="max-h-[260px] w-full rounded-[18px] bg-white object-contain"
    />
  </div>

  <label className="mt-5 inline-block cursor-pointer rounded-2xl bg-white px-5 py-3 font-black text-black hover:bg-gray-200">
    Upload Public Tracker
    <input
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp"
      className="hidden"
      onChange={(event) => handleTrackerImageUpload(event.target.files?.[0], "public")}
    />
  </label>

  {publicUploadedTrackerPreview && (
    <div className="mt-6 overflow-hidden rounded-[24px] border border-white/10 bg-black/20 p-3">
      <img
        src={publicUploadedTrackerPreview}
        alt="Uploaded tracker preview"
        className="max-h-[420px] w-full rounded-[18px] object-contain"
      />
<div className="mt-5 flex flex-wrap gap-3">
  <div
    className={`rounded-2xl px-4 py-2 text-sm font-black ${
      publicOcrStatus === "processing"
        ? "bg-yellow-500/20 text-yellow-300"
        : publicOcrStatus === "completed"
        ? "bg-green-500/20 text-green-300"
        : "bg-white/10 text-white"
    }`}
  >
    {publicOcrStatus === "processing"
      ? "Public AI Scanning..."
      : publicOcrStatus === "completed"
      ? "Public Tracker Analyzed"
      : "Waiting OCR"}
  </div>

  <div className="rounded-2xl bg-[#FC4C02]/10 px-4 py-2 text-sm font-black text-[#FC4C02]">
    Public Smart Detection Enabled
  </div>

  {publicDetectedTrackerData && (
    <div
      className={`rounded-2xl px-4 py-2 text-sm font-black ${
        publicDetectedTrackerData.confidence >= 85
          ? "bg-green-500/10 text-green-300"
          : publicDetectedTrackerData.confidence >= 55
          ? "bg-yellow-500/10 text-yellow-300"
          : publicDetectedTrackerData.confidence >= 30
          ? "bg-orange-500/10 text-orange-300"
          : "bg-red-500/10 text-red-300"
      }`}
    >
      AI Confidence {publicDetectedTrackerData.confidence}% • {publicDetectedTrackerData.analysisStatus || "PROCESSING"}
    </div>
  )}
</div>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:gap-5">
        <TrackerMetricCard value={getTrackerDisplayValue("distance", publicStravaDistance.toFixed(2), "--", publicDetectedTrackerData)} unit="km" label="Distance" uncertain={!trackerFieldIsTrusted("distance", publicDetectedTrackerData)} />
        <TrackerMetricCard value={getTrackerDisplayValue("pace", `${publicStravaPaceMin}:${String(publicStravaPaceSec).padStart(2, "0")}`, "--", publicDetectedTrackerData)} unit="/km" label="Pace" uncertain={!trackerFieldIsTrusted("pace", publicDetectedTrackerData)} />
        <TrackerMetricCard value={getTrackerDisplayValue("movingTime", publicStravaMovingTime, "--", publicDetectedTrackerData)} label="Moving Time" uncertain={!trackerFieldIsTrusted("movingTime", publicDetectedTrackerData)} />
        <TrackerMetricCard value={getTrackerDisplayValue("calories", publicStravaEstimatedCalories, "--", publicDetectedTrackerData)} label="Calories" uncertain={!trackerFieldIsTrusted("calories", publicDetectedTrackerData)} />
      </div>
    </div>
  )}
</div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button onClick={savePublicReport} className="rounded-2xl bg-[#FC4C02] px-5 py-3 font-black text-white hover:bg-[#ff6b2c]">Save Public Report</button>
                    <button onClick={downloadPublicPDF} className="rounded-2xl bg-white px-5 py-3 font-black text-black hover:bg-gray-200">Download PDF Analysis</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6">
              <h3 className="mb-5 text-2xl font-black">Public Report History</h3>
              <p className="mb-5 text-sm leading-relaxed text-gray-400">
                Masukkan email dan password laporan untuk melihat report yang tersimpan di browser ini. Ini membantu menjaga privasi saat perangkat digunakan bersama.
              </p>
              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <input type="email" value={publicLookupEmail} onChange={(e) => setPublicLookupEmail(e.target.value)} className="rounded-2xl bg-white/10 px-4 py-3 font-bold outline-none" placeholder="Email report" />
                <input type="password" value={publicLookupPassword} onChange={(e) => setPublicLookupPassword(e.target.value)} className="rounded-2xl bg-white/10 px-4 py-3 font-bold outline-none" placeholder="Password laporan" />
              </div>

              {visiblePublicReports.length === 0 ? (
                <div className="rounded-[28px] bg-white/10 p-6 text-gray-300">Belum ada report yang cocok dengan email dan password laporan tersebut.</div>
              ) : (
                <div className="space-y-4">
                  {visiblePublicReports.map((report) => (
                    <div key={report.id} className="rounded-[28px] bg-white/10 p-6">
                      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h4 className="text-2xl font-black text-[#FC4C02]">{report.fullName}</h4>
                          <p className="text-gray-300">{report.email} • {report.date} • {report.time}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => createPublicReportPDF(report)} className="rounded-xl bg-white/10 px-4 py-2 font-black hover:bg-white/20">PDF</button>
                          <button onClick={() => deletePublicReport(report.id)} className="rounded-xl bg-red-500/20 px-4 py-2 font-black text-red-200 hover:bg-red-500/30">Delete</button>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-5">
                        <div><p className="text-sm text-gray-400">BMI</p><p className="font-black">{report.bmi}</p></div>
                        <div><p className="text-sm text-gray-400">Hidrasi</p><p className="font-black">{report.water} L</p></div>
                        <div><p className="text-sm text-gray-400">Jogging</p><p className="font-black">{report.distance} km</p></div>
                        <div><p className="text-sm text-gray-400">Kalori</p><p className="font-black">{report.grossCalories}</p></div>
                        <div><p className="text-sm text-gray-400">Score</p><p className="font-black text-[#FC4C02]">{report.score}%</p></div>
                      </div>

                      <p className="mt-3 leading-relaxed text-gray-300">{report.analysis}</p>
                      {report.hasUploadedImage && (
                        <div className="mt-4 rounded-2xl border border-[#FC4C02]/30 bg-[#FC4C02]/10 p-4">
                          <p className="font-black text-[#FC4C02]">Public Visual Tracker Attached</p>
                          <p className="mt-2 text-sm text-gray-300">{report.visualAnalysis}</p>
                          <p className="mt-2 text-xs text-gray-400">
                            File: {report.uploadedImageName || "Uploaded tracker image"}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 gap-2 rounded-full border border-black/5 bg-white/90 p-2 shadow-2xl backdrop-blur-2xl lg:hidden">
        {pages.map((item) => (
          <button key={item.id} onClick={() => setPage(item.id)} className={`h-11 w-11 rounded-full text-lg transition ${page === item.id ? "bg-[#FC4C02] text-white" : "bg-gray-100"}`}>
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  )
}
