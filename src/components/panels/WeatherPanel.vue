<script setup lang="ts">
/**
 * WeatherPanel.vue
 * Displays current weather metrics and forecasts for the city.
 * 
 * Mostra le metriche meteo attuali e le previsioni per la città.
 */
import { Wind, Activity, Thermometer, Droplets } from 'lucide-vue-next'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import BasePanel from './BasePanel.vue'

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
  <BasePanel
    :isExpanded="isExpanded"
    borderColorClass="border-cyan-500/20"
    hoverColorClass="hover:text-cyan-500"
    @toggle="emit('toggle')"
  >
    <template #header-icon>
      <Wind class="w-3 h-3 md:w-5 md:h-5 text-cyan-500" />
    </template>
    <template #header-title>Air Quality</template>
    <template #status-badge>
      <span class="px-1.5 py-0.5 md:px-2 md:py-0.5 bg-green-500/10 text-green-500 text-[8px] md:text-[10px] font-bold rounded-md md:rounded-lg border border-green-500/20 uppercase">Good</span>
    </template>
    <template #main-value>42</template>
    <template #main-unit>AQI</template>
    <template #secondary-metrics>
      <div class="flex items-center gap-0.5 md:gap-1 text-slate-500 dark:text-slate-400"><Thermometer class="w-2 h-2 md:w-3.5 md:h-3.5" /> <span class="text-[8px] md:text-xs font-medium truncate">22°C</span></div>
      <div class="flex items-center gap-0.5 md:gap-1 text-slate-500 dark:text-slate-400"><Droplets class="w-2 h-2 md:w-3.5 md:h-3.5" /> <span class="text-[8px] md:text-xs font-medium truncate">45%</span></div>
      <div class="flex items-center gap-0.5 md:gap-1 text-slate-500 dark:text-slate-400"><Wind class="w-2 h-2 md:w-3.5 md:h-3.5" /> <span class="text-[8px] md:text-xs font-medium truncate">12km/h</span></div>
    </template>
    <template #chart-title>
      <Activity class="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /> Trend
    </template>
    <template #chart>
      <Line :data="airData" :options="getChartOptions()" />
    </template>
  </BasePanel>
</template>
