<script setup lang="ts">
/**
 * TrafficPanel.vue
 * Displays real-time traffic flow data and congestion metrics.
 * 
 * Mostra i dati in tempo reale sul flusso di traffico e le metriche di congestione.
 */
import { Car, ChevronDown, Activity, Gauge, AlertTriangle } from 'lucide-vue-next'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

defineProps<{ isExpanded: boolean }>()
const emit = defineEmits(['toggle'])

const getChartOptions = () => ({
  responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }, y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8', font: { size: 10 } } } }
})
const trafficData = { labels: ['10', '11', '12', '13', '14', '15'], datasets: [{ data: [10, 15, 45, 80, 55, 30], borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.15)', fill: true, tension: 0.4 }] }
</script>

<template>
  <div style="direction: ltr;" class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-orange-500/20 rounded-2xl sm:rounded-3xl overflow-hidden shrink-0 flex flex-row sm:flex-col transition-all duration-300" :class="isExpanded ? 'w-[352px] sm:w-72 md:w-full' : 'w-44 sm:w-72 md:w-full'">
    <div class="w-44 sm:w-full shrink-0 p-3 pb-1.5 sm:p-5 sm:pb-0 flex flex-col justify-between h-[135px] sm:h-auto">
      <div class="flex items-center justify-between sm:mb-3">
        <div class="flex items-center gap-1.5 sm:gap-2 text-slate-800 dark:text-white font-bold text-[10px] sm:text-base">
          <Car class="w-3 h-3 sm:w-5 sm:h-5 text-orange-500" /> <span class="truncate">Traffic Flow</span>
        </div>
        <span class="px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-orange-500/10 text-orange-500 text-[8px] sm:text-[10px] font-bold rounded-md sm:rounded-lg border border-orange-500/20 uppercase">Moderate</span>
      </div>
      <div class="flex items-baseline gap-1 sm:gap-2 sm:mb-1">
        <span class="text-xl sm:text-4xl font-black text-slate-900 dark:text-white">24%</span> <span class="text-[8px] sm:text-xs font-medium text-slate-500">DELAY</span>
      </div>
      <div class="flex items-center justify-between sm:mb-4 sm:mt-2">
        <div class="flex items-center gap-0.5 sm:gap-1.5 text-slate-500 dark:text-slate-400"><Gauge class="w-2 h-2 sm:w-4 sm:h-4 text-cyan-500" /> <span class="text-[8px] sm:text-xs font-medium truncate">28 km/h Avg Speed</span></div>
        <div class="flex items-center gap-0.5 sm:gap-1 text-red-500 font-medium"><AlertTriangle class="w-2 h-2 sm:w-3.5 sm:h-3.5" /> <span class="text-[8px] sm:text-xs truncate">3 Incidents</span></div>
      </div>
      <button @click="emit('toggle')" class="flex items-center justify-between w-full pt-1.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800 text-[8px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-orange-500 transition-colors">
        <span>{{ isExpanded ? 'Hide' : 'Details' }}</span>
        <ChevronDown class="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300" :class="isExpanded ? 'rotate-90 sm:rotate-180' : '-rotate-90 sm:rotate-0'" />
      </button>
    </div>
    <div class="transition-all duration-300 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden flex flex-1 min-w-0 sm:flex-none sm:grid" :class="isExpanded ? 'opacity-100 sm:grid-rows-[1fr]' : 'opacity-0 sm:grid-rows-[0fr]'">
      <div class="w-full p-2 sm:p-5 sm:pt-3 h-[135px] sm:h-auto flex flex-col justify-center sm:block overflow-hidden min-h-0">
        <div class="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-[9px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <Activity class="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" /> Congestion Trend
        </div>
        <div class="h-20 sm:h-32"><Line :data="trafficData" :options="getChartOptions()" /></div>
      </div>
    </div>
  </div>
</template>
