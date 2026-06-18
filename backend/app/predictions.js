import express from 'express'
import CrowdHistory from './models/crowdHistory.js'
import { TRENTO_ZONES, PROFILE_MULTIPLIERS } from './zones.js'
import { getForecastTrafficGeoJSON, trafficStats } from './roads.js'

const router = express.Router()

const FIXED_HOLIDAYS = [[1,1],[1,6],[4,25],[5,1],[6,2],[8,15],[11,1],[12,8],[12,25],[12,26]]
function isItalianHoliday(date) {
  const m = date.getMonth() + 1, d = date.getDate()
  return FIXED_HOLIDAYS.some(([hm, hd]) => hm === m && hd === d)
}
function isSummer(date) { const m = date.getMonth() + 1; return m >= 6 && m <= 8 }

function wmoToIcon(code) {
  if (code === 0)              return { icon: 'sun',   description: 'Sereno' }
  if (code <= 3)               return { icon: 'cloud', description: 'Parz. nuvoloso' }
  if (code <= 48)              return { icon: 'cloud', description: 'Nuvoloso' }
  if (code <= 67)              return { icon: 'rain',  description: 'Pioggia' }
  if (code <= 77)              return { icon: 'rain',  description: 'Neve' }
  if (code <= 82)              return { icon: 'rain',  description: 'Rovesci' }
  return                              { icon: 'rain',  description: 'Temporale' }
}

async function fetchWeatherForecast(days) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=46.0679&longitude=11.1211` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,weather_code` +
    `&forecast_days=${days}&timezone=Europe%2FRome`
  const res = await fetch(url)
  return (await res.json()).daily
}


// GET /api/v1/predictions?days=7
router.get('/', async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days) || 7, 1), 14)

    const [history, weatherDaily] = await Promise.all([
      CrowdHistory.find({}).sort({ date: -1 }).lean(),
      fetchWeatherForecast(days).catch(() => null),
      // Pre-warm the roads cache (result ignored, but the cache gets populated)
      getForecastTrafficGeoJSON(new Date(), isItalianHoliday).catch(() => null)
    ])

    const forecast = []

    for (let i = 0; i < days; i++) {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + i)
      targetDate.setHours(0, 0, 0, 0)

      const dayOfWeek = targetDate.getDay()
      const isHoliday = isItalianHoliday(targetDate)
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const summer    = isSummer(targetDate)

      // --- Weather (Open-Meteo, or synthetic fallback) ---
      let weather
      if (weatherDaily) {
        const code = weatherDaily.weather_code[i]
        weather = {
          tempMax:           Math.round(weatherDaily.temperature_2m_max[i]),
          tempMin:           Math.round(weatherDaily.temperature_2m_min[i]),
          precipProbability: weatherDaily.precipitation_probability_max[i] ?? 0,
          windSpeed:         Math.round(weatherDaily.wind_speed_10m_max[i]),
          ...wmoToIcon(code)
        }
      } else {
        // Synthetic fallback with realistic day-to-day variation
        const base = summer ? 23 : 15
        const seed = targetDate.getDate() + targetDate.getMonth() * 31
        const sin1 = Math.sin(seed * 0.7) * 3
        const sin2 = Math.sin(seed * 1.3) * 2
        const precip = Math.max(0, Math.round(30 + Math.sin(seed * 0.5) * 25))
        const icon = precip > 50 ? 'rain' : precip > 25 ? 'cloud' : 'sun'
        const desc = precip > 50 ? 'Pioggia' : precip > 25 ? 'Parz. nuvoloso' : 'Sereno'
        weather = {
          tempMax: Math.round(base + 4 + sin1),
          tempMin: Math.round(base - 4 + sin2),
          precipProbability: precip,
          windSpeed: Math.round(10 + Math.abs(Math.sin(seed * 0.9)) * 15),
          icon, description: desc
        }
      }

      // --- Traffic (real roads from Overpass, pattern-based congestion) ---
      const trafficSegments = await getForecastTrafficGeoJSON(targetDate, isItalianHoliday).catch(() => null)
      const tStats = trafficSegments ? trafficStats(trafficSegments) : { congestionLevel: 'low', avgSpeed: 40, delay: 5 }
      const traffic = { ...tStats, segments: trafficSegments ?? { type: 'FeatureCollection', features: [] } }

      // --- Crowd (weighted average of history + multipliers) ---
      const zones = []
      for (const zone of TRENTO_ZONES) {
        const profile      = PROFILE_MULTIPLIERS[zone.profile]
        const sameDayHist  = history.filter(h => h.zone === zone.id && h.dayOfWeek === dayOfWeek)
        let baseAvg = zone.baseDensity
        if (sameDayHist.length > 0) {
          let wSum = 0, dSum = 0
          sameDayHist.forEach((h, idx) => { const w = 1 / (idx + 1); dSum += h.density * w; wSum += w })
          baseAvg = dSum / wSum
        }
        let predicted = baseAvg * (isWeekend ? profile.weekend : profile.weekday)
        if (summer)   predicted *= profile.summer
        if (isHoliday) predicted *= profile.holiday

        const zoneHist = history.filter(h => h.zone === zone.id)
        if (zoneHist.length >= 10) {
          const r = zoneHist.slice(0, 7).reduce((s, h) => s + h.density, 0) / 7
          const o = zoneHist.slice(7, 14).reduce((s, h) => s + h.density, 0) / 7
          if (o > 0) predicted *= Math.max(0.85, Math.min(1.15, r / o))
        }

        predicted = Math.round(Math.max(50, predicted))
        zones.push({
          id: zone.id, name: zone.name, lat: zone.lat, lon: zone.lon,
          profile: zone.profile,
          predictedDensity: predicted,
          intensity: Math.min(predicted / 5000, 1.0),
          level: predicted > 3000 ? 'high' : predicted > 1500 ? 'medium' : 'low'
        })
      }

      forecast.push({
        date:       targetDate.toISOString().split('T')[0],
        dayLabel:   targetDate.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }),
        isHoliday,
        isWeekend,
        weather,
        traffic,
        crowd: {
          totalDensity: zones.reduce((s, z) => s + z.predictedDensity, 0),
          peakZone:     zones.reduce((m, z) => z.predictedDensity > m.predictedDensity ? z : m).name,
          zones
        }
      })
    }

    res.json(forecast)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
