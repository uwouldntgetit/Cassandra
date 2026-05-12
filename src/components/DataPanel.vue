<script setup lang="ts">
/**
 * DataPanel.vue
 * Coordinator component for displaying active data panels.
 * Renders individual layer panels via a TransitionGroup based on the layerStore state.
 * 
 * Componente coordinatore per la visualizzazione dei pannelli dati attivi.
 * Renderizza i singoli pannelli dei layer tramite un TransitionGroup in base allo stato del layerStore.
 */
import { ref, computed } from 'vue'
import { useLayerStore } from '../stores/layerStore'

import WeatherPanel from './panels/WeatherPanel.vue'
import TrafficPanel from './panels/TrafficPanel.vue'
import LightingPanel from './panels/LightingPanel.vue'
import CrowdPanel from './panels/CrowdPanel.vue'

const layerStore = useLayerStore()

type PanelType = 'weather' | 'traffic' | 'lighting' | 'crowd'
const expandedPanel = ref<PanelType | null>(null)

const togglePanel = (panel: PanelType) => {
  expandedPanel.value = expandedPanel.value === panel ? null : panel
}

const hasActiveLayers = computed(() => {
  return layerStore.activeLayers.weather || layerStore.activeLayers.traffic || 
         layerStore.activeLayers.lighting || layerStore.activeLayers.crowd
})
</script>

<template>
  <!-- Main Container: fixed width to accommodate the custom scrollbar -->
  <div 
    v-show="hasActiveLayers"
    class="absolute left-6 right-6 bottom-6 md:bottom-auto md:left-6 md:right-auto md:top-1/2 md:-translate-y-1/2 z-40 md:w-[350px] max-h-[35vh] md:max-h-[70vh] flex flex-col pointer-events-none"
  >
    <!-- RTL direction shifts the scrollbar to the left side on desktop, padding creates visual separation -->
    <TransitionGroup 
      name="panel" 
      tag="div" 
      class="flex flex-row md:flex-col gap-3 md:gap-4 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto custom-scrollbar md:px-0 py-2 md:py-1 md:pr-1 md:pl-4 pointer-events-auto"
    >
      <WeatherPanel 
        v-if="layerStore.activeLayers.weather" 
        key="weather"
        :isExpanded="expandedPanel === 'weather'"
        @toggle="togglePanel('weather')"
      />
      
      <TrafficPanel 
        v-if="layerStore.activeLayers.traffic" 
        key="traffic"
        :isExpanded="expandedPanel === 'traffic'"
        @toggle="togglePanel('traffic')"
      />
      
      <LightingPanel 
        v-if="layerStore.activeLayers.lighting" 
        key="lighting"
        :isExpanded="expandedPanel === 'lighting'"
        @toggle="togglePanel('lighting')"
      />
      
      <CrowdPanel 
        v-if="layerStore.activeLayers.crowd" 
        key="crowd"
        :isExpanded="expandedPanel === 'crowd'"
        @toggle="togglePanel('crowd')"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.panel-move,
.panel-enter-active, 
.panel-leave-active { 
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); 
  transform-origin: center center; 
  max-height: 600px; 
  max-width: 600px;
}

.panel-enter-from, 
.panel-leave-to { 
  opacity: 0; 
  transform: translateX(-30px) scale(0.5); 
}

@media (min-width: 768px) {
  .panel-leave-to {
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
    border: none;
    margin-bottom: -16px; 
    overflow: hidden;
  }
}

@media (max-width: 767px) {
  .panel-leave-to {
    max-width: 0;
    padding-left: 0;
    padding-right: 0;
    border: none;
    margin-right: -12px; 
    overflow: hidden;
  }
}

.custom-scrollbar {
  direction: rtl;
}

@media (max-width: 767px) {
  .custom-scrollbar {
    direction: ltr;
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  margin-top: 8px;
  margin-bottom: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.4);
  border-radius: 20px;
}

@media (prefers-color-scheme: dark) {
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
  }
}
</style>