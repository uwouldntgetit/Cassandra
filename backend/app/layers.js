import { Router } from 'express'
import Reading from './models/reading.js'
import { getLiveTrafficGeoJSON, trafficStats } from './roads.js'

const router = Router()

// --- Cache in-memory per il meteo (TTL 15 minuti) ---
let _weatherCache     = null
let _weatherCacheTime = 0
const WEATHER_CACHE_MS = 15 * 60 * 1000

function wmoToType(code) {
  if (code === 0)          return 'sun'
  if (code <= 3)           return 'cloud'
  if (code >= 51)          return 'rain'
  return 'cloud'
}

async function fetchLiveWeather() {
  const now = Date.now()
  if (_weatherCache && (now - _weatherCacheTime) < WEATHER_CACHE_MS) {
    return _weatherCache
  }

  const [weatherRes, aqiRes] = await Promise.all([
    fetch(
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=46.0679&longitude=11.1211' +
      '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code' +
      '&hourly=temperature_2m' +
      '&forecast_days=1&timezone=Europe%2FRome'
    ),
    fetch(
      'https://air-quality-api.open-meteo.com/v1/air-quality' +
      '?latitude=46.0679&longitude=11.1211' +
      '&current=european_aqi&timezone=Europe%2FRome'
    ).catch(() => null)
  ])

  if (!weatherRes.ok) throw new Error(`Open-Meteo HTTP ${weatherRes.status}`)

  const weatherData = await weatherRes.json()
  const aqiData     = aqiRes?.ok ? await aqiRes.json() : null

  const current     = weatherData.current
  const hourly      = weatherData.hourly
  const currentHour = new Date().getHours()

  // Ultimi 6 campioni orari di temperatura
  const indices     = Array.from({ length: 6 }, (_, i) => Math.max(0, currentHour - 5 + i))
  const trend       = indices.map(h => Math.round(hourly.temperature_2m[h] ?? current.temperature_2m))
  const trendLabels = indices.map(h => `${String(h).padStart(2, '0')}:00`)

  const aqi      = Math.round(aqiData?.current?.european_aqi ?? 0)
  const status   = aqi < 50 ? 'Good' : aqi < 100 ? 'Moderate' : 'Poor'
  const type     = wmoToType(current.weather_code)
  const temp     = Math.round(current.temperature_2m)
  const hillyType = type === 'sun' ? 'cloud' : type   // collina più umida: sole→nuvola

  _weatherCache = {
    aqi,
    status,
    temperature: temp,
    humidity:    current.relative_humidity_2m,
    windSpeed:   Math.round(current.wind_speed_10m),
    trend,
    trendLabels,
    markers: [
      { lat: 46.0673, lon: 11.1212, type,      temp: `${temp}°`     },  // Centro
      { lat: 46.0950, lon: 11.1200, type,      temp: `${temp + 1}°` },  // Gardolo/Nord (valle, +1°)
      { lat: 46.0450, lon: 11.1250, type,      temp: `${temp}°`     },  // Ravina/Sud
      { lat: 46.0580, lon: 11.1480, type: hillyType, temp: `${temp - 2}°` },  // Povo/Collina (quota, -2°)
      { lat: 46.0720, lon: 11.1050, type,      temp: `${temp - 1}°` },  // Oltrefersina/Ovest
    ]
  }
  _weatherCacheTime = now
  return _weatherCache
}

// GET /api/v1/layers/weather
router.get('/weather', async (req, res) => {
  try {
    const data = await fetchLiveWeather()
    res.json(data)
  } catch (err) {
    // Open-Meteo non raggiungibile → fallback al seed nel DB
    console.warn('Open-Meteo unavailable, falling back to DB:', err.message)
    const reading = await Reading.findOne({ type: 'weather' }).exec()
    if (!reading) return res.status(404).json({ success: false, message: 'No weather data available.' })
    res.json(reading.data)
  }
})

// GET /api/v1/layers/traffic
router.get('/traffic', async (req, res) => {
  try {
    const segments = await getLiveTrafficGeoJSON()
    const stats    = trafficStats(segments)
    const hour     = new Date().getHours()

    // Trend orario: pattern realistico per le ultime 6 ore
    const HOURLY = [5,5,5,5,5,8,15,30,75,90,70,50,45,55,65,70,90,95,80,55,40,30,20,10]
    const indices    = Array.from({ length: 6 }, (_, i) => Math.max(0, hour - 5 + i))
    const trend      = indices.map(h => HOURLY[h] ?? 10)
    const trendLabels = indices.map(h => `${String(h).padStart(2,'0')}:00`)

    res.json({
      delay:    stats.delay,
      status:   stats.congestionLevel === 'high' ? 'Heavy' : stats.congestionLevel === 'moderate' ? 'Moderate' : 'Light',
      avgSpeed: stats.avgSpeed,
      incidents: Math.round(stats.delay / 10),
      trend,
      trendLabels,
      segments
    })
  } catch (err) {
    console.warn('Overpass unavailable, falling back to DB:', err.message)
    const reading = await Reading.findOne({ type: 'traffic' }).exec()
    if (!reading) return res.status(404).json({ success: false, message: 'No traffic data available.' })
    res.json(reading.data)
  }
})

// GET /api/v1/layers/crowd
router.get('/crowd', async (req, res) => {
  const reading = await Reading.findOne({ type: 'crowd' }).exec()
  if (!reading) return res.status(404).json({ success: false, message: 'No crowd data available.' })
  res.json(reading.data)
})

// GET /api/v1/layers/lighting
router.get('/lighting', async (req, res) => {
  const reading = await Reading.findOne({ type: 'lighting' }).exec()
  if (!reading) return res.status(404).json({ success: false, message: 'No lighting data available.' })
  res.json(reading.data)
})

export default router
