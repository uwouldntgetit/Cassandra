<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Wind, ChevronDown, Activity, Car, Thermometer, 
  Droplets, AlertTriangle, Gauge, Clock, MapPin,
  Lightbulb, Zap, Moon, Users, Building, TrendingUp
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

type PanelType = 'weather' | 'traffic' | 'lighting' | 'crowd'
const expandedPanel = ref<PanelType | null>(null)

const togglePanel = (panel: PanelType) => {
  expandedPanel.value = expandedPanel.value === panel ? null : panel
}

const getChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
    y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
  }
})

const airData = { labels: ['10', '11', '12', '13', '14', '15'], datasets: [{ data: [25, 28, 32, 45, 38, 42], borderColor: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.15)', fill: true, tension: 0.4 }] }
const trafficData = { labels: ['10', '11', '12', '13', '14', '15'], datasets: [{ data: [10, 15, 45, 80, 55, 30], borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.15)', fill: true, tension: 0.4 }] }
const lightingData = { labels: ['18', '20', '22', '00', '02', '04'], datasets: [{ data: [20, 60, 100, 100, 80, 60], borderColor: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.15)', fill: true, tension: 0.4 }] }
const crowdData = { labels: ['10', '11', '12', '13', '14', '15'], datasets: [{ data: [200, 350, 800, 1200, 950, 400], borderColor: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.15)', fill: true, tension: 0.4 }] }

const hasActiveLayers = computed(() => {
  return layerStore.activeLayers.weather || layerStore.activeLayers.traffic || 
         layerStore.activeLayers.lighting || layerStore.activeLayers.crowd
})
</script>

<template>
  <!-- Contenitore Principale allargato a 350px per far respirare la scrollbar -->
  <div 
    v-show="hasActiveLayers"
    class="absolute left-6 top-1/2 -translate-y-1/2 z-40 w-[350px] max-h-[70vh] flex flex-col"
  >
    <!-- 
      LA MAGIA: 
      1. style="direction: rtl;" sposta la scrollbar a sinistra.
      2. pl-4 (padding-left: 1rem) crea uno spazio fisico tra la scrollbar a sinistra e i pannelli a destra!
    -->
    <TransitionGroup 
      name="panel" 
      tag="div" 
      class="flex flex-col gap-4 overflow-y-auto custom-scrollbar py-1 pr-1 pl-4"
      style="direction: rtl;"
    >
      
      <!-- 1. PANNELLO WEATHER -->
      <!-- style="direction: ltr;" rimette i testi e i grafici dritti e normali -->
      <div v-if="layerStore.activeLayers.weather" key="weather" style="direction: ltr;" class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-cyan-500/20 rounded-3xl shadow-xl overflow-hidden shrink-0">
        <div class="p-5 pb-3">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2 text-slate-800 dark:text-white font-bold">
              <Wind class="w-5 h-5 text-cyan-500" /> <span>Air Quality</span>
            </div>
            <span class="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-lg border border-green-500/20 uppercase">Good</span>
          </div>
          <div class="flex items-baseline gap-2 mb-1">
            <span class="text-4xl font-black text-slate-900 dark:text-white">42</span> <span class="text-xs font-medium text-slate-500">AQI</span>
          </div>
          <div class="flex items-center gap-4 mb-4 mt-2">
            <div class="flex items-center gap-1 text-slate-500 dark:text-slate-400"><Thermometer class="w-3.5 h-3.5" /> <span class="text-xs font-medium">22°C</span></div>
            <div class="flex items-center gap-1 text-slate-500 dark:text-slate-400"><Droplets class="w-3.5 h-3.5" /> <span class="text-xs font-medium">45%</span></div>
            <div class="flex items-center gap-1 text-slate-500 dark:text-slate-400"><Wind class="w-3.5 h-3.5" /> <span class="text-xs font-medium">12km/h</span></div>
          </div>
          <button @click="togglePanel('weather')" class="flex items-center justify-between w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-cyan-500 transition-colors">
            <span>{{ expandedPanel === 'weather' ? 'Hide Details' : 'Show Details' }}</span>
            <ChevronDown class="w-4 h-4 transition-transform" :class="{ 'rotate-180': expandedPanel === 'weather' }" />
          </button>
        </div>
        <div class="grid transition-all duration-300 bg-slate-50/50 dark:bg-slate-800/30" :class="expandedPanel === 'weather' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
          <div class="overflow-hidden">
            <div class="p-5 pt-3">
              <div class="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Activity class="w-3.5 h-3.5" /> AQI Trend (Last 6h)
              </div>
              <div class="h-32"><Line :data="airData" :options="getChartOptions()" /></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. PANNELLO TRAFFICO -->
      <div v-if="layerStore.activeLayers.traffic" key="traffic" style="direction: ltr;" class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-orange-500/20 rounded-3xl shadow-xl overflow-hidden shrink-0">
        <div class="p-5 pb-3">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2 text-slate-800 dark:text-white font-bold">
              <Car class="w-5 h-5 text-orange-500" /> <span>Traffic Flow</span>
            </div>
            <span class="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[10px] font-bold rounded-lg border border-orange-500/20 uppercase">Moderate</span>
          </div>
          <div class="flex items-baseline gap-2 mb-1">
            <span class="text-4xl font-black text-slate-900 dark:text-white">24%</span> <span class="text-xs font-medium text-slate-500">DELAY</span>
          </div>
          <div class="flex items-center justify-between mb-4 mt-2">
            <div class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><Gauge class="w-4 h-4 text-cyan-500" /> <span class="text-xs font-medium">28 km/h Avg Speed</span></div>
            <div class="flex items-center gap-1 text-red-500 font-medium"><AlertTriangle class="w-3.5 h-3.5" /> <span class="text-xs">3 Incidents</span></div>
          </div>
          <button @click="togglePanel('traffic')" class="flex items-center justify-between w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-orange-500 transition-colors">
            <span>{{ expandedPanel === 'traffic' ? 'Hide Details' : 'Show Details' }}</span>
            <ChevronDown class="w-4 h-4 transition-transform" :class="{ 'rotate-180': expandedPanel === 'traffic' }" />
          </button>
        </div>
        <div class="grid transition-all duration-300 bg-slate-50/50 dark:bg-slate-800/30" :class="expandedPanel === 'traffic' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
          <div class="overflow-hidden">
            <div class="p-5 pt-3">
              <div class="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Activity class="w-3.5 h-3.5" /> Congestion Trend
              </div>
              <div class="h-32"><Line :data="trafficData" :options="getChartOptions()" /></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. PANNELLO SMART LIGHTING -->
      <div v-if="layerStore.activeLayers.lighting" key="lighting" style="direction: ltr;" class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-yellow-500/20 rounded-3xl shadow-xl overflow-hidden shrink-0">
        <div class="p-5 pb-3">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2 text-slate-800 dark:text-white font-bold">
              <Lightbulb class="w-5 h-5 text-yellow-500" /> <span>Smart Lighting</span>
            </div>
            <span class="px-2 py-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[10px] font-bold rounded-lg border border-yellow-500/20 uppercase">Active</span>
          </div>
          <div class="flex items-baseline gap-2 mb-1">
            <span class="text-4xl font-black text-slate-900 dark:text-white">82%</span> <span class="text-xs font-medium text-slate-500">COVERAGE</span>
          </div>
          <div class="flex items-center justify-between mb-4 mt-2">
            <div class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><Zap class="w-4 h-4 text-yellow-500" /> <span class="text-xs font-medium">324 kWh Saved</span></div>
            <div class="flex items-center gap-1 text-slate-500 dark:text-slate-400"><Moon class="w-3.5 h-3.5" /> <span class="text-xs font-medium">Auto-Dim</span></div>
          </div>
          <button @click="togglePanel('lighting')" class="flex items-center justify-between w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-yellow-500 transition-colors">
            <span>{{ expandedPanel === 'lighting' ? 'Hide Details' : 'Show Details' }}</span>
            <ChevronDown class="w-4 h-4 transition-transform" :class="{ 'rotate-180': expandedPanel === 'lighting' }" />
          </button>
        </div>
        <div class="grid transition-all duration-300 bg-slate-50/50 dark:bg-slate-800/30" :class="expandedPanel === 'lighting' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
          <div class="overflow-hidden">
            <div class="p-5 pt-3">
              <div class="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Activity class="w-3.5 h-3.5" /> Power Usage & Dimming
              </div>
              <div class="h-32"><Line :data="lightingData" :options="getChartOptions()" /></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. PANNELLO CROWD DENSITY -->
      <div v-if="layerStore.activeLayers.crowd" key="crowd" style="direction: ltr;" class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-purple-500/20 rounded-3xl shadow-xl overflow-hidden shrink-0">
        <div class="p-5 pb-3">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2 text-slate-800 dark:text-white font-bold">
              <Users class="w-5 h-5 text-purple-500" /> <span>Crowd Density</span>
            </div>
            <span class="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold rounded-lg border border-red-500/20 uppercase">High</span>
          </div>
          <div class="flex items-baseline gap-2 mb-1">
            <span class="text-4xl font-black text-slate-900 dark:text-white">1.2K</span> <span class="text-xs font-medium text-slate-500">PEOPLE / KM²</span>
          </div>
          <div class="flex items-center justify-between mb-4 mt-2">
            <div class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><Building class="w-4 h-4 text-purple-500" /> <span class="text-xs font-medium">Piazza Duomo</span></div>
            <div class="flex items-center gap-1 text-red-500 font-medium"><TrendingUp class="w-3.5 h-3.5" /> <span class="text-xs">+15%</span></div>
          </div>
          <button @click="togglePanel('crowd')" class="flex items-center justify-between w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-purple-500 transition-colors">
            <span>{{ expandedPanel === 'crowd' ? 'Hide Details' : 'Show Details' }}</span>
            <ChevronDown class="w-4 h-4 transition-transform" :class="{ 'rotate-180': expandedPanel === 'crowd' }" />
          </button>
        </div>
        <div class="grid transition-all duration-300 bg-slate-50/50 dark:bg-slate-800/30" :class="expandedPanel === 'crowd' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
          <div class="overflow-hidden">
            <div class="p-5 pt-3">
              <div class="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Activity class="w-3.5 h-3.5" /> Density Trend
              </div>
              <div class="h-32"><Line :data="crowdData" :options="getChartOptions()" /></div>
            </div>
          </div>
        </div>
      </div>

    </TransitionGroup>
  </div>
</template>

<style scoped>
.panel-move,
.panel-enter-active, 
.panel-leave-active { 
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); 
  transform-origin: center center; 
  max-height: 600px; 
}

.panel-enter-from, 
.panel-leave-to { 
  opacity: 0; 
  transform: translateX(-30px) scale(0.5); 
}

.panel-leave-to {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  border: none;
  margin-bottom: -16px; 
  overflow: hidden;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  /* Margini leggeri per non far toccare la scrollbar al bordo superiore/inferiore */
  margin-top: 8px;
  margin-bottom: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.4);
  border-radius: 20px;
}

@media (prefers-color-scheme: dark) {
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
  }
}
</style>