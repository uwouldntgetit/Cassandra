<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import 'leaflet.heat'
import { LocateFixed } from 'lucide-vue-next'
import { useLayerStore, TIME_SLOTS, CROWD_TIME_MULT, TRAFFIC_TIME_CONG } from '../stores/layerStore'

const props = defineProps<{ isDark: boolean }>()
const layerStore = useLayerStore()

const mapContainer = ref<HTMLElement | null>(null)
const isTracking   = ref(false)

let mapInstance:       L.Map        | null = null
let tileLayer:         L.TileLayer  | null = null
let trafficLayer:      L.GeoJSON    | null = null
let weatherLayerGroup: L.LayerGroup | null = null
let crowdHeatLayer:    any                 = null
let lightingHeatLayer: any                 = null
let forecastHeatLayer: any                 = null
let userMarker:        L.Marker     | null = null
let userCircle:        L.Circle     | null = null
let watchId:           number       | null = null

const lightMapUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const darkMapUrl  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

watch(() => props.isDark, (isDark) => {
  if (tileLayer) tileLayer.setUrl(isDark ? darkMapUrl : lightMapUrl)
})

const flyTo = (lat: number, lon: number) => {
  if (mapInstance) mapInstance.flyTo([lat, lon], 15, { animate: true, duration: 2.0 })
}
defineExpose({ flyTo })

// --- Geolocalizzazione ---

const toggleGeolocation = () => { isTracking.value ? stopTracking() : startTracking() }

const placeUserMarker = (latitude: number, longitude: number, accuracy: number, label = 'Sei qui') => {
  const iconHtml = `
    <div style="width:18px;height:18px;background:#06b6d4;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(6,182,212,0.3),0 2px 8px rgba(0,0,0,0.3);animation:pulse-geo 2s infinite;"></div>
    <style>@keyframes pulse-geo{0%,100%{box-shadow:0 0 0 4px rgba(6,182,212,0.3),0 2px 8px rgba(0,0,0,0.3)}50%{box-shadow:0 0 0 8px rgba(6,182,212,0.1),0 2px 8px rgba(0,0,0,0.3)}}</style>`
  const icon = L.divIcon({ html: iconHtml, className: '', iconSize: [18, 18], iconAnchor: [9, 9] })

  if (userMarker) {
    userMarker.setLatLng([latitude, longitude])
    userCircle?.setLatLng([latitude, longitude]).setRadius(accuracy)
  } else {
    userMarker = L.marker([latitude, longitude], { icon, zIndexOffset: 1000 })
      .addTo(mapInstance!)
      .bindTooltip(label, { permanent: false, direction: 'top', offset: [0, -12] })
    userCircle = L.circle([latitude, longitude], {
      radius: accuracy, color: '#06b6d4', fillColor: '#06b6d4',
      fillOpacity: 0.08, weight: 1.5, dashArray: '4 4'
    }).addTo(mapInstance!)
  }
  mapInstance?.flyTo([latitude, longitude], 16, { animate: true, duration: 2.0 })
}

const fallbackToIpLocation = async () => {
  try {
    const res = await fetch('https://ip-api.com/json/')
    const data = await res.json()
    if (data.status === 'success') placeUserMarker(data.lat, data.lon, 2000, 'Posizione approssimativa (IP)')
    else { isTracking.value = false; alert('Impossibile determinare la posizione.') }
  } catch { isTracking.value = false; alert('Impossibile determinare la posizione.') }
}

const startTracking = () => {
  if (!navigator.geolocation) { isTracking.value = true; fallbackToIpLocation(); return }
  isTracking.value = true
  let firstFix = true
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords
      if (firstFix) { placeUserMarker(latitude, longitude, accuracy); firstFix = false }
      else { userMarker?.setLatLng([latitude, longitude]); userCircle?.setLatLng([latitude, longitude]).setRadius(accuracy) }
    },
    (err) => {
      if (err.code === 2 || err.code === 3) fallbackToIpLocation()
      else { isTracking.value = false; alert('Permesso di geolocalizzazione negato.') }
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 }
  )
}

