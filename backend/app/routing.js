/**
 * Road route between two points (RF7).
 * Uses the public OSRM API (car profile), free and without an API key, asking
 * for alternative routes. To avoid overcrowding the same roads, the router
 * keeps a persistent count of how many times each route has been suggested and
 * returns the least-suggested alternative. If the counter store is unavailable
 * it degrades gracefully to OSRM's fastest route.
 * Returns the chosen route's distance, duration and geometry.
 */
import { Router } from 'express'
import mongoose from 'mongoose'
import RouteSuggestion from './models/routeSuggestion.js'

const router = Router()

// Valid coordinate: finite number within geographic bounds
function isValidCoord(lat, lon) {
  return Number.isFinite(lat) && Number.isFinite(lon) &&
         lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
}

// Stable fingerprint of a route's physical path: a handful of points sampled
// along the geometry, rounded so near-identical paths share a signature.
function routeSignature(coordinates) {
  const n = coordinates?.length ?? 0
  if (!n) return ''
  const step = Math.max(1, Math.floor(n / 6))
  const points = []
  for (let i = 0; i < n; i += step) {
    const [lon, lat] = coordinates[i]
    points.push(`${lat.toFixed(4)},${lon.toFixed(4)}`)
  }
  return points.join(';')
}

// Among OSRM's alternatives (ordered fastest-first) pick the one suggested the
// fewest times, then bump its counter. Ties keep OSRM's order, favoring speed.
async function pickLeastCrowded(routes) {
  if (mongoose.connection.readyState !== 1 || routes.length < 2)
    return routes[0]

  const signatures = routes.map(r => routeSignature(r.geometry.coordinates))
  const docs   = await RouteSuggestion.find({ signature: { $in: signatures } }).lean()
  const counts = Object.fromEntries(docs.map(d => [d.signature, d.count]))

  let bestIdx = 0
  for (let i = 1; i < routes.length; i++) {
    if ((counts[signatures[i]] ?? 0) < (counts[signatures[bestIdx]] ?? 0)) bestIdx = i
  }

  await RouteSuggestion.updateOne(
    { signature: signatures[bestIdx] },
    { $inc: { count: 1 }, $set: { lastSuggestedAt: new Date() } },
    { upsert: true }
  )
  return routes[bestIdx]
}

// GET /api/v1/routing?fromLat=&fromLon=&toLat=&toLon=
router.get('/', async (req, res) => {
  const fromLat = Number(req.query.fromLat)
  const fromLon = Number(req.query.fromLon)
  const toLat   = Number(req.query.toLat)
  const toLon   = Number(req.query.toLon)

  if (!isValidCoord(fromLat, fromLon) || !isValidCoord(toLat, toLon))
    return res.status(400).json({ success: false, message: 'Valid fromLat, fromLon, toLat and toLon are required.' })

  const url = `https://router.project-osrm.org/route/v1/driving/` +
    `${fromLon},${fromLat};${toLon},${toLat}?geometries=geojson&overview=full&alternatives=3`

  try {
    const osrmRes = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!osrmRes.ok) throw new Error(`OSRM HTTP ${osrmRes.status}`)

    const data = await osrmRes.json()
    if (data.code !== 'Ok' || !data.routes?.length)
      return res.status(404).json({ success: false, message: 'No route found between the given points.' })

    const route = await pickLeastCrowded(data.routes)
    res.json({
      success:      true,
      distance:     Math.round(route.distance),  // metri
      duration:     Math.round(route.duration),  // secondi
      geometry:     route.geometry,              // GeoJSON LineString, coordinate [lon, lat]
      alternatives: data.routes.length           // numero di percorsi tra cui si è scelto
    })
  } catch (err) {
    console.warn('OSRM routing unavailable:', err.message)
    res.status(503).json({ success: false, message: 'Routing service unavailable, try again later.' })
  }
})

export default router
