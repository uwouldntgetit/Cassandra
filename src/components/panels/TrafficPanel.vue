<script setup lang="ts">
/**
 * TrafficPanel.vue
 * Displays real-time traffic flow data and congestion metrics.
 * 
 * Mostra i dati in tempo reale sul flusso di traffico e le metriche di congestione.
 */
import { Car, Activity, Gauge, AlertTriangle } from 'lucide-vue-next'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import BasePanel from './BasePanel.vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

defineProps<{ isExpanded: boolean, isLoading: boolean }>()
const emit = defineEmits(['toggle'])

const getChartOptions = () => ({
  responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }, y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8', font: { size: 10 } } } }
})
const trafficData = { labels: ['10', '11', '12', '13', '14', '15'], datasets: [{ data: [10, 15, 45, 80, 55, 30], borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.15)', fill: true, tension: 0.4 }] }
</script>

<template>
  <BasePanel
    :isExpanded="isExpanded"
    :isLoading="isLoading"
    borderColorClass="border-orange-500/20"
    hoverColorClass="hover:text-orange-500"
    @toggle="emit('toggle')"
  >
    <template #header-icon>
      <Car class="w-3 h-3 md:w-5 md:h-5 text-orange-500" />
    </template>
    <template #header-title>Traffic Flow</template>
    <template #status-badge>
      <span class="px-1.5 py-0.5 md:px-2 md:py-0.5 bg-orange-500/10 text-orange-500 text-[8px] md:text-[10px] font-bold rounded-md md:rounded-lg border border-orange-500/20 uppercase">Moderate</span>
    </template>
    <template #main-value>24%</template>
    <template #main-unit>DELAY</template>
    <template #secondary-metrics>
      <div class="flex items-center gap-0.5 md:gap-1.5 text-slate-500 dark:text-slate-400"><Gauge class="w-2 h-2 md:w-4 md:h-4 text-cyan-500" /> <span class="text-[8px] md:text-xs font-medium truncate">28 km/h Avg Speed</span></div>
      <div class="flex items-center gap-0.5 md:gap-1 text-red-500 font-medium"><AlertTriangle class="w-2 h-2 md:w-3.5 md:h-3.5" /> <span class="text-[8px] md:text-xs truncate">3 Incidents</span></div>
    </template>
    <template #chart-title>
      <Activity class="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /> Congestion Trend
    </template>
    <template #chart>
      <Line :data="trafficData" :options="getChartOptions()" />
    </template>
  </BasePanel>
</template>
