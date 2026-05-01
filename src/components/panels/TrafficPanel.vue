<script setup lang="ts">
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
  <div style="direction: ltr;" class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-orange-500/20 rounded-3xl shadow-xl overflow-hidden shrink-0">
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
      <button @click="emit('toggle')" class="flex items-center justify-between w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-orange-500 transition-colors">
        <span>{{ isExpanded ? 'Hide Details' : 'Show Details' }}</span>
        <ChevronDown class="w-4 h-4 transition-transform" :class="{ 'rotate-180': isExpanded }" />
      </button>
    </div>
    <div class="grid transition-all duration-300 bg-slate-50/50 dark:bg-slate-800/30" :class="isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
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
</template>
