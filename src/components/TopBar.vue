<script setup lang="ts">
import { ref } from 'vue'
import { Search, Layers, Loader2, MapPin, AlertCircle } from 'lucide-vue-next'

// Riceve lo stato da App.vue
defineProps<{ activeLayers: { weather: boolean; traffic: boolean } }>()

const emit = defineEmits(['fly-to', 'toggle-layer'])

const showLayersMenu = ref(false)
const searchQuery = ref('')
const isSearching = ref(false)
const searchResults = ref<any[]>([])
const noResults = ref(false) 

const toggleLayer = (layer: string) => {
  emit('toggle-layer', layer)
}

const handleInput = () => {
  noResults.value = false
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  isSearching.value = true
  noResults.value = false
  searchResults.value = [] 
  
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value + ' Trento')}`
    const response = await fetch(url)
    const data = await response.json()
    if (data && data.length > 0) searchResults.value = data
    else noResults.value = true
  } catch (error) {
    console.error("Errore API:", error)
    noResults.value = true
  } finally {
    isSearching.value = false
  }
}

const selectLocation = (lat: string, lon: string, name: string) => {
  emit('fly-to', parseFloat(lat), parseFloat(lon))
  searchQuery.value = name.split(',')[0]
  searchResults.value = []
  noResults.value = false
}

const closeDropdowns = () => {
  showLayersMenu.value = false
  searchResults.value = []
  noResults.value = false
}
</script>

<template>
  <div class="absolute top-0 left-0 right-0 p-4 md:p-6 pointer-events-auto z-10">
    <div class="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
      
      <!-- Search Bar Container -->
      <div class="flex-1 relative group">
        <Loader2 v-if="isSearching" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500 animate-spin" />
        <Search v-else class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        
        <input 
          type="text" 
          v-model="searchQuery"
          @input="handleInput"
          @keyup.enter.prevent="handleSearch"
          placeholder="Cerca via o piazza a Trento..." 
          class="w-full pl-10 pr-4 py-2.5 text-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 dark:border-cyan-400/30 hover:border-cyan-500/60 dark:hover:border-cyan-400/60 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-slate-900 dark:text-slate-100" 
        />

        <!-- TENDINA RICERCA -->
        <div v-if="searchResults.length > 0 || noResults" class="absolute top-full mt-2 left-0 w-full bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl rounded-xl shadow-xl border border-cyan-500/20 z-50 overflow-hidden">
          
          <ul v-if="searchResults.length > 0" class="max-h-60 overflow-y-auto">
            <li v-for="res in searchResults" :key="res.place_id">
              <button @click="selectLocation(res.lat, res.lon, res.display_name)" class="w-full flex items-start gap-3 text-left px-4 py-3 hover:bg-cyan-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
                <MapPin class="w-4 h-4 mt-0.5 text-cyan-500 flex-shrink-0" />
                <div>
                  <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ res.display_name.split(',')[0] }}</p>
                  <p class="text-xs text-slate-500 line-clamp-1">{{ res.display_name }}</p>
                </div>
              </button>
            </li>
          </ul>

          <div v-else-if="noResults" class="px-4 py-6 text-center">
            <AlertCircle class="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p class="text-sm font-bold text-slate-900 dark:text-white">Nessun risultato trovato</p>
            <p class="text-xs text-slate-500 mt-1">Prova a verificare l'ortografia o usa termini più generici.</p>
          </div>

        </div>
      </div>

      <!-- Layers Dropdown -->
      <div class="relative">
        <button @click="showLayersMenu = !showLayersMenu" class="w-full sm:w-auto flex items-center gap-2 px-5 py-2.5 text-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 rounded-xl shadow-lg transition-all text-slate-900 dark:text-slate-100">
          <Layers class="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Layers</span>
        </button>
        
        <div v-if="showLayersMenu" class="absolute top-full mt-2 right-0 w-56 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl rounded-xl shadow-xl border border-cyan-500/20 z-50 p-1.5 flex flex-col gap-1">
          <!-- Bottone Meteo -->
          <button @click="toggleLayer('weather')" class="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-cyan-50 dark:hover:bg-slate-800 transition-all text-slate-900 dark:text-slate-100">
            <span class="flex items-center gap-2.5"><div :class="['w-2 h-2 rounded-full bg-sky-500', activeLayers.weather ? 'opacity-100' : 'opacity-30']"></div>Weather</span>
            <div :class="['w-8 h-4 rounded-full flex items-center px-1 transition-all', activeLayers.weather ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700']"><div :class="['w-2.5 h-2.5 bg-white rounded-full transition-all transform', activeLayers.weather ? 'translate-x-3.5' : 'translate-x-0']"></div></div>
          </button>
          
          <!-- Bottone Traffico -->
          <button @click="toggleLayer('traffic')" class="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-cyan-50 dark:hover:bg-slate-800 transition-all text-slate-900 dark:text-slate-100">
            <span class="flex items-center gap-2.5"><div :class="['w-2 h-2 rounded-full bg-orange-500', activeLayers.traffic ? 'opacity-100' : 'opacity-30']"></div>Traffic Flow</span>
            <div :class="['w-8 h-4 rounded-full flex items-center px-1 transition-all', activeLayers.traffic ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700']"><div :class="['w-2.5 h-2.5 bg-white rounded-full transition-all transform', activeLayers.traffic ? 'translate-x-3.5' : 'translate-x-0']"></div></div>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Sfondo invisibile per chiudere i menu -->
    <div v-if="showLayersMenu || searchResults.length > 0 || noResults" @click="closeDropdowns" class="fixed inset-0 z-40"></div>
  </div>
</template>