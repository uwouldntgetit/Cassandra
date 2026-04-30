<script setup lang="ts">
import { ref } from 'vue'
import { Search, Layers, Loader2 } from 'lucide-vue-next'

// Dichiariamo che possiamo inviare le coordinate alla mappa (App.vue)
const emit = defineEmits(['fly-to'])

const showLayersMenu = ref(false)
const selectedLayers = ref({ weather: true, traffic: true })

// Variabili per la ricerca
const searchQuery = ref('')
const isSearching = ref(false)

const toggleLayer = (layer: keyof typeof selectedLayers.value) => {
  selectedLayers.value[layer] = !selectedLayers.value[layer]
}

// --- LA TUA PRIMA CHIAMATA API ---
const handleSearch = async () => {
  // Se la barra è vuota, non facciamo nulla
  if (!searchQuery.value.trim()) return

  isSearching.value = true // Facciamo girare la rotellina

  try {
    // 1. IL FETCH: Chiediamo i dati al server di OpenStreetMap
    // (usiamo `await` perché la risposta impiega qualche millisecondo ad arrivare)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}`
    const response = await fetch(url)
    
    // 2. IL JSON: Traduciamo la risposta del server in un oggetto Javascript
    const data = await response.json()

    // 3. IL RISULTATO: Se il server ha trovato il luogo...
    if (data && data.length > 0) {
      // Estraiamo lat e lon del primo risultato
      const lat = parseFloat(data[0].lat)
      const lon = parseFloat(data[0].lon)
      
      // "Urliamo" le coordinate al padre (App.vue) per far muovere la mappa
      emit('fly-to', lat, lon)
      searchQuery.value = '' // Svuotiamo la barra
    } else {
      alert("Oops! Luogo non trovato. Prova con un'altra città o via.")
    }
  } catch (error) {
    console.error("Errore di rete durante la chiamata API:", error)
  } finally {
    isSearching.value = false // Fermiamo la rotellina in ogni caso
  }
}
</script>

<template>
  <div class="absolute top-0 left-0 right-0 p-4 md:p-6 pointer-events-auto z-10">
    <div class="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
      
      <!-- Search Bar -->
      <div class="flex-1 relative group">
        <!-- Mostriamo la rotellina se sta cercando, altrimenti la lente -->
        <Loader2 v-if="isSearching" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500 animate-spin" />
        <Search v-else class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        
        <input 
          type="text" 
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          placeholder="Cerca 'Roma' o 'Piazza Duomo Trento' e premi Invio..." 
          class="w-full pl-10 pr-4 py-2.5 text-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 dark:border-cyan-400/30 hover:border-cyan-500/60 dark:hover:border-cyan-400/60 rounded-xl shadow-lg shadow-cyan-500/10 dark:shadow-cyan-400/10 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-slate-900 dark:text-slate-100" 
        />
      </div>

      <!-- Layers Dropdown -->
      <div class="relative">
        <button @click="showLayersMenu = !showLayersMenu" class="w-full sm:w-auto flex items-center gap-2 px-5 py-2.5 text-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 dark:border-cyan-400/30 hover:border-cyan-500/60 dark:hover:border-cyan-400/60 rounded-xl shadow-lg shadow-cyan-500/10 transition-all text-slate-900 dark:text-slate-100">
          <Layers class="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Layers</span>
        </button>
        
        <div v-if="showLayersMenu" class="absolute top-full mt-2 right-0 w-56 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl rounded-xl shadow-xl border border-cyan-500/20 z-50 p-1.5 flex flex-col gap-1">
          <button @click="toggleLayer('weather')" class="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-cyan-50 dark:hover:bg-slate-800 transition-all text-slate-900 dark:text-slate-100">
            <span class="flex items-center gap-2.5"><div :class="['w-2 h-2 rounded-full bg-sky-500', selectedLayers.weather ? 'opacity-100' : 'opacity-30']"></div>Weather</span>
            <div :class="['w-8 h-4 rounded-full flex items-center px-1 transition-all', selectedLayers.weather ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700']"><div :class="['w-2.5 h-2.5 bg-white rounded-full transition-all transform', selectedLayers.weather ? 'translate-x-3.5' : 'translate-x-0']"></div></div>
          </button>
          
          <button @click="toggleLayer('traffic')" class="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-cyan-50 dark:hover:bg-slate-800 transition-all text-slate-900 dark:text-slate-100">
            <span class="flex items-center gap-2.5"><div :class="['w-2 h-2 rounded-full bg-orange-500', selectedLayers.traffic ? 'opacity-100' : 'opacity-30']"></div>Traffic Flow</span>
            <div :class="['w-8 h-4 rounded-full flex items-center px-1 transition-all', selectedLayers.traffic ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700']"><div :class="['w-2.5 h-2.5 bg-white rounded-full transition-all transform', selectedLayers.traffic ? 'translate-x-3.5' : 'translate-x-0']"></div></div>
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="showLayersMenu" @click="showLayersMenu = false" class="fixed inset-0 z-40"></div>
  </div>
</template>