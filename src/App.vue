<script setup lang="ts">
import { ref, onMounted } from 'vue'
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'

// 1. Importiamo tutti i componenti
import TopBar from './components/TopBar.vue'
import SideMenu from './components/SideMenu.vue'
import LoginModal from './components/LoginModal.vue'
import SignupModal from './components/SignupModal.vue'
import SettingsModal from './components/SettingsModal.vue'
import AboutModal from './components/AboutModal.vue'

// 2. Stati globali
const isDark = ref(true)

const showLoginModal = ref(false)
const showSignupModal = ref(false)
const showSettingsModal = ref(false)
const showAboutModal = ref(false)

// 3. Funzioni per la navigazione tra modali
const openLogin = () => {
  showSignupModal.value = false
  showLoginModal.value = true
}

const openSignup = () => {
  showLoginModal.value = false
  showSignupModal.value = true
}

// 4. Configurazione Mappa
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
  <div class="relative w-full h-screen overflow-hidden font-sans">
    
    <div ref="mapContainer" class="absolute inset-0 z-0"></div>

    <TopBar />
    
    <SideMenu 
      :isDark="isDark" 
      @toggle-theme="toggleTheme" 
      @open-login="openLogin" 
      @open-settings="showSettingsModal = true"
      @open-about="showAboutModal = true"
    />
    
    <LoginModal 
      :isOpen="showLoginModal" 
      @close="showLoginModal = false" 
      @switch-to-signup="openSignup" 
    />
    
    <SignupModal 
      :isOpen="showSignupModal" 
      @close="showSignupModal = false" 
      @switch-to-login="openLogin" 
    />

    <SettingsModal 
      :isOpen="showSettingsModal" 
      @close="showSettingsModal = false" 
    />

    <AboutModal 
      :isOpen="showAboutModal" 
      @close="showAboutModal = false" 
     />

  </div>
</template>

<style>
.leaflet-control-container { display: none; }
</style>