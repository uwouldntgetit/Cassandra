<script setup lang="ts">
import { computed } from 'vue'
import { Cloud, Wind, Activity, Droplets, Thermometer } from 'lucide-vue-next'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import BasePanel from './BasePanel.vue'
import { useLayerStore } from '../../stores/layerStore'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

defineProps<{ isExpanded: boolean, isLoading: boolean }>()
const emit = defineEmits(['toggle'])

const layerStore  = useLayerStore()
const liveData    = computed(() => layerStore.layerData.weather)
const isForecast  = computed(() => layerStore.selectedForecastDay > 0)
const forecastDay = computed(() => layerStore.forecastData?.[layerStore.selectedForecastDay]?.weather ?? null)

const statusColor = computed(() => {
  const s = liveData.value?.status ?? 'Good'
  return s === 'Good' ? 'bg-green-500/10 text-green-500 border-green-500/20'
    : s === 'Moderate' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    : 'bg-red-500/10 text-red-500 border-red-500/20'
})

const chartData = computed(() => {
  if (isForecast.value && layerStore.forecastData) {
    return {
      labels: layerStore.forecastData.map(d => d.dayLabel.split(' ').slice(0, 2).join(' ')),
      datasets: [{
        data: layerStore.forecastData.map(d => d.weather.tempMax),
        borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.15)', fill: true, tension: 0.4
      }]
    }
  }
  return {
    labels: liveData.value?.trendLabels ?? [],
    datasets: [{ data: liveData.value?.trend ?? [], borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.15)', fill: true, tension: 0.4 }]
  }
})

const getChartOptions = () => ({
  responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
    y: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: (v: any) => isForecast.value ? v + '°' : v } }
  }
})
</script>

<template>
  <BasePanel :isExpanded="isExpanded" :isLoading="isLoading" borderColorClass="border-sky-500/20" hoverColorClass="hover:text-sky-500" @toggle="emit('toggle')">
    <template #header-icon><Cloud class="w-3 h-3 md:w-5 md:h-5 text-sky-500" /></template>
    <template #header-title>Weather</template>
    <template #status-badge>
      <span v-if="isForecast" class="px-1.5 py-0.5 md:px-2 md:py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[8px] md:text-[10px] font-bold rounded-md md:rounded-lg border border-orange-500/20 uppercase">Forecast</span>
      <span v-else :class="['px-1.5 py-0.5 md:px-2 md:py-0.5 text-[8px] md:text-[10px] font-bold rounded-md md:rounded-lg border uppercase', statusColor]">{{ liveData?.status ?? 'Good' }}</span>
    </template>
    <template #main-value>{{ isForecast ? `↑${forecastDay?.tempMax ?? '—'}°` : `${liveData?.temperature ?? '—'}°` }}</template>
    <template #main-unit>{{ isForecast ? 'MAX TEMP' : 'TEMP °C' }}</template>
    <template #secondary-metrics>
      <div v-if="isForecast" class="flex items-center gap-0.5 md:gap-1.5 text-slate-500 dark:text-slate-400">
        <Droplets class="w-2 h-2 md:w-4 md:h-4 text-sky-500" />
        <span class="text-[8px] md:text-xs font-medium truncate">{{ forecastDay?.precipProbability ?? '—' }}% rain</span>
      </div>
      <template v-else>
        <div class="flex items-center gap-0.5 md:gap-1 text-slate-500 dark:text-slate-400"><Thermometer class="w-2 h-2 md:w-3.5 md:h-3.5" /><span class="text-[8px] md:text-xs font-medium truncate">{{ liveData?.aqi ?? '—' }} AQI</span></div>
        <div class="flex items-center gap-0.5 md:gap-1 text-slate-500 dark:text-slate-400"><Droplets class="w-2 h-2 md:w-3.5 md:h-3.5" /><span class="text-[8px] md:text-xs font-medium truncate">{{ liveData?.humidity ?? '—' }}%</span></div>
      </template>
      <div class="flex items-center gap-0.5 md:gap-1 text-slate-500 dark:text-slate-400">
        <Wind class="w-2 h-2 md:w-3.5 md:h-3.5" />
        <span class="text-[8px] md:text-xs font-medium truncate">{{ isForecast ? forecastDay?.windSpeed : liveData?.windSpeed }} km/h</span>
      </div>
    </template>
    <template #chart-title>
      <Activity class="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
      {{ isForecast ? 'Max Temp 7 Days (°C)' : 'AQI Trend' }}
    </template>
    <template #chart><Line :data="chartData" :options="getChartOptions()" /></template>
  </BasePanel>
</template>
