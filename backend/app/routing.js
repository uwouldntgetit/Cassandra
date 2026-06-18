/**
 * Road route between two points.
 * Uses the public OSRM API (car profile), free and without an API key.
 * Returns the route's distance, duration and geometry.
 */
import { Router } from 'express'

const router = Router()

// Valid coordinate: finite number within geographic bounds
function isValidCoord(lat, lon) {
  return Number.isFinite(lat) && Number.isFinite(lon) &&
         lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
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
    `${fromLon},${fromLat};${toLon},${toLat}?geometries=geojson&overview=full`

  try {
    const osrmRes = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!osrmRes.ok) throw new Error(`OSRM HTTP ${osrmRes.status}`)

    const data = await osrmRes.json()
    if (data.code !== 'Ok' || !data.routes?.length)
      return res.status(404).json({ success: false, message: 'No route found between the given points.' })

    const route = data.routes[0]
    res.json({
      success:  true,
      distance: Math.round(route.distance),  // metri
      duration: Math.round(route.duration),  // secondi
      geometry: route.geometry                // GeoJSON LineString, coordinate [lon, lat]
    })
  } catch (err) {
    console.warn('OSRM routing unavailable:', err.message)
    res.status(503).json({ success: false, message: 'Routing service unavailable, try again later.' })
  }
})

export default router