const stopTracking = () => {
  if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null }
  if (userMarker) { mapInstance?.removeLayer(userMarker); userMarker = null }
  if (userCircle) { mapInstance?.removeLayer(userCircle); userCircle = null }
  isTracking.value = false
}

// --- Render functions (live o forecast in base a selectedForecastDay) ---

function renderTrafficVisualization() {
  if (!mapInstance) return
  if (trafficLayer) { mapInstance.removeLayer(trafficLayer); trafficLayer = null }
  if (!layerStore.activeLayers.traffic) return

  const day      = layerStore.selectedForecastDay
  const slot     = layerStore.selectedTimeSlot
  // Usa forecast quando disponibile (anche per oggi), altrimenti live
  const forecast = layerStore.forecastData?.[day]?.traffic
  const segments = forecast?.segments ?? layerStore.layerData.traffic?.segments
  if (!segments) return

  trafficLayer = L.geoJSON(segments as any, {
    style: (feature) => {
      let c: string
      if (forecast) {
        const hw = feature?.properties.highway ?? 'secondary'
        c = TRAFFIC_TIME_CONG[hw]?.[slot] ?? 'low'
      } else {
        c = feature?.properties.congestion ?? 'low'
      }
      const color = c === 'high' ? '#ef4444' : (c === 'medium' || c === 'moderate') ? '#f97316' : '#22c55e'
      return { color, weight: 6, opacity: 0.8 }
    },
    onEachFeature: (feature, layer) => {
      const hw   = feature?.properties.highway ?? 'secondary'
      const name = feature?.properties.name || hw.charAt(0).toUpperCase() + hw.slice(1) + ' road'
      const c    = forecast
        ? (TRAFFIC_TIME_CONG[hw]?.[slot] ?? 'low')
        : (feature?.properties.congestion ?? 'low')
      const dot   = c === 'high' ? '#ef4444' : c === 'medium' ? '#f97316' : '#22c55e'
      const label = c === 'high' ? 'High congestion' : c === 'medium' ? 'Moderate' : 'Light traffic'
      const speed = Math.round(15 + (c === 'high' ? 0 : c === 'medium' ? 0.4 : 1) * 30)
      layer.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:150px;padding:2px 4px">
          <p style="font-weight:700;font-size:13px;margin:0 0 2px">${name}</p>
          <p style="font-size:10px;color:#94a3b8;margin:0 0 8px;text-transform:capitalize">${hw} road</p>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="width:8px;height:8px;border-radius:50%;background:${dot};display:inline-block;flex-shrink:0"></span>
            <span style="font-size:12px;font-weight:600">${label}</span>
          </div>
          <p style="font-size:11px;color:#64748b;margin:0">~${speed} km/h avg speed</p>
        </div>`, { maxWidth: 220 })
    }
  }).addTo(mapInstance)
}

function renderWeatherVisualization() {
  if (!mapInstance) return
  if (weatherLayerGroup) { mapInstance.removeLayer(weatherLayerGroup); weatherLayerGroup = null }
  if (!layerStore.activeLayers.weather) return

  const day = layerStore.selectedForecastDay

  if (day === 0) {
    const data = layerStore.layerData.weather
    if (!data) return
    weatherLayerGroup = L.layerGroup().addTo(mapInstance)
    data.markers.forEach(w => {
      const emoji = w.type === 'sun' ? '☀️' : w.type === 'rain' ? '🌧️' : '☁️'
      const iconHtml = `<div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg rounded-2xl p-1.5 flex items-center justify-center gap-1.5 border border-cyan-500/30 w-16 h-8"><span class="text-sm">${emoji}</span><span class="font-bold text-slate-800 dark:text-white text-xs">${w.temp}</span></div>`
      L.marker([w.lat, w.lon], { icon: L.divIcon({ html: iconHtml, className: '', iconSize: [64, 32], iconAnchor: [32, 16] }) })
        .bindPopup(`
          <div style="font-family:system-ui,sans-serif;min-width:140px;padding:2px 4px">
            <p style="font-weight:700;font-size:16px;margin:0 0 6px">${emoji} ${w.temp}</p>
            <div style="display:grid;gap:3px;font-size:12px;color:#475569">
              <span>💧 ${data.humidity}% humidity</span>
              <span>💨 ${data.windSpeed} km/h wind</span>
              <span>🌫️ AQI ${data.aqi} — ${data.status}</span>
            </div>
          </div>`, { maxWidth: 200 })
        .addTo(weatherLayerGroup!)
    })
  } else {
    const forecast = layerStore.forecastData?.[day]?.weather
    if (!forecast) return
    weatherLayerGroup = L.layerGroup().addTo(mapInstance)

    const toEmoji = (icon: string) => icon === 'sun' ? '☀️' : icon === 'rain' ? '🌧️' : '☁️'
    const makeWeatherIcon = (icon: string, label: string) => {
      const html = `<div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg rounded-2xl p-1.5 flex items-center justify-center gap-1.5 border border-cyan-500/30 w-16 h-8"><span class="text-sm">${toEmoji(icon)}</span><span class="font-bold text-slate-800 dark:text-white text-xs">${label}</span></div>`
      return L.divIcon({ html, className: '', iconSize: [64, 32], iconAnchor: [32, 16] })
    }

    const t = forecast.tempMax
    const hillyIcon = forecast.precipProbability > 40 ? 'rain' : forecast.icon === 'sun' ? 'cloud' : forecast.icon

    const points = [
      { lat: 46.0673, lon: 11.1212, icon: forecast.icon, label: `${t}°`     },
      { lat: 46.0950, lon: 11.1200, icon: forecast.icon, label: `${t + 1}°` },
      { lat: 46.0450, lon: 11.1250, icon: forecast.icon, label: `${t}°`     },
      { lat: 46.0580, lon: 11.1480, icon: hillyIcon,     label: `${t - 2}°` },
      { lat: 46.0720, lon: 11.1050, icon: forecast.icon, label: `${t - 1}°` },
    ]

    points.forEach(p => {
      const emoji = toEmoji(p.icon)
      L.marker([p.lat, p.lon], { icon: makeWeatherIcon(p.icon, p.label) })
        .bindPopup(`
          <div style="font-family:system-ui,sans-serif;min-width:150px;padding:2px 4px">
            <p style="font-weight:700;font-size:14px;margin:0 0 2px">${emoji} ${forecast.description}</p>
            <p style="font-size:11px;color:#94a3b8;margin:0 0 7px">${p.label} (max)</p>
            <div style="display:grid;gap:3px;font-size:12px;color:#475569">
              <span>🌡️ ↑${forecast.tempMax}° / ↓${forecast.tempMin}°</span>
              <span>💧 ${forecast.precipProbability}% rain</span>
              <span>💨 ${forecast.windSpeed} km/h wind</span>
            </div>
          </div>`, { maxWidth: 210 })
        .addTo(weatherLayerGroup!)
    })
  }
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function renderCrowdVisualization() {
  if (!mapInstance) return
  if (crowdHeatLayer)   { mapInstance.removeLayer(crowdHeatLayer);   crowdHeatLayer   = null }
  if (forecastHeatLayer) { mapInstance.removeLayer(forecastHeatLayer); forecastHeatLayer = null }
  if (!layerStore.activeLayers.crowd) return

  const day          = layerStore.selectedForecastDay
  const slot         = layerStore.selectedTimeSlot
  const crowdForecast = layerStore.forecastData?.[day]?.crowd

  if (crowdForecast) {
    // Usa forecast (con moltiplicatori fascia oraria) per qualsiasi giorno, incluso oggi
    const points: [number, number, number][] = []
    crowdForecast.zones.forEach(zone => {
      const mult     = CROWD_TIME_MULT[zone.profile]?.[slot] ?? 1.0
      const adjInt   = Math.min(zone.intensity * mult, 1.0)
      if (adjInt < 0.02) return
      const hashBase = zone.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
      const numPoints = Math.ceil(adjInt * 18) + 4
      for (let p = 0; p < numPoints; p++) {
        const r1     = Math.max(seededRandom(hashBase + p * 2), 0.001)
        const r2     = seededRandom(hashBase + p * 2 + 1)
        const spread = 0.007
        const radius = spread * Math.sqrt(-2.0 * Math.log(r1))
        const angle  = 2.0 * Math.PI * r2
        points.push([zone.lat + radius * Math.cos(angle), zone.lon + radius * Math.sin(angle) * 1.5, adjInt])
      }
    })
    const gradient = { 0.2: '#3b0764', 0.5: '#7e22ce', 0.8: '#d946ef', 1.0: '#f0abfc' }
    forecastHeatLayer = (L as any).heatLayer(points, { radius: 22, blur: 18, maxZoom: 15, max: 1.0, gradient }).addTo(mapInstance)
    if (forecastHeatLayer._canvas) forecastHeatLayer._canvas.style.opacity = '0.55'
  } else if (day === 0) {
    // Fallback live se forecast non ancora caricato
    const data = layerStore.layerData.crowd
    if (!data) return
    crowdHeatLayer = (L as any).heatLayer(data.heatmapPoints, {
      radius: 20, blur: 15, maxZoom: 15, max: 1.0,
      gradient: { 0.2: '#3b0764', 0.5: '#7e22ce', 0.8: '#d946ef', 1.0: '#f0abfc' }
    }).addTo(mapInstance)
    if (crowdHeatLayer._canvas) crowdHeatLayer._canvas.style.opacity = '0.5'
  }
}

// --- Layer watchers ---

watch(() => layerStore.layerData.traffic,  renderTrafficVisualization)
watch(() => layerStore.layerData.weather,  renderWeatherVisualization)
watch(() => layerStore.layerData.crowd,    renderCrowdVisualization)

watch(() => layerStore.layerData.lighting, (data) => {
  if (!mapInstance) return
  if (lightingHeatLayer) { mapInstance.removeLayer(lightingHeatLayer); lightingHeatLayer = null }
  if (!data) return
  lightingHeatLayer = (L as any).heatLayer(data.heatmapPoints, {
    radius: 20, blur: 15, maxZoom: 15, max: 1.0,
    gradient: { 0.4: '#c2410c', 0.7: '#eab308', 1.0: '#ffffff' }
  }).addTo(mapInstance)
  if (lightingHeatLayer._canvas) lightingHeatLayer._canvas.style.opacity = '0.5'
})

// Cambia giorno → ri-renderizza tutti i layer attivi
watch(() => layerStore.selectedForecastDay, () => {
  if (layerStore.activeLayers.weather) renderWeatherVisualization()
  if (layerStore.activeLayers.traffic) renderTrafficVisualization()
  if (layerStore.activeLayers.crowd)   renderCrowdVisualization()
})

// Cambio fascia oraria → ri-renderizza sempre (anche su "Oggi")
watch(() => layerStore.selectedTimeSlot, () => {
  if (layerStore.activeLayers.traffic) renderTrafficVisualization()
  if (layerStore.activeLayers.crowd)   renderCrowdVisualization()
})

// Forecast caricato → ri-renderizza tutto (il time slot ora funziona anche su "Oggi")
watch(() => layerStore.forecastData, () => {
  if (layerStore.activeLayers.weather) renderWeatherVisualization()
  if (layerStore.activeLayers.traffic) renderTrafficVisualization()
  if (layerStore.activeLayers.crowd)   renderCrowdVisualization()
})

// --- Date selector ---

const hasActiveLayers = computed(() => Object.values(layerStore.activeLayers).some(Boolean))

const futureDayLabels = computed(() => {
  const days = layerStore.forecastData
  if (!days || days.length < 2) return []
  return days.slice(1).map(d => {
    const parts = d.dayLabel.split(' ')
    return `${parts[0]} ${parts[1]}`
  })
})

onMounted(() => {
  if (mapContainer.value) {
    const trentoBounds = L.latLngBounds([45.90, 10.90], [46.20, 11.30])
    mapInstance = L.map(mapContainer.value, {
      zoomControl: false, maxBounds: trentoBounds,
      maxBoundsViscosity: 1.0, minZoom: 12
    }).setView([46.0679, 11.1211], 14)
    tileLayer = L.tileLayer(props.isDark ? darkMapUrl : lightMapUrl, { maxZoom: 19 }).addTo(mapInstance)
  }
})

onUnmounted(() => {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId)
})
</script>

