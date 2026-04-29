<script setup lang="ts">
import { ref, onMounted } from 'vue'
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'

// Importiamo i nostri 3 componenti creati!
import TopBar from './components/TopBar.vue'
import SideMenu from './components/SideMenu.vue'
import LoginModal from './components/LoginModal.vue'

// Stati globali
const isDark = ref(true)
const showLoginModal = ref(false)

// Configurazione Mappa
const mapContainer = ref<HTMLElement | null>(null)
let tileLayer: L.TileLayer | null = null
const lightMapUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const darkMapUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark')
  if (tileLayer) tileLayer.setUrl(isDark.value ? darkMapUrl : lightMapUrl)
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', 'dark')
  document.documentElement.classList.add('dark')
  if (mapContainer.value) {
    const map = L.map(mapContainer.value, { zoomControl: false }).setView([46.0679, 11.1211], 14)
    tileLayer = L.tileLayer(darkMapUrl, { maxZoom: 19 }).addTo(map)
  }
})
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden font-sans pointer-events-none">
    
    <div ref="mapContainer" class="absolute inset-0 z-0"></div>

    <TopBar />
    
    <SideMenu 
      :isDark="isDark" 
      @toggle-theme="toggleTheme" 
      @open-login="showLoginModal = true" 
    />
    
    <LoginModal 
      :isOpen="showLoginModal" 
      @close="showLoginModal = false" 
    />

  </div>
</template>

<style>
.leaflet-control-container { display: none; }
</style>