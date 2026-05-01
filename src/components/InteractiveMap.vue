<script setup lang="ts">
/**
 * InteractiveMap.vue
 * Encapsulates the Leaflet map instance, mock data, and map layers.
 * Listens to layerStore changes to render or remove data points dynamically.
 * 
 * Incapsula l'istanza della mappa Leaflet, i dati mock e i layer della mappa.
 * Ascolta le modifiche al layerStore per aggiungere o rimuovere i dati dinamicamente.
 */
import { ref, onMounted, watch } from 'vue'
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import { useLayerStore } from '../stores/layerStore'

const props = defineProps<{ isDark: boolean }>()
const layerStore = useLayerStore()

const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: L.Map | null = null
let tileLayer: L.TileLayer | null = null

// Map layer instances for cleanup
let trafficLayer: L.GeoJSON | null = null
let weatherLayerGroup: L.LayerGroup | null = null
let crowdLayerGroup: L.LayerGroup | null = null
let lightingLayerGroup: L.LayerGroup | null = null

const lightMapUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const darkMapUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

watch(() => props.isDark, (isDark) => {
  if (tileLayer) tileLayer.setUrl(isDark ? darkMapUrl : lightMapUrl)
})

const flyTo = (lat: number, lon: number) => {
  if (mapInstance) mapInstance.flyTo([lat, lon], 15, { animate: true, duration: 2.0 })
}
defineExpose({ flyTo })

// --- Mock Data & Layer Watchers ---

// Mock GeoJSON data for Traffic layer (Coordinates: [Longitude, Latitude])
const mockTrafficData = {
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "properties": { "congestion": "high" }, "geometry": { "type": "LineString", "coordinates": [[11.1189, 46.0715], [11.1185, 46.0685]] } },
    { "type": "Feature", "properties": { "congestion": "medium" }, "geometry": { "type": "LineString", "coordinates": [[11.1215, 46.0675], [11.1265, 46.0675]] } },
    { "type": "Feature", "properties": { "congestion": "low" }, "geometry": { "type": "LineString", "coordinates": [[11.1245, 46.0705], [11.1285, 46.0725]] } }
  ]
}

// Mock array data for Weather layer
const mockWeatherData = [
  { lat: 46.0679, lon: 11.1211, type: 'cloud', temp: '18°' },
  { lat: 46.0850, lon: 11.1150, type: 'sun', temp: '21°' },  
  { lat: 46.0350, lon: 11.0450, type: 'rain', temp: '14°' }  
]

// Mock array data for Crowd Density layer
const mockCrowdData = [
  { lat: 46.0685, lon: 11.1205, level: 'high' },
  { lat: 46.0699, lon: 11.1245, level: 'medium' },
  { lat: 46.0715, lon: 11.1189, level: 'high' }  
]

// Mock array data for Smart Lighting layer
const mockLightingData = [
  { lat: 46.0680, lon: 11.1215 },
  { lat: 46.0682, lon: 11.1218 },
  { lat: 46.0684, lon: 11.1221 },
  { lat: 46.0675, lon: 11.1200 },
  { lat: 46.0677, lon: 11.1203 }
]

// Traffic Layer Watcher
watch(() => layerStore.activeLayers.traffic, (isActive) => {
  if (!mapInstance) return
  if (isActive) {
    trafficLayer = L.geoJSON(mockTrafficData as any, {
      style: (feature) => {
        let color = '#22c55e'
        if (feature?.properties.congestion === 'high') color = '#ef4444'
        if (feature?.properties.congestion === 'medium') color = '#f97316'
        return { color, weight: 6, opacity: 0.8 }
      }
    }).addTo(mapInstance)
  } else {
    if (trafficLayer) mapInstance.removeLayer(trafficLayer)
  }
})

// Weather Layer Watcher
watch(() => layerStore.activeLayers.weather, (isActive) => {
  if (!mapInstance) return
  if (isActive) {
    weatherLayerGroup = L.layerGroup().addTo(mapInstance)
    
    mockWeatherData.forEach(w => {
      const emoji = w.type === 'sun' ? '☀️' : w.type === 'rain' ? '🌧️' : '☁️'
      const iconHtml = `
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg rounded-2xl p-1.5 flex items-center justify-center gap-1.5 border border-cyan-500/30 w-16 h-8">
          <span class="text-sm">${emoji}</span>
          <span class="font-bold text-slate-800 dark:text-white text-xs">${w.temp}</span>
        </div>`

      const customIcon = L.divIcon({
        html: iconHtml,
        className: '', 
        iconSize: [64, 32],
        iconAnchor: [32, 16] 
      })

      L.marker([w.lat, w.lon], { icon: customIcon }).addTo(weatherLayerGroup!)
    })
  } else {
    if (weatherLayerGroup) mapInstance.removeLayer(weatherLayerGroup)
  }
})

// Crowd Density Layer Watcher
watch(() => layerStore.activeLayers.crowd, (isActive) => {
  if (!mapInstance) return
  if (isActive) {
    crowdLayerGroup = L.layerGroup().addTo(mapInstance)
    
    mockCrowdData.forEach(c => {
      const iconHtml = `
        <div class="heartbeat-container">
          <div class="heartbeat-dot"></div>
          <div class="heartbeat-ring"></div>
        </div>`

      const customIcon = L.divIcon({
        html: iconHtml,
        className: '', 
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })

      L.marker([c.lat, c.lon], { icon: customIcon }).addTo(crowdLayerGroup!)
    })
  } else {
    if (crowdLayerGroup) mapInstance.removeLayer(crowdLayerGroup)
  }
})

// Smart Lighting Layer Watcher
watch(() => layerStore.activeLayers.lighting, (isActive) => {
  if (!mapInstance) return
  if (isActive) {
    lightingLayerGroup = L.layerGroup().addTo(mapInstance)
    
    mockLightingData.forEach(l => {
      const iconHtml = `<div class="lighting-dot"></div>`
      const customIcon = L.divIcon({
        html: iconHtml,
        className: '', 
        iconSize: [10, 10],
        iconAnchor: [5, 5]
      })

      L.marker([l.lat, l.lon], { icon: customIcon }).addTo(lightingLayerGroup!)
    })
  } else {
    if (lightingLayerGroup) mapInstance.removeLayer(lightingLayerGroup)
  }
})

onMounted(() => {
  if (mapContainer.value) {
    const trentoBounds = L.latLngBounds([45.90, 11.00], [46.20, 11.30])
    mapInstance = L.map(mapContainer.value, { 
      zoomControl: false,
      maxBounds: trentoBounds,
      maxBoundsViscosity: 1.0,
      minZoom: 12
    }).setView([46.0679, 11.1211], 14)
    tileLayer = L.tileLayer(props.isDark ? darkMapUrl : lightMapUrl, { maxZoom: 19 }).addTo(mapInstance)
  }
})
</script>

<template>
  <div ref="mapContainer"></div>
</template>

<style>
/* Hide default Leaflet controls */
.leaflet-control-container { display: none; }

/* Force default cursor on the entire map and during dragging */
.leaflet-container, 
.leaflet-interactive, 
.leaflet-grab, 
.leaflet-dragging { 
  cursor: default !important; 
}

/* --- Crowd Animation --- */
.heartbeat-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.heartbeat-dot {
  width: 12px;
  height: 12px;
  background-color: #a855f7; 
  border-radius: 50%;
  z-index: 2;
}
.heartbeat-ring {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: #a855f7;
  border-radius: 50%;
  z-index: 1;
  animation: pulse-purple 2s infinite ease-out;
}
@keyframes pulse-purple {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(3.5); opacity: 0; }
}

/* --- Lighting Style --- */
.lighting-dot {
  width: 10px;
  height: 10px;
  background-color: #fef08a; 
  border-radius: 50%;
  box-shadow: 0 0 8px 3px rgba(253, 224, 71, 0.6);
}
</style>
