import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import User from './app/models/user.js'
import Sensor from './app/models/sensor.js'
import Reading from './app/models/reading.js'
import SystemEvent from './app/models/systemEvent.js'
import CrowdHistory from './app/models/crowdHistory.js'
import { TRENTO_ZONES, PROFILE_MULTIPLIERS } from './app/zones.js'

const FIXED_HOLIDAYS = [[1,1],[1,6],[4,25],[5,1],[6,2],[8,15],[11,1],[12,8],[12,25],[12,26]]
function isItalianHoliday(date) {
  const m = date.getMonth() + 1, d = date.getDate()
  return FIXED_HOLIDAYS.some(([hm, hd]) => hm === m && hd === d)
}
function isSummer(date) { const m = date.getMonth() + 1; return m >= 6 && m <= 8 }

function gaussianNoise(mean, stdFraction = 0.15) {
  const u1 = Math.max(Math.random(), 0.001)
  const u2 = Math.random()
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
  return Math.round(Math.max(50, mean + mean * stdFraction * z))
}

function syntheticDensity(zone, date) {
  const profile = PROFILE_MULTIPLIERS[zone.profile]
  const isWeekend = [0, 6].includes(date.getDay())
  const summer = isSummer(date)
  const holiday = isItalianHoliday(date)
  let d = zone.baseDensity
  d *= isWeekend ? profile.weekend : profile.weekday
  if (summer) d *= profile.summer
  if (holiday) d *= profile.holiday
  return gaussianNoise(d)
}

// Genera un cluster di punti con distribuzione gaussiana (come il frontend)
function generateCluster(centerLat, centerLon, count, spread = 0.005) {
  const points = []
  for (let i = 0; i < count; i++) {
    const r1 = Math.random()
    const r2 = Math.random()
    const radius = spread * Math.sqrt(-2.0 * Math.log(r1))
    const angle = 2.0 * Math.PI * r2
    const latOffset = radius * Math.cos(angle)
    const lonOffset = radius * Math.sin(angle) * 1.5
    const dist = Math.sqrt(latOffset * latOffset + (lonOffset / 1.5) * (lonOffset / 1.5))
    const intensity = Math.max(0.1, 1.0 - (dist / spread))
    points.push([centerLat + latOffset, centerLon + lonOffset, intensity])
  }
  return points
}

async function seed() {
  // Il seed cancella tutte le collezioni del DB puntato da DB_URL:
  // richiede --force e le password dei due account demo via env
  if (!process.argv.includes('--force')) {
    console.error('ATTENZIONE: il seed cancella TUTTI i dati del DB puntato da DB_URL.')
    console.error('Per procedere: npm run seed -- --force')
    process.exit(1)
  }
  if (!process.env.SEED_ADMIN_PASSWORD || !process.env.SEED_USER_PASSWORD) {
    console.error('Imposta SEED_ADMIN_PASSWORD e SEED_USER_PASSWORD nel file .env')
    process.exit(1)
  }

  await mongoose.connect(process.env.DB_URL)
  console.log('Connected to MongoDB Atlas')

  // Pulizia collezioni
  await Promise.all([
    User.deleteMany(),
    Sensor.deleteMany(),
    Reading.deleteMany(),
    SystemEvent.deleteMany(),
    CrowdHistory.deleteMany()
  ])
  console.log('Collections cleared')

  // --- UTENTI ---
  const adminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10)
  const userPassword = await bcrypt.hash(process.env.SEED_USER_PASSWORD, 10)

  await User.insertMany([
    { name: 'Admin Cassandra', email: 'admin@cassandra.it', password: adminPassword, role: 'admin' },
    { name: 'Mario Rossi', email: 'mario@example.com', password: userPassword, role: 'user' }
  ])
  console.log('Users created')

  // --- SENSORI ---
  await Sensor.insertMany([
    { name: 'Weather Station Centro', type: 'weather', location: 'Piazza Duomo', status: 'online' },
    { name: 'Weather Station Nord', type: 'weather', location: 'Trento Nord', status: 'online' },
    { name: 'Weather Station Sud', type: 'weather', location: 'Trento Sud', status: 'online' },
    { name: 'Traffic Sensor T-01', type: 'traffic', location: 'Via Brennero', status: 'online' },
    { name: 'Traffic Sensor T-02', type: 'traffic', location: 'Via Roma', status: 'online' },
    { name: 'Traffic Sensor T-03', type: 'traffic', location: 'Viale Verona', status: 'online' },
    { name: 'Traffic Sensor T-04', type: 'traffic', location: 'Via Manci', status: 'offline' },
    { name: 'Crowd Sensor C-01', type: 'crowd', location: 'Piazza Duomo', status: 'online' },
    { name: 'Crowd Sensor C-02', type: 'crowd', location: 'Piazza Fiera', status: 'online' },
    { name: 'Crowd Sensor C-03', type: 'crowd', location: 'Stazione FS', status: 'online' },
    { name: 'Lighting Sector 1', type: 'lighting', location: 'Centro Storico', status: 'online' },
    { name: 'Lighting Sector 2', type: 'lighting', location: 'Stazione', status: 'online' },
    { name: 'Lighting Sector 3', type: 'lighting', location: 'MUSE', status: 'online' },
    { name: 'Lighting Sector 4', type: 'lighting', location: 'Trento Nord', status: 'online' },
    { name: 'Weather API Node', type: 'weather', location: 'Server', status: 'warning' }
  ])
  console.log('Sensors created')

  // --- LETTURE LAYER ---

  // Weather
  await Reading.create({
    type: 'weather',
    data: {
      aqi: 42,
      status: 'Good',
      temperature: 22,
      humidity: 45,
      windSpeed: 12,
      trend: [25, 28, 32, 45, 38, 42],
      trendLabels: ['10', '11', '12', '13', '14', '15'],
      markers: [
        { lat: 46.0679, lon: 11.1211, type: 'cloud', temp: '18°' },
        { lat: 46.0850, lon: 11.1150, type: 'sun', temp: '21°' },
        { lat: 46.0350, lon: 11.0450, type: 'rain', temp: '14°' }
      ]
    }
  })

  // Traffic
  await Reading.create({
    type: 'traffic',
    data: {
      delay: 24,
      status: 'Moderate',
      avgSpeed: 28,
      incidents: 3,
      trend: [10, 15, 45, 80, 55, 30],
      trendLabels: ['10', '11', '12', '13', '14', '15'],
      segments: {
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', properties: { congestion: 'high' }, geometry: { type: 'LineString', coordinates: [[11.1189, 46.0715], [11.1185, 46.0685]] } },
          { type: 'Feature', properties: { congestion: 'medium' }, geometry: { type: 'LineString', coordinates: [[11.1215, 46.0675], [11.1265, 46.0675]] } },
          { type: 'Feature', properties: { congestion: 'low' }, geometry: { type: 'LineString', coordinates: [[11.1245, 46.0705], [11.1285, 46.0725]] } }
        ]
      }
    }
  })

  // Crowd
  const crowdPoints = [
    ...generateCluster(46.0685, 11.1205, 80, 0.002),
    ...generateCluster(46.0699, 11.1245, 50, 0.0015),
    ...generateCluster(46.0715, 11.1189, 60, 0.002),
    ...generateCluster(46.0665, 11.1165, 30, 0.001),
    ...generateCluster(46.0650, 11.1220, 25, 0.0015)
  ]
  await Reading.create({
    type: 'crowd',
    data: {
      density: 1200,
      status: 'High',
      hotspot: 'Piazza Duomo',
      trend: '+15%',
      trendData: [200, 350, 800, 1200, 950, 400],
      trendLabels: ['10', '11', '12', '13', '14', '15'],
      heatmapPoints: crowdPoints
    }
  })

  // Lighting
  const lightingPoints = [
    ...generateCluster(46.0685, 11.1205, 100, 0.0025),
    ...generateCluster(46.0715, 11.1189, 60, 0.002),
    ...generateCluster(46.0665, 11.1165, 40, 0.0015),
    ...generateCluster(46.0750, 11.1150, 50, 0.0025)
  ]
  await Reading.create({
    type: 'lighting',
    data: {
      coverage: 82,
      status: 'Active',
      energySaved: 324,
      trendData: [20, 60, 100, 100, 80, 60],
      trendLabels: ['18', '20', '22', '00', '02', '04'],
      heatmapPoints: lightingPoints
    }
  })
  console.log('Readings created')

  // --- SYSTEM EVENTS (con timestamp distribuiti) ---
  const now = new Date()
  const minsAgo = (m) => new Date(now - m * 60000)

  await SystemEvent.insertMany([
    // --- Notifiche pubbliche (visibili agli utenti) ---
    { type: 'warning', message: 'Affollamento elevato in Piazza Duomo (>2.8K p/km²)',   status: 'Investigating', public: true,  createdAt: minsAgo(18),  updatedAt: minsAgo(12) },
    { type: 'warning', message: 'Qualità aria AQI >80 — zona industriale Gardolo',      status: 'Unresolved',    public: true,  createdAt: minsAgo(45),  updatedAt: minsAgo(45) },
    { type: 'warning', message: 'Traffico intenso su Viale Verona — code >1.5km',       status: 'Investigating', public: true,  createdAt: minsAgo(130), updatedAt: minsAgo(95) },
    { type: 'warning', message: 'Allerta meteo: forti raffiche di vento previste',      status: 'Unresolved',    public: true,  createdAt: minsAgo(200), updatedAt: minsAgo(200) },
    { type: 'success', message: 'Traffico su Via Brennero tornato nella norma',         status: 'Resolved',      public: true,  createdAt: minsAgo(480), updatedAt: minsAgo(460) },
    { type: 'success', message: 'Qualità aria migliorata — AQI tornato sotto 50',       status: 'Resolved',      public: true,  createdAt: minsAgo(700), updatedAt: minsAgo(680) },
    // --- Notifiche tecniche (solo admin) ---
    { type: 'error',   message: 'Traffic Sensor T-04 offline — Via Brennero',           status: 'Unresolved',    public: false, createdAt: minsAgo(20),  updatedAt: minsAgo(20) },
    { type: 'error',   message: 'API Rate limit superato sul Weather Node',              status: 'Investigating', public: false, createdAt: minsAgo(210), updatedAt: minsAgo(100) },
    { type: 'success', message: 'Firmware aggiornato su Lighting Sector 4',             status: 'Resolved',      public: false, createdAt: minsAgo(320), updatedAt: minsAgo(310) },
    { type: 'success', message: 'Backup giornaliero completato con successo',            status: 'Resolved',      public: false, createdAt: minsAgo(480), updatedAt: minsAgo(480) },
    { type: 'success', message: 'Crowd Sensor C-02 ripristinato in Piazza Fiera',       status: 'Resolved',      public: false, createdAt: minsAgo(960), updatedAt: minsAgo(950) },
  ])
  console.log('System events created')

  // --- CROWD HISTORY (45 giorni di storico per zona) ---
  const historyDocs = []
  for (let daysAgo = 1; daysAgo <= 45; daysAgo++) {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    date.setHours(0, 0, 0, 0)
    for (const zone of TRENTO_ZONES) {
      historyDocs.push({
        zone: zone.id,
        zoneName: zone.name,
        zoneLat: zone.lat,
        zoneLon: zone.lon,
        density: syntheticDensity(zone, date),
        dayOfWeek: date.getDay(),
        isHoliday: isItalianHoliday(date),
        date
      })
    }
  }
  await CrowdHistory.insertMany(historyDocs)
  console.log(`Crowd history created: ${historyDocs.length} records (${TRENTO_ZONES.length} zone × 45 giorni)`)

  console.log('\nSeed completed!')
  console.log('Admin login: admin@cassandra.it (password: SEED_ADMIN_PASSWORD)')
  console.log('User login:  mario@example.com (password: SEED_USER_PASSWORD)')
  await mongoose.disconnect()
}

seed().catch(err => {
  console.error('Seed error:', err)
  process.exit(1)
})
