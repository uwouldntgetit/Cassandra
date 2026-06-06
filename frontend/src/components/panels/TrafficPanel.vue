<script setup lang="ts">
import { computed } from 'vue'
import { Car, Activity, Gauge, AlertTriangle } from 'lucide-vue-next'
import { Line, Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import BasePanel from './BasePanel.vue'
import { useLayerStore, TIME_SLOTS, TRAFFIC_TIME_CONG } from '../../stores/layerStore'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

defineProps<{ isExpanded: boolean, isLoading: boolean }>()
const emit = defineEmits(['toggle'])

const layerStore  = useLayerStore()
const liveData    = computed(() => layerStore.layerData.traffic)
const isForecast  = computed(() => layerStore.selectedForecastDay > 0)
const forecastDay = computed(() => layerStore.forecastData?.[layerStore.selectedForecastDay]?.traffic ?? null)
const slot        = computed(() => layerStore.selectedTimeSlot)
const slotLabel   = computed(() => isForecast.value ? TIME_SLOTS[slot.value]?.label : null)

// Statistiche aggiustate per fascia oraria sui segmenti reali
const timeSlotStats = computed(() => {
  if (!isForecast.value || !forecastDay.value?.segments?.features) return null
  const features = forecastDay.value.segments.features
  let high = 0, medium = 0, low = 0
  features.forEach((f: any) => {
    const c = TRAFFIC_TIME_CONG[f.properties.highway]?.[slot.value] ?? 'low'
    if (c === 'high') high++; else if (c === 'medium') medium++; else low++
  })
  const ratio = (high * 2 + medium) / (features.length * 2 || 1)
  return {
    congestionLevel: ratio > 0.5 ? 'high' : ratio > 0.2 ? 'moderate' : 'low',
    avgSpeed: Math.round(15 + (1 - ratio) * 30),
    delay:    Math.round(ratio * 45)
  }
})

const displayDelay = computed(() => timeSlotStats.value?.delay ?? forecastDay.value?.delay ?? liveData.value?.delay ?? '—')
const displaySpeed = computed(() => timeSlotStats.value?.avgSpeed ?? forecastDay.value?.avgSpeed ?? liveData.value?.avgSpeed)

const activeCongestion = computed(() => timeSlotStats.value?.congestionLevel ?? forecastDay.value?.congestionLevel ?? '')
const congestionLabel  = computed(() => activeCongestion.value === 'high' ? 'High' : activeCongestion.value === 'moderate' ? 'Moderate' : 'Low')
const congestionColor  = computed(() => activeCongestion.value === 'high' ? 'text-red-500' : activeCongestion.value === 'moderate' ? 'text-amber-500' : 'text-emerald-500')

const chartData = computed(() => {
  if (isForecast.value && layerStore.forecastData) {
    return {
      labels: layerStore.forecastData.map(d => d.dayLabel.split(' ').slice(0, 2).join(' ')),
      datasets: [{
        data: layerStore.forecastData.map(d => d.traffic.delay),
        backgroundColor: layerStore.forecastData.map(d =>
          d.traffic.congestionLevel === 'high' ? 'rgba(239,68,68,0.7)' : d.traffic.congestionLevel === 'moderate' ? 'rgba(251,146,60,0.7)' : 'rgba(34,197,94,0.7)'
        ),
        borderColor: layerStore.forecastData.map(d =>
          d.traffic.congestionLevel === 'high' ? '#ef4444' : d.traffic.congestionLevel === 'moderate' ? '#f97316' : '#22c55e'
        ),
        borderWidth: 2, borderRadius: 4,
      }]
    }
  }
  return {
    labels: liveData.value?.trendLabels ?? [],
    datasets: [{ data: liveData.value?.trend ?? [], borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.15)', fill: true, tension: 0.4 }]
  }
})

const getChartOptions = () => ({
  responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
    y: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: (v: any) => isForecast.value ? v + 'min' : v } }
  }
})
</script>

<template>
  <BasePanel :isExpanded="isExpanded" :isLoading="isLoading" borderColorClass="border-orange-500/20" hoverColorClass="hover:text-orange-500" @toggle="emit('toggle')">
    <template #header-icon><Car class="w-3 h-3 md:w-5 md:h-5 text-orange-500" /></template>
    <template #header-title>Traffic Flow</template>
    <template #status-badge>
      <span v-if="isForecast" class="px-1.5 py-0.5 md:px-2 md:py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[8px] md:text-[10px] font-bold rounded-md md:rounded-lg border border-orange-500/20 uppercase">{{ slotLabel ?? 'Forecast' }}</span>
      <span v-else class="px-1.5 py-0.5 md:px-2 md:py-0.5 bg-orange-500/10 text-orange-500 text-[8px] md:text-[10px] font-bold rounded-md md:rounded-lg border border-orange-500/20 uppercase">{{ liveData?.status ?? 'Moderate' }}</span>
    </template>
    <template #main-value>{{ displayDelay }}</template>
    <template #main-unit>MIN DELAY</template>
    <template #secondary-metrics>
      <div class="flex items-center gap-0.5 md:gap-1.5 text-slate-500 dark:text-slate-400">
        <Gauge class="w-2 h-2 md:w-4 md:h-4 text-cyan-500" />
        <span class="text-[8px] md:text-xs font-medium truncate">{{ displaySpeed ?? '—' }} km/h</span>
      </div>
      <div v-if="isForecast" class="flex items-center gap-0.5 md:gap-1 font-medium" :class="congestionColor">
        <AlertTriangle class="w-2 h-2 md:w-3.5 md:h-3.5" />
        <span class="text-[8px] md:text-xs truncate">{{ congestionLabel }}</span>
      </div>
      <div v-else class="flex items-center gap-0.5 md:gap-1 text-red-500 font-medium">
        <AlertTriangle class="w-2 h-2 md:w-3.5 md:h-3.5" />
        <span class="text-[8px] md:text-xs truncate">{{ liveData?.incidents ?? '—' }} incidenti</span>
      </div>
    </template>
    <template #chart-title>
      <Activity class="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
      {{ isForecast ? 'Predicted Delay 7 Days (min)' : 'Congestion Trend' }}
    </template>
    <template #chart>
      <Bar v-if="isForecast" :data="chartData" :options="getChartOptions()" />
      <Line v-else :data="chartData" :options="getChartOptions()" />
    </template>
  </BasePanel>
</template>
