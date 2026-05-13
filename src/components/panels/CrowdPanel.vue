<script setup lang="ts">
/**
 * CrowdPanel.vue
 * Displays real-time crowd density data and heatmap statistics.
 * 
 * Mostra i dati in tempo reale sulla densità della folla e le statistiche della mappa di calore.
 */
import { Users, Activity, Building, TrendingUp } from 'lucide-vue-next'
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
const crowdData = { labels: ['10', '11', '12', '13', '14', '15'], datasets: [{ data: [200, 350, 800, 1200, 950, 400], borderColor: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.15)', fill: true, tension: 0.4 }] }
</script>

<template>
  <BasePanel
    :isExpanded="isExpanded"
    :isLoading="isLoading"
    borderColorClass="border-purple-500/20"
    hoverColorClass="hover:text-purple-500"
    @toggle="emit('toggle')"
  >
    <template #header-icon>
      <Users class="w-3 h-3 md:w-5 md:h-5 text-purple-500" />
    </template>
    <template #header-title>Crowd Density</template>
    <template #status-badge>
      <span class="px-1.5 py-0.5 md:px-2 md:py-0.5 bg-red-500/10 text-red-500 text-[8px] md:text-[10px] font-bold rounded-md md:rounded-lg border border-red-500/20 uppercase">High</span>
    </template>
    <template #main-value>1.2K</template>
    <template #main-unit>PEOPLE / KM²</template>
    <template #secondary-metrics>
      <div class="flex items-center gap-0.5 md:gap-1.5 text-slate-500 dark:text-slate-400"><Building class="w-2 h-2 md:w-4 md:h-4 text-purple-500" /> <span class="text-[8px] md:text-xs font-medium truncate">Piazza Duomo</span></div>
      <div class="flex items-center gap-0.5 md:gap-1 text-red-500 font-medium"><TrendingUp class="w-2 h-2 md:w-3.5 md:h-3.5" /> <span class="text-[8px] md:text-xs truncate">+15%</span></div>
    </template>
    <template #chart-title>
      <Activity class="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /> Density Trend
    </template>
    <template #chart>
      <Line :data="crowdData" :options="getChartOptions()" />
    </template>
  </BasePanel>
</template>
