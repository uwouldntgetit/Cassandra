<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, Layers, Sun, Moon, Settings, Info, LogIn, Mail, Lock, X } from 'lucide-vue-next'
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'

const isDark = ref(true)
const mapContainer = ref<HTMLElement | null>(null)
let tileLayer: L.TileLayer | null = null

// Stato per il Modale di Login
const showLoginModal = ref(false)

// Stato per il menu a tendina dei Layer
const showLayersMenu = ref(false)
const selectedLayers = ref({
  weather: true,
  traffic: true,
  lighting: false,
})

const lightMapUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const darkMapUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

const toggleLayer = (layer: keyof typeof selectedLayers.value) => {
  selectedLayers.value[layer] = !selectedLayers.value[layer]
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  if (isDark.value) document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
  
  if (tileLayer) {
    tileLayer.setUrl(isDark.value ? darkMapUrl : lightMapUrl)
  }
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', 'dark')
  document.documentElement.classList.add('dark')

  if (mapContainer.value) {
    const map = L.map(mapContainer.value, {
      zoomControl: false 
    }).setView([46.0679, 11.1211], 14)

    tileLayer = L.tileLayer(darkMapUrl, {
      maxZoom: 19,
      attribution: '© OpenStreetMap, © CartoDB'
    }).addTo(map)
  }
})
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden font-sans">
    
    <div ref="mapContainer" class="absolute inset-0 z-0"></div>

    <div class="absolute inset-0 z-10 pointer-events-none flex flex-col">
      
      <div class="p-4 md:p-6 pointer-events-auto">
        <div class="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
          <div class="flex-1 relative group">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search class="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <input
              type="text"
              placeholder="Search locations in Trento..."
              class="w-full pl-10 pr-4 py-2.5 text-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 dark:border-cyan-400/30 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div class="relative">
            <button @click="showLayersMenu = !showLayersMenu" class="w-full sm:w-auto flex items-center gap-2 px-5 py-2.5 text-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 dark:border-cyan-400/30 rounded-xl shadow-lg hover:border-cyan-500/50 transition-all text-slate-900 dark:text-slate-100">
              <Layers class="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Layers</span>
            </button>

            <div v-if="showLayersMenu" class="absolute top-full mt-2 right-0 w-56 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl rounded-xl shadow-xl border border-cyan-500/20 dark:border-cyan-400/20 overflow-hidden z-50">
              <div class="p-1.5 flex flex-col gap-1">
                <button @click="toggleLayer('weather')" class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-cyan-50 dark:hover:bg-slate-800 transition-all text-slate-900 dark:text-slate-100">
                  <div class="flex items-center gap-2.5">
                    <div :class="['w-2 h-2 rounded-full bg-sky-500', selectedLayers.weather ? 'opacity-100' : 'opacity-30']"></div>
                    <span class="text-xs">Weather</span>
                  </div>
                  <div :class="['w-8 h-4 rounded-full transition-all flex items-center px-1', selectedLayers.weather ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700']">
                    <div :class="['w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all transform', selectedLayers.weather ? 'translate-x-3.5' : 'translate-x-0']"></div>
                  </div>
                </button>
                <button @click="toggleLayer('traffic')" class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-cyan-50 dark:hover:bg-slate-800 transition-all text-slate-900 dark:text-slate-100">
                  <div class="flex items-center gap-2.5">
                    <div :class="['w-2 h-2 rounded-full bg-orange-500', selectedLayers.traffic ? 'opacity-100' : 'opacity-30']"></div>
                    <span class="text-xs">Traffic Flow</span>
                  </div>
                  <div :class="['w-8 h-4 rounded-full transition-all flex items-center px-1', selectedLayers.traffic ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700']">
                    <div :class="['w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all transform', selectedLayers.traffic ? 'translate-x-3.5' : 'translate-x-0']"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-6 right-4 md:top-6 md:right-6 md:bottom-auto flex flex-col gap-2.5 pointer-events-auto">
        <button @click="showLoginModal = true" class="w-11 h-11 mb-3 flex items-center justify-center bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-cyan-500/30 transition-all">
          <LogIn class="w-5 h-5" />
        </button>
        <button @click="toggleTheme" class="w-11 h-11 flex items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 dark:border-cyan-400/30 rounded-xl shadow-lg hover:border-cyan-500/50 transition-all text-cyan-600 dark:text-cyan-400">
          <Sun v-if="isDark" class="w-5 h-5" />
          <Moon v-else class="w-5 h-5" />
        </button>
        <button class="w-11 h-11 flex items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 dark:border-cyan-400/30 rounded-xl shadow-lg hover:border-cyan-500/50 transition-all text-cyan-600 dark:text-cyan-400">
          <Settings class="w-5 h-5" />
        </button>
        <button class="w-11 h-11 flex items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 dark:border-cyan-400/30 rounded-xl shadow-lg hover:border-cyan-500/50 transition-all text-cyan-600 dark:text-cyan-400">
          <Info class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div v-if="showLoginModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div @click="showLoginModal = false" class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"></div>
      
      <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-cyan-500/20 overflow-hidden transform transition-all">
        
        <div class="bg-gradient-to-r from-cyan-500 to-teal-500 p-6 text-center relative">
          <button @click="showLoginModal = false" class="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
            <X class="w-5 h-5" />
          </button>
          <h2 class="text-2xl font-bold text-white">Welcome Back</h2>
          <p class="text-cyan-50/80 text-sm mt-1">Sign in to access Trento Smart City</p>
        </div>

        <div class="p-8 space-y-5">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Email Address</label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
              <input 
                type="email" 
                placeholder="your.email@example.com" 
                class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="flex justify-between items-center px-1">
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400">Password</label>
              <a href="#" class="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline">Forgot password?</a>
            </div>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
              <input 
                type="password" 
                placeholder="Enter your password" 
                class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm"
              />
            </div>
          </div>

          <button class="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-2">
            Sign In
          </button>

          <p class="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
            Don't have an account? <a href="#" class="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </div>

    <div v-if="showLayersMenu" @click="showLayersMenu = false" class="absolute inset-0 z-0"></div>
  </div>
</template>

<style>
.leaflet-control-container {
  display: none;
}
</style>