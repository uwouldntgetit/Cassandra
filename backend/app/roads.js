/**
 * Road network for Trento traffic visualization.
 * Primary source: Overpass API (OpenStreetMap) — full road network.
 * Fallback:       OSRM public routing API — geometries for key roads.
 * Both are free and require no API keys.
 * Road geometries are cached in-memory for 24h.
 */

let _roadsCache     = null
let _roadsCacheTime = 0
const ROADS_CACHE_MS = 24 * 60 * 60 * 1000

// Tratte principali di Trento: [nome, tipo_strada, [lon1,lat1], [lon2,lat2]]
// OSRM seguirà la strada reale tra questi due punti
const TRENTO_KEY_ROADS = [
  { name: 'Via Brennero (SS12)',   highway: 'trunk',     from: [11.1165, 46.1020], to: [11.1195, 46.0630] },
  { name: 'Viale Verona',          highway: 'primary',   from: [11.1420, 46.0780], to: [11.1310, 46.0390] },
  { name: 'Via Roma',              highway: 'primary',   from: [11.1185, 46.0740], to: [11.1255, 46.0590] },
  { name: 'Via Manci',             highway: 'secondary', from: [11.1150, 46.0730], to: [11.1210, 46.0670] },
  { name: 'Corso Tre Novembre',    highway: 'secondary', from: [11.1205, 46.0670], to: [11.1300, 46.0640] },
  { name: 'Via Galilei',           highway: 'secondary', from: [11.1250, 46.0640], to: [11.1390, 46.0645] },
  { name: 'Viale Trento-Rovereto', highway: 'trunk',     from: [11.1190, 46.0625], to: [11.1170, 46.0430] },
  { name: 'Via Nazionale dell\'Abetone', highway: 'primary', from: [11.1190, 46.0940], to: [11.1220, 46.1080] },
  { name: 'Via Adige',             highway: 'secondary', from: [11.1100, 46.0700], to: [11.1140, 46.0560] },
  { name: 'Via Longa',             highway: 'secondary', from: [11.1380, 46.0720], to: [11.1490, 46.0660] },
]

async function fetchViaOSRM() {
  const results = await Promise.allSettled(
    TRENTO_KEY_ROADS.map(async road => {
      const url = `https://router.project-osrm.org/route/v1/driving/` +
        `${road.from[0]},${road.from[1]};${road.to[0]},${road.to[1]}` +
        `?geometries=geojson&overview=full`
      const res  = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) throw new Error(`OSRM ${res.status}`)
      const data = await res.json()
      if (data.code !== 'Ok') throw new Error('OSRM no route')
      return {
        name:        road.name,
        highway:     road.highway,
        coordinates: data.routes[0].geometry.coordinates
      }
    })
  )

  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
}

async function fetchViaOverpass() {
  const query = `[out:json][timeout:25];
(way["highway"~"^(trunk|primary|secondary)$"](45.98,11.08,46.15,11.20););out geom;`

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent':   'Cassandra/1.0 (student project; contact tmartini.2005@gmail.com)',
      'Accept':       'application/json'
    },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(25000)
  })
  if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`)

  const data = await res.json()
  return data.elements
    .filter(el => el.type === 'way' && el.geometry?.length >= 2)
    .map(el => ({
      name:        el.tags?.name ?? '',
      highway:     el.tags?.highway ?? 'secondary',
      coordinates: el.geometry.map(pt => [pt.lon, pt.lat])
    }))
}

async function fetchRoads() {
  const now = Date.now()
  if (_roadsCache && (now - _roadsCacheTime) < ROADS_CACHE_MS) return _roadsCache

  let roads
  try {
    roads = await fetchViaOverpass()
    console.log(`Road network loaded from Overpass: ${roads.length} segments`)
  } catch (overpassErr) {
    console.warn('Overpass unavailable, trying OSRM:', overpassErr.message)
    roads = await fetchViaOSRM()
    console.log(`Road network loaded from OSRM: ${roads.length} routes`)
  }

  // Un risultato vuoto non va messo in cache: meglio il fallback su DB del chiamante
  if (!roads.length) throw new Error('No road data from Overpass or OSRM')

  _roadsCache     = roads
  _roadsCacheTime = now
  return roads
}

// Congestion per tipo di strada e condizione del giorno
function assignCongestion(highway, dayType, isPeak) {
  if (dayType === 'holiday')  return 'low'
  if (dayType === 'weekend')  return highway === 'trunk' ? 'medium' : 'low'
  if (highway === 'trunk')    return isPeak ? 'high'   : 'medium'
  if (highway === 'primary')  return isPeak ? 'medium' : 'low'
  return 'low'
}

function buildGeoJSON(roads, dayType, isPeak) {
  return {
    type: 'FeatureCollection',
    features: roads.map(road => ({
      type: 'Feature',
      properties: {
        name:       road.name,
        highway:    road.highway,
        congestion: assignCongestion(road.highway, dayType, isPeak)
      },
      geometry: { type: 'LineString', coordinates: road.coordinates }
    }))
  }
}

export async function getLiveTrafficGeoJSON() {
  const roads   = await fetchRoads()
  const hour    = new Date().getHours()
  const dow     = new Date().getDay()
  const dayType = (dow === 0 || dow === 6) ? 'weekend' : 'weekday'
  const isPeak  = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)
  return buildGeoJSON(roads, dayType, isPeak)
}

export async function getForecastTrafficGeoJSON(date, isItalianHoliday) {
  const roads   = await fetchRoads()
  const dow     = date.getDay()
  const dayType = isItalianHoliday(date) ? 'holiday' : (dow === 0 || dow === 6) ? 'weekend' : 'weekday'
  return buildGeoJSON(roads, dayType, false)
}

export function trafficStats(geojson) {
  const features = geojson.features
  if (!features?.length) return { congestionLevel: 'low', avgSpeed: 40, delay: 5 }
  const counts = { high: 0, medium: 0, low: 0 }
  features.forEach(f => { counts[f.properties.congestion]++ })
  const ratio = (counts.high * 2 + counts.medium) / (features.length * 2)
  return {
    congestionLevel: ratio > 0.5 ? 'high' : ratio > 0.2 ? 'moderate' : 'low',
    avgSpeed:        Math.round(15 + (1 - ratio) * 30),
    delay:           Math.round(ratio * 45)
  }
}
