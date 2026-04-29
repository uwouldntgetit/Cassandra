<script setup lang="ts">
import { ref } from 'vue'
import { Search, Layers } from 'lucide-vue-next'

const showLayersMenu = ref(false)
const selectedLayers = ref({ weather: true, traffic: true })

const toggleLayer = (layer: keyof typeof selectedLayers.value) => {
  selectedLayers.value[layer] = !selectedLayers.value[layer]
}
</script>

<template>
  <div class="absolute top-0 left-0 right-0 p-4 md:p-6 pointer-events-auto z-10">
    <div class="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
      
      <div class="flex-1 relative group">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        <input 
          type="text" 
          placeholder="Search locations in Trento..." 
          class="w-full pl-10 pr-4 py-2.5 text-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 dark:border-cyan-400/30 hover:border-cyan-500/60 dark:hover:border-cyan-400/60 rounded-xl shadow-lg shadow-cyan-500/10 dark:shadow-cyan-400/10 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-slate-900 dark:text-slate-100" 
        />
      </div>

      <div class="relative">
        <button @click="showLayersMenu = !showLayersMenu" class="w-full sm:w-auto flex items-center gap-2 px-5 py-2.5 text-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 dark:border-cyan-400/30 hover:border-cyan-500/60 dark:hover:border-cyan-400/60 rounded-xl shadow-lg shadow-cyan-500/10 dark:shadow-cyan-400/10 transition-all text-slate-900 dark:text-slate-100">
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