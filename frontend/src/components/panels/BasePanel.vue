<script setup lang="ts">
/**
 * BasePanel.vue
 * Shared layout component for data panels to eliminate code duplication.
 */
import { ChevronDown } from 'lucide-vue-next'

defineProps<{
  isExpanded: boolean,
  isLoading?: boolean,
  borderColorClass: string,
  hoverColorClass: string
}>()

const emit = defineEmits(['toggle'])
</script>

<template>
  <div style="direction: ltr;" class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl md:rounded-3xl overflow-hidden shrink-0 flex flex-row md:flex-col transition-all duration-300" :class="[`border ${borderColorClass}`, isExpanded ? 'w-[352px] md:w-full' : 'w-44 md:w-full']">
    <!-- Skeleton Loading State -->
    <template v-if="isLoading">
      <div class="w-44 md:w-full shrink-0 p-3 pb-1.5 md:px-5 md:pt-5 md:pb-0 flex flex-col justify-between h-[135px] md:h-auto animate-pulse">
        <div class="flex items-center justify-between md:mb-3">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 md:w-5 md:h-5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            <div class="w-20 h-3 md:h-4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          </div>
          <div class="w-10 h-3 md:w-12 md:h-4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        </div>
        <div class="flex items-baseline gap-1 md:gap-2 md:mb-1">
          <div class="w-12 h-6 md:w-16 md:h-10 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div class="w-8 h-2 md:w-10 md:h-3 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        </div>
        <div class="flex items-center justify-between md:mb-4 md:mt-2">
          <div class="w-16 h-2 md:w-24 md:h-3 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div class="w-12 h-2 md:w-16 md:h-3 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        </div>
        <div class="w-full pt-1.5 md:pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center" :class="isExpanded ? 'md:pb-3' : 'md:pb-0'">
          <div class="w-10 h-2 md:w-12 md:h-3 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div class="w-3 h-3 md:w-4 md:h-4 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>
      </div>
      <div class="transition-all duration-300 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden flex flex-1 min-w-0 md:flex-none md:grid" :class="isExpanded ? 'opacity-100 md:grid-rows-[1fr]' : 'opacity-0 md:grid-rows-[0fr]'">
        <div class="w-full p-2 md:p-5 md:pt-3 h-[135px] md:h-auto flex flex-col justify-center md:block overflow-hidden min-h-0 animate-pulse">
          <div class="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
            <div class="w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            <div class="w-20 h-2 md:w-24 md:h-3 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          </div>
          <div class="h-20 md:h-32 bg-slate-200 dark:bg-slate-700/50 rounded-lg"></div>
        </div>
      </div>
    </template>

    <!-- Actual Content -->
    <template v-else>
      <div class="w-44 md:w-full shrink-0 p-3 pb-1.5 md:px-5 md:pt-5 md:pb-0 flex flex-col justify-between h-[135px] md:h-auto">
        <div class="flex items-center justify-between md:mb-3">
          <div class="flex items-center gap-1.5 md:gap-2 text-slate-800 dark:text-white font-bold text-[10px] md:text-base">
            <slot name="header-icon" /> <span class="truncate"><slot name="header-title" /></span>
          </div>
          <slot name="status-badge" />
        </div>
        <div class="flex items-baseline gap-1 md:gap-2 md:mb-1">
          <span class="text-xl md:text-4xl font-black text-slate-900 dark:text-white"><slot name="main-value" /></span> <span class="text-[8px] md:text-xs font-medium text-slate-500"><slot name="main-unit" /></span>
        </div>
        <div class="flex items-center justify-between md:mb-4 md:mt-2">
          <slot name="secondary-metrics" />
        </div>
        <button @click="emit('toggle')" class="flex items-center justify-between w-full pt-1.5 md:pt-3 border-t border-slate-100 dark:border-slate-800 text-[8px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-colors" :class="[hoverColorClass, isExpanded ? 'md:pb-3' : 'md:pb-0']">
          <span>{{ isExpanded ? 'Hide' : 'Details' }}</span>
          <ChevronDown class="w-3 h-3 md:w-4 md:h-4 transition-transform duration-300" :class="isExpanded ? 'rotate-90 md:rotate-180' : '-rotate-90 md:rotate-0'" />
        </button>
      </div>
      <div class="transition-all duration-300 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden flex flex-1 min-w-0 md:flex-none md:grid" :class="isExpanded ? 'opacity-100 md:grid-rows-[1fr]' : 'opacity-0 md:grid-rows-[0fr]'">
        <div class="w-full p-2 md:p-5 md:pt-3 h-[135px] md:h-auto flex flex-col justify-center md:block overflow-hidden min-h-0">
          <div class="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 text-[9px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <slot name="chart-title" />
          </div>
          <div class="h-20 md:h-32"><slot name="chart" /></div>
        </div>
      </div>
    </template>
  </div>
</template>
