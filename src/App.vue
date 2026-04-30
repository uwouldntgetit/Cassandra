<script setup lang="ts">
// 1. Aggiungiamo 'watch' all'importazione di Vue
import { ref, onMounted, watch } from 'vue'
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'

import { useLayerStore } from './stores/layerStore'
const layerStore = useLayerStore()

import TopBar from './components/TopBar.vue'
import SideMenu from './components/SideMenu.vue'
import LoginModal from './components/LoginModal.vue'
import SignupModal from './components/SignupModal.vue'
import SettingsModal from './components/SettingsModal.vue'
import AboutModal from './components/AboutModal.vue'
import DataPanel from './components/DataPanel.vue'

const isDark = ref(true)

const showLoginModal = ref(false)
const showSignupModal = ref(false)
const showSettingsModal = ref(false)
const showAboutModal = ref(false)

const openLogin = () => { showSignupModal.value = false; showLoginModal.value = true }
const openSignup = () => { showLoginModal.value = false; showSignupModal.value = true }

// --- MAPPA E DATI ---
const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: L.Map | null = null
let tileLayer: L.TileLayer | null = null

// Variabili per tenere in memoria i disegni sulla mappa e poterli cancellare
let trafficLayer: L.GeoJSON | null = null
let weatherLayerGroup: L.LayerGroup | null = null

const lightMapUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const darkMapUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark')
  if (tileLayer) tileLayer.setUrl(isDark.value ? darkMapUrl : lightMapUrl)
}

const handleMapFly = (lat: number, lon: number) => {
  if (mapInstance) mapInstance.flyTo([lat, lon], 15, { animate: true, duration: 2.0 })
}

// ==========================================
// 🔴 DATI FINTI E WATCHERS (LA MAGIA)
// ==========================================

// GeoJSON Finto per il Traffico (Coordinate [Longitudine, Latitudine]!)
const mockTrafficData = {
  "type": "FeatureCollection",
  "features": [
    // Via Torre Vanga (Traffico Alto - Rosso)
    { "type": "Feature", "properties": { "congestion": "high" }, "geometry": { "type": "LineString", "coordinates": [[11.1189, 46.0715], [11.1185, 46.0685]] } },
    // Via S. Croce (Traffico Medio - Arancione)
    { "type": "Feature", "properties": { "congestion": "medium" }, "geometry": { "type": "LineString", "coordinates": [[11.1215, 46.0675], [11.1265, 46.0675]] } },
    // Via Venezia (Traffico Basso - Verde)
    { "type": "Feature", "properties": { "congestion": "low" }, "geometry": { "type": "LineString", "coordinates": [[11.1245, 46.0705], [11.1285, 46.0725]] } }
  ]
}

// Array Finto per il Meteo
const mockWeatherData = [
  { lat: 46.0679, lon: 11.1211, type: 'cloud', temp: '18°' }, // Centro (Nuvoloso)
  { lat: 46.0850, lon: 11.1150, type: 'sun', temp: '21°' },   // Trento Nord (Sole)
  { lat: 46.0350, lon: 11.0450, type: 'rain', temp: '14°' }   // Monte Bondone (Pioggia)
]

// 🚗 OSSERVATORE TRAFFICO
watch(() => layerStore.activeLayers.traffic, (isActive) => {
  if (!mapInstance) return
  if (isActive) {
    // Disegna le linee
    trafficLayer = L.geoJSON(mockTrafficData as any, {
      style: (feature) => {
        let color = '#22c55e' // Verde di default
        if (feature?.properties.congestion === 'high') color = '#ef4444' // Rosso
        if (feature?.properties.congestion === 'medium') color = '#f97316' // Arancione
        return { color, weight: 6, opacity: 0.8 } // Spessore 6 pixel!
      }
    }).addTo(mapInstance)
  } else {
    // Cancella le linee
    if (trafficLayer) mapInstance.removeLayer(trafficLayer)
  }
})

// 🌤️ OSSERVATORE METEO
watch(() => layerStore.activeLayers.weather, (isActive) => {
  if (!mapInstance) return
  if (isActive) {
    weatherLayerGroup = L.layerGroup().addTo(mapInstance) // Crea un gruppo per i marker
    
    mockWeatherData.forEach(w => {
      // Scegliamo l'emoji in base al tipo
      const emoji = w.type === 'sun' ? '☀️' : w.type === 'rain' ? '🌧️' : '☁️'
      
      // Creiamo l'HTML dell'icona (Stile Glassmorphism)
      const iconHtml = `
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg rounded-2xl p-1.5 flex items-center justify-center gap-1.5 border border-cyan-500/30 w-16 h-8">
          <span class="text-sm">${emoji}</span>
          <span class="font-bold text-slate-800 dark:text-white text-xs">${w.temp}</span>
        </div>`

      // Diciamo a Leaflet di usare il nostro HTML invece della puntina blu
      const customIcon = L.divIcon({
        html: iconHtml,
        className: '', // Serve per togliere lo sfondo bianco di default di Leaflet
        iconSize: [64, 32],
        iconAnchor: [32, 16] // Centra l'icona esattamente sulle coordinate
      })

      L.marker([w.lat, w.lon], { icon: customIcon }).addTo(weatherLayerGroup!)
    })
  } else {
    // Cancella le icone
    if (weatherLayerGroup) mapInstance.removeLayer(weatherLayerGroup)
  }
})

// ==========================================

onMounted(() => {
  document.documentElement.setAttribute('data-theme', 'dark')
  document.documentElement.classList.add('dark')
  if (mapContainer.value) {
    const trentoBounds = L.latLngBounds([45.90, 11.00], [46.20, 11.30])
    mapInstance = L.map(mapContainer.value, { 
      zoomControl: false,
      maxBounds: trentoBounds,
      maxBoundsViscosity: 1.0,
      minZoom: 12
    }).setView([46.0679, 11.1211], 14)
    tileLayer = L.tileLayer(darkMapUrl, { maxZoom: 19 }).addTo(mapInstance)
  }
})
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden font-sans">
    
    <div ref="mapContainer" class="absolute inset-0 z-0"></div>

    <TopBar @fly-to="handleMapFly" />
    <DataPanel />
    <SideMenu :isDark="isDark" @toggle-theme="toggleTheme" @open-login="openLogin" @open-settings="showSettingsModal = true" @open-about="showAboutModal = true" />
    
    <LoginModal :isOpen="showLoginModal" @close="showLoginModal = false" @switch-to-signup="openSignup" />
    <SignupModal :isOpen="showSignupModal" @close="showSignupModal = false" @switch-to-login="openLogin" />
    <SettingsModal :isOpen="showSettingsModal" @close="showSettingsModal = false" />
    <AboutModal :isOpen="showAboutModal" @close="showAboutModal = false" />

  </div>
</template>

<style>
/* Nascondiamo i controlli di default di Leaflet (es. lo zoom in alto a sinistra) */
.leaflet-control-container { display: none; }

/* Forziamo il cursore classico su tutta la mappa e durante il trascinamento */
.leaflet-container, 
.leaflet-interactive, 
.leaflet-grab, 
.leaflet-dragging { 
  cursor: default !important; 
}
</style>