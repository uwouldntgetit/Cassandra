<script setup lang="ts">
import { computed } from 'vue'
import { Lightbulb, Activity, Zap, Moon } from 'lucide-vue-next'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import BasePanel from './BasePanel.vue'
import { useLayerStore } from '../../stores/layerStore'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

defineProps<{ isExpanded: boolean, isLoading: boolean }>()
const emit = defineEmits(['toggle'])

const layerStore = useLayerStore()
const data = computed(() => layerStore.layerData.lighting)

const chartData = computed(() => ({
  labels: data.value?.trendLabels ?? [],
  datasets: [{ data: data.value?.trendData ?? [], borderColor: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.15)', fill: true, tension: 0.4 }]
}))

const getChartOptions = () => ({
  responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }, y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8', font: { size: 10 } } } }
})
</script>

<template>
  <BasePanel :isExpanded="isExpanded" :isLoading="isLoading" borderColorClass="border-yellow-500/20" hoverColorClass="hover:text-yellow-500" @toggle="emit('toggle')">
    <template #header-icon><Lightbulb class="w-3 h-3 md:w-5 md:h-5 text-yellow-500" /></template>
    <template #header-title>Smart Lighting</template>
    <template #status-badge>
      <span class="px-1.5 py-0.5 md:px-2 md:py-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[8px] md:text-[10px] font-bold rounded-md md:rounded-lg border border-yellow-500/20 uppercase">{{ data?.status ?? 'Active' }}</span>
    </template>
    <template #main-value>{{ data?.coverage ?? '—' }}%</template>
    <template #main-unit>COVERAGE</template>
    <template #secondary-metrics>
      <div class="flex items-center gap-0.5 md:gap-1.5 text-slate-500 dark:text-slate-400"><Zap class="w-2 h-2 md:w-4 md:h-4 text-yellow-500" /> <span class="text-[8px] md:text-xs font-medium truncate">{{ data?.energySaved ?? '—' }} kWh Saved</span></div>
      <div class="flex items-center gap-0.5 md:gap-1 text-slate-500 dark:text-slate-400"><Moon class="w-2 h-2 md:w-3.5 md:h-3.5" /> <span class="text-[8px] md:text-xs font-medium truncate">Auto-Dim</span></div>
    </template>
    <template #chart-title><Activity class="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /> Power Usage & Dimming</template>
    <template #chart><Line :data="chartData" :options="getChartOptions()" /></template>
  </BasePanel>
</template>