<template>
  <div class="relative w-full h-full">
    <div ref="mapContainer" class="absolute inset-0"></div>

    <!-- Selettore data + fascia oraria -->
    <Transition name="fade-up">
      <div
        v-if="hasActiveLayers"
        class="absolute bottom-20 left-1/2 -translate-x-1/2 z-[500] flex flex-col items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200/60 dark:border-slate-700/60 rounded-xl px-2 py-1.5 shadow-xl"
      >
        <!-- Riga 1: giorni -->
        <div class="flex items-center gap-1">
          <button
            @click="layerStore.setSelectedForecastDay(0)"
            :class="[
              'px-2 py-1 text-[10px] font-bold rounded-lg transition-all',
              layerStore.selectedForecastDay === 0
                ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400'
            ]"
          >Today</button>

          <span v-if="layerStore.loadingForecast" class="text-[10px] text-slate-400 px-2">...</span>

          <template v-else>
            <button
              v-for="(label, idx) in futureDayLabels"
              :key="idx"
              @click="layerStore.setSelectedForecastDay(idx + 1)"
              :class="[
                'px-2 py-1 text-[10px] font-bold rounded-lg transition-all relative',
                layerStore.selectedForecastDay === idx + 1
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              ]"
            >
              {{ label }}
              <span v-if="layerStore.forecastData?.[idx + 1]?.isHoliday"
                class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              <span v-else-if="layerStore.forecastData?.[idx + 1]?.isWeekend"
                class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full" />
            </button>
          </template>
        </div>

        <!-- Riga 2: fasce orarie -->
        <Transition name="fade-up">
          <div
            v-if="layerStore.forecastData"
            class="flex items-center gap-1 w-full border-t border-slate-200/60 dark:border-slate-700/60 pt-1"
          >
            <button
              v-for="slot in TIME_SLOTS"
              :key="slot.id"
              @click="layerStore.setSelectedTimeSlot(slot.id)"
              :class="[
                'flex-1 flex items-center justify-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded-lg transition-all',
                layerStore.selectedTimeSlot === slot.id
                  ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400'
              ]"
            >
              <span>{{ slot.icon }}</span>
              <span class="hidden md:inline">{{ slot.label }}</span>
            </button>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Pulsante geolocalizzazione -->
    <button
      @click="toggleGeolocation"
      :title="isTracking ? 'Disattiva posizione' : 'Mostra la mia posizione'"
      :class="[
        'absolute bottom-8 right-4 z-[500] w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95',
        isTracking
          ? 'bg-cyan-500 text-white shadow-cyan-500/40'
          : 'bg-white/95 dark:bg-slate-900/95 text-slate-600 dark:text-slate-300 border border-cyan-500/30 hover:border-cyan-500/60'
      ]"
    >
      <LocateFixed class="w-5 h-5" :class="isTracking ? 'animate-pulse' : ''" />
    </button>
  </div>
</template>

<style>
.fade-up-enter-active, .fade-up-leave-active { transition: opacity 0.25s, transform 0.25s; }
.fade-up-enter-from, .fade-up-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }
.fade-up-enter-to,   .fade-up-leave-from { transform: translateX(-50%) translateY(0); }

.leaflet-control-container { display: none; }
.leaflet-container, .leaflet-interactive, .leaflet-grab, .leaflet-dragging { cursor: default !important; }
</style>
