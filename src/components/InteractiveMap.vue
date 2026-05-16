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
import 'leaflet.heat'
import { useLayerStore } from '../stores/layerStore'

const props = defineProps<{ isDark: boolean }>()
const layerStore = useLayerStore()

const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: L.Map | null = null
let tileLayer: L.TileLayer | null = null

// Map layer instances for cleanup
let trafficLayer: L.GeoJSON | null = null
let weatherLayerGroup: L.LayerGroup | null = null
let crowdHeatLayer: any = null
let lightingHeatLayer: any = null

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

// Helper to generate organic clusters of points for a realistic heatmap
const generateCluster = (centerLat: number, centerLon: number, count: number, spread: number = 0.005) => {
  const points: [number, number, number][] = []
  for (let i = 0; i < count; i++) {
    // Gaussian-like random distribution
    const r1 = Math.random()
    const r2 = Math.random()
    const radius = spread * Math.sqrt(-2.0 * Math.log(r1))
    const angle = 2.0 * Math.PI * r2
    
    const latOffset = radius * Math.cos(angle)
    const lonOffset = radius * Math.sin(angle) * 1.5 // Adjust for longitude distortion
    
    // Intensity falls off the further we are from the center
    const dist = Math.sqrt(latOffset*latOffset + (lonOffset/1.5)*(lonOffset/1.5))
    const intensity = Math.max(0.1, 1.0 - (dist / spread))
    
    points.push([centerLat + latOffset, centerLon + lonOffset, intensity])
  }
  return points
}

// Mock array data for Crowd Density layer (Coordinates: [Lat, Lon, Intensity])
const mockCrowdData: [number, number, number][] = [
  ...generateCluster(46.0685, 11.1205, 80, 0.002), // Duomo / Centro storico
  ...generateCluster(46.0699, 11.1245, 50, 0.0015), // Piazza Fiera
  ...generateCluster(46.0715, 11.1189, 60, 0.002), // Stazione
  ...generateCluster(46.0665, 11.1165, 30, 0.001),  // MUSE area
  ...generateCluster(46.0650, 11.1220, 25, 0.0015)   // Parco di Gocciadoro
]

// Mock array data for Smart Lighting layer (Coordinates: [Lat, Lon, Intensity])
const mockLightingData: [number, number, number][] = [
  ...generateCluster(46.0685, 11.1205, 100, 0.0025), // Centro
  ...generateCluster(46.0715, 11.1189, 60, 0.002), // Stazione
  ...generateCluster(46.0665, 11.1165, 40, 0.0015), // MUSE
  ...generateCluster(46.0750, 11.1150, 50, 0.0025)  // Trento Nord
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
    crowdHeatLayer = (L as any).heatLayer(mockCrowdData, {
      radius: 20,
      blur: 15,
      maxZoom: 15,
      max: 1.0,
      gradient: {
        0.2: '#3b0764',  // Purple-950 (Quasi nero, si fonde col buio)
        0.5: '#7e22ce',  // Purple-700 (Viola intenso e saturo)
        0.8: '#d946ef',  // Fuchsia-500 (Viola neon brillante)
        1.0: '#f0abfc'   // Fuchsia-300 (Lilla acceso/neon, non bianco puro)
      }
    }).addTo(mapInstance)
    
    // Forziamo l'opacità massima del canvas per non coprire mai la mappa
    if (crowdHeatLayer._canvas) {
      crowdHeatLayer._canvas.style.opacity = '0.5'
    }
  } else {
    if (crowdHeatLayer) mapInstance.removeLayer(crowdHeatLayer)
  }
})

// Smart Lighting Layer Watcher
watch(() => layerStore.activeLayers.lighting, (isActive) => {
  if (!mapInstance) return
  if (isActive) {
    lightingHeatLayer = (L as any).heatLayer(mockLightingData, {
      radius: 20,
      blur: 15,
      maxZoom: 15,
      max: 1.0,
      gradient: {
        0.4: '#c2410c',  // Orange-700
        0.7: '#eab308',  // Yellow-500
        1.0: '#ffffff'   // White
      }
    }).addTo(mapInstance)
    
    // Forziamo l'opacità massima del canvas
    if (lightingHeatLayer._canvas) {
      lightingHeatLayer._canvas.style.opacity = '0.5'
    }
  } else {
    if (lightingHeatLayer) mapInstance.removeLayer(lightingHeatLayer)
  }
})

onMounted(() => {
  if (mapContainer.value) {
    const trentoBounds = L.latLngBounds([45.90, 10.90], [46.20, 11.30]) // Esteso il margine Ovest (sinistra) a 10.90
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

/* Hidden default cursor and map controls retained */
</style>
