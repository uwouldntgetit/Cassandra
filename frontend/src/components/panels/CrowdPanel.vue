<script setup lang="ts">
import { computed } from 'vue'
import { Users, Activity, Building, TrendingUp } from 'lucide-vue-next'
import { Line, Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import BasePanel from './BasePanel.vue'
import { useLayerStore, TIME_SLOTS, CROWD_TIME_MULT } from '../../stores/layerStore'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

defineProps<{ isExpanded: boolean, isLoading: boolean }>()
const emit = defineEmits(['toggle'])

const layerStore  = useLayerStore()
const liveData    = computed(() => layerStore.layerData.crowd)
const isForecast  = computed(() => layerStore.selectedForecastDay > 0)
const forecastDay = computed(() => layerStore.forecastData?.[layerStore.selectedForecastDay]?.crowd ?? null)
const slot        = computed(() => layerStore.selectedTimeSlot)
const slotLabel   = computed(() => isForecast.value ? TIME_SLOTS[slot.value]?.label : null)

// Density adjusted by time slot (forecast mode only)
const adjustedZones = computed(() => {
  if (!isForecast.value || !forecastDay.value) return forecastDay.value?.zones ?? []
  return forecastDay.value.zones.map(z => {
    const mult = CROWD_TIME_MULT[z.profile]?.[slot.value] ?? 1.0
    const d    = Math.round(z.predictedDensity * mult)
    return { ...z, predictedDensity: d, intensity: Math.min(d / 5000, 1.0) }
  })
})

const adjustedTotal   = computed(() => adjustedZones.value.reduce((s, z) => s + z.predictedDensity, 0))
const adjustedHotspot = computed(() => adjustedZones.value.length
  ? adjustedZones.value.reduce((m, z) => z.predictedDensity > m.predictedDensity ? z : m).name
  : '—')

const densityFormatted = computed(() => {
  const d = isForecast.value ? adjustedTotal.value : (liveData.value?.density ?? 0)
  return d >= 1000 ? (d / 1000).toFixed(1) + 'K' : String(d)
})

const displayHotspot = computed(() => isForecast.value ? adjustedHotspot.value : liveData.value?.hotspot ?? '—')

// Italian labels for the backend's English status enum (Low/Moderate/High)
const STATUS_LABELS: Record<string, string> = { Low: 'Bassa', Moderate: 'Moderata', High: 'Alta' }
const statusLabel = computed(() => STATUS_LABELS[liveData.value?.status ?? 'High'] ?? liveData.value?.status)

const chartData = computed(() => {
  if (isForecast.value && layerStore.forecastData) {
    return {
      labels: layerStore.forecastData.map(d => d.dayLabel.split(' ').slice(0, 2).join(' ')),
      datasets: [{
        data: layerStore.forecastData.map(d => Math.round(d.crowd.totalDensity / 1000)),
        backgroundColor: layerStore.forecastData.map(d =>
          d.isHoliday ? 'rgba(239,68,68,0.7)' : d.isWeekend ? 'rgba(234,179,8,0.7)' : 'rgba(168,85,247,0.7)'
        ),
        borderColor: layerStore.forecastData.map(d =>
          d.isHoliday ? '#ef4444' : d.isWeekend ? '#eab308' : '#a855f7'
        ),
        borderWidth: 2, borderRadius: 5,
      }]
    }
  }
  return {
    labels: liveData.value?.trendLabels ?? [],
    datasets: [{ data: liveData.value?.trendData ?? [], borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.15)', fill: true, tension: 0.4 }]
  }
})

const getChartOptions = () => ({
  responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
    y: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: (v: any) => isForecast.value ? v + 'K' : v } }
  }
})
</script>

<template>
  <BasePanel :isExpanded="isExpanded" :isLoading="isLoading" borderColorClass="border-purple-500/20" hoverColorClass="hover:text-purple-500" @toggle="emit('toggle')">
    <template #header-icon><Users class="w-3 h-3 md:w-5 md:h-5 text-purple-500" /></template>
    <template #header-title>Densità folla</template>
    <template #status-badge>
      <span v-if="isForecast" class="px-1.5 py-0.5 md:px-2 md:py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[8px] md:text-[10px] font-bold rounded-md md:rounded-lg border border-orange-500/20 uppercase">{{ slotLabel ?? 'Previsione' }}</span>
      <span v-else class="px-1.5 py-0.5 md:px-2 md:py-0.5 bg-red-500/10 text-red-500 text-[8px] md:text-[10px] font-bold rounded-md md:rounded-lg border border-red-500/20 uppercase">{{ statusLabel }}</span>
    </template>
    <template #main-value>{{ densityFormatted }}</template>
    <template #main-unit>{{ isForecast ? 'PREVISTO' : 'PERSONE / KM²' }}</template>
    <template #secondary-metrics>
      <div class="flex items-center gap-0.5 md:gap-1.5 text-slate-500 dark:text-slate-400">
        <Building class="w-2 h-2 md:w-4 md:h-4 text-purple-500" />
        <span class="text-[8px] md:text-xs font-medium truncate">{{ displayHotspot }}</span>
      </div>
      <div v-if="!isForecast" class="flex items-center gap-0.5 md:gap-1 text-red-500 font-medium">
        <TrendingUp class="w-2 h-2 md:w-3.5 md:h-3.5" />
        <span class="text-[8px] md:text-xs truncate">{{ liveData?.trend ?? '—' }}</span>
      </div>
    </template>
    <template #chart-title>
      <Activity class="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
      {{ isForecast ? 'Densità città 7 giorni (×1000 p/km²)' : 'Andamento densità' }}
    </template>
    <template #chart>
      <Bar v-if="isForecast" :data="chartData" :options="getChartOptions()" />
      <Line v-else :data="chartData" :options="getChartOptions()" />
    </template>
  </BasePanel>
</template>
