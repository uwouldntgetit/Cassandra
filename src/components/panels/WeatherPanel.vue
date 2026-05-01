<script setup lang="ts">
/**
 * WeatherPanel.vue
 * Displays current weather metrics and forecasts for the city.
 * 
 * Mostra le metriche meteo attuali e le previsioni per la città.
 */
import { Wind, ChevronDown, Activity, Thermometer, Droplets } from 'lucide-vue-next'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

defineProps<{ isExpanded: boolean }>()
const emit = defineEmits(['toggle'])

const getChartOptions = () => ({
  responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }, y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8', font: { size: 10 } } } }
})
const airData = { labels: ['10', '11', '12', '13', '14', '15'], datasets: [{ data: [25, 28, 32, 45, 38, 42], borderColor: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.15)', fill: true, tension: 0.4 }] }
</script>

<template>
  <div style="direction: ltr;" class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-cyan-500/20 rounded-3xl shadow-xl overflow-hidden shrink-0">
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
      <button @click="emit('toggle')" class="flex items-center justify-between w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-cyan-500 transition-colors">
        <span>{{ isExpanded ? 'Hide Details' : 'Show Details' }}</span>
        <ChevronDown class="w-4 h-4 transition-transform" :class="{ 'rotate-180': isExpanded }" />
      </button>
    </div>
    <div class="grid transition-all duration-300 bg-slate-50/50 dark:bg-slate-800/30" :class="isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
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
</template>
