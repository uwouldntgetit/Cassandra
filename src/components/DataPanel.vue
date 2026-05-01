<script setup lang="ts">
import { ref } from 'vue'
import { 
  Wind, ChevronDown, Activity, Car, Thermometer, 
  Droplets, AlertTriangle, Gauge, Clock, MapPin 
} from 'lucide-vue-next'
import { useLayerStore } from '../stores/layerStore'

import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const layerStore = useLayerStore()

const expandedPanel = ref<'weather' | 'traffic' | null>(null)

const togglePanel = (panel: 'weather' | 'traffic') => {
  expandedPanel.value = expandedPanel.value === panel ? null : panel
}

const airData = {
  labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
  datasets: [{
    label: 'AQI Index',
    data: [25, 28, 32, 45, 38, 42],
    borderColor: '#06b6d4',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    fill: true,
    tension: 0.4
  }]
}

const trafficData = {
  labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
  datasets: [{
    label: 'Congestion %',
    data: [10, 15, 45, 80, 55, 30],
    borderColor: '#f97316',
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    fill: true,
    tension: 0.4
  }]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
    y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
  }
}
</script>

<template>
  <!-- Usiamo TransitionGroup al posto del div per animare il riposizionamento (la prop "tag" genera un div) -->
  <TransitionGroup 
    name="panel" 
    tag="div" 
    class="absolute left-6 top-1/2 -translate-y-1/2 z-40 w-80 flex flex-col gap-4"
  >
    
    <!-- 1. PANNELLO WEATHER (AIR QUALITY) -->
    <!-- N.B. Il "key" è fondamentale per TransitionGroup per riconoscere quale elemento si sta muovendo -->
    <div v-if="layerStore.activeLayers.weather" key="weather" class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-cyan-500/20 rounded-3xl shadow-2xl overflow-hidden">
      
      <div class="p-5 pb-3">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 text-slate-800 dark:text-white font-bold">
            <Wind class="w-5 h-5 text-cyan-500" />
            <span>Air Quality & Weather</span>
          </div>
          <span class="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-lg border border-green-500/20 uppercase">Good</span>
        </div>
        
        <div class="flex items-baseline gap-2 mb-1">
          <span class="text-4xl font-black text-slate-900 dark:text-white">42</span>
          <span class="text-xs font-medium text-slate-500">AQI</span>
        </div>

        <div class="flex items-center gap-4 mb-4 mt-2">
          <div class="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Thermometer class="w-3.5 h-3.5" /> <span class="text-xs font-medium">22°C</span>
          </div>
          <div class="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Droplets class="w-3.5 h-3.5" /> <span class="text-xs font-medium">45%</span>
          </div>
          <div class="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Wind class="w-3.5 h-3.5" /> <span class="text-xs font-medium">12 km/h</span>
          </div>
        </div>

        <button @click="togglePanel('weather')" class="flex items-center justify-between w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-cyan-500 transition-colors">
          <span>{{ expandedPanel === 'weather' ? 'Hide Details' : 'Show Details' }}</span>
          <ChevronDown class="w-4 h-4 transition-transform" :class="{ 'rotate-180': expandedPanel === 'weather' }" />
        </button>
      </div>

      <div class="grid transition-all duration-300 bg-slate-50/50 dark:bg-slate-800/30" :class="expandedPanel === 'weather' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
        <div class="overflow-hidden">
          <div class="p-5 pt-3">
            <div class="grid grid-cols-3 gap-2 mb-4">
              <div class="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                <div class="text-[10px] text-slate-400 font-semibold mb-1">PM 2.5</div>
                <div class="text-sm font-bold text-slate-700 dark:text-white">15<span class="text-[9px] font-normal text-slate-400 ml-0.5">µg</span></div>
              </div>
              <div class="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                <div class="text-[10px] text-slate-400 font-semibold mb-1">NO2</div>
                <div class="text-sm font-bold text-slate-700 dark:text-white">28<span class="text-[9px] font-normal text-slate-400 ml-0.5">µg</span></div>
              </div>
              <div class="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                <div class="text-[10px] text-slate-400 font-semibold mb-1">O3</div>
                <div class="text-sm font-bold text-slate-700 dark:text-white">45<span class="text-[9px] font-normal text-slate-400 ml-0.5">µg</span></div>
              </div>
            </div>
            <div class="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Activity class="w-3.5 h-3.5" /> AQI Trend (Last 6h)
            </div>
            <div class="h-32"><Line :data="airData" :options="chartOptions" /></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. PANNELLO TRAFFICO -->
    <div v-if="layerStore.activeLayers.traffic" key="traffic" class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-orange-500/20 rounded-3xl shadow-2xl overflow-hidden">
      
      <div class="p-5 pb-3">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 text-slate-800 dark:text-white font-bold">
            <Car class="w-5 h-5 text-orange-500" />
            <span>Traffic Flow</span>
          </div>
          <span class="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[10px] font-bold rounded-lg border border-orange-500/20 uppercase">Moderate</span>
        </div>
        
        <div class="flex items-baseline gap-2 mb-1">
          <span class="text-4xl font-black text-slate-900 dark:text-white">24%</span>
          <span class="text-xs font-medium text-slate-500">DELAY</span>
        </div>

        <div class="flex items-center justify-between mb-4 mt-2">
          <div class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Gauge class="w-4 h-4 text-cyan-500" /> 
            <span class="text-xs font-medium">28 km/h Avg Speed</span>
          </div>
          <div class="flex items-center gap-1 text-red-500 font-medium">
            <AlertTriangle class="w-3.5 h-3.5" /> 
            <span class="text-xs">3 Incidents</span>
          </div>
        </div>

        <button @click="togglePanel('traffic')" class="flex items-center justify-between w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-orange-500 transition-colors">
          <span>{{ expandedPanel === 'traffic' ? 'Hide Details' : 'Show Details' }}</span>
          <ChevronDown class="w-4 h-4 transition-transform" :class="{ 'rotate-180': expandedPanel === 'traffic' }" />
        </button>
      </div>

      <div class="grid transition-all duration-300 bg-slate-50/50 dark:bg-slate-800/30" :class="expandedPanel === 'traffic' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
        <div class="overflow-hidden">
          <div class="p-5 pt-3">
            <div class="flex flex-col gap-2 mb-4">
              <div class="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
                <span class="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium"><Clock class="w-3.5 h-3.5"/> Peak Hour</span>
                <span class="font-bold text-slate-700 dark:text-white">17:00 - 18:30</span>
              </div>
              <div class="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
                <span class="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium"><MapPin class="w-3.5 h-3.5"/> Busiest Road</span>
                <span class="font-bold text-slate-700 dark:text-white">Via Roma</span>
              </div>
            </div>
            <div class="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Activity class="w-3.5 h-3.5" /> Congestion Trend
            </div>
            <div class="h-32"><Line :data="trafficData" :options="chartOptions" /></div>
          </div>
        </div>
      </div>
    </div>

  </TransitionGroup>
</template>

<style scoped>
/* Transizione base con un timing "cubic-bezier" per renderla ancora più fluida ed elastica */
.panel-move,
.panel-enter-active, 
.panel-leave-active { 
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); 
  transform-origin: center center; /* Assicuriamoci che il fulcro sia il centro esatto */
  max-height: 500px; 
}

/* Stato iniziale e finale */
.panel-enter-from, 
.panel-leave-to { 
  opacity: 0; 
  /* LA MAGIA: Oltre a spostarsi a sinistra, si rimpicciolisce verso il centro (scale 0.5) */
  transform: translateX(-30px) scale(0.5); 
}

/* Gestione dello spazio (per non far teletrasportare l'altro pannello) */
.panel-leave-to {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  border: none;
  margin-bottom: -16px; /* Compensa il gap di 16px del contenitore flex */
  overflow: hidden;
}
</style>