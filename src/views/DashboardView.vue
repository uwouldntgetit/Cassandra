<script setup lang="ts">
import { ref } from 'vue'

import TopBar from '../components/TopBar.vue'
import SideMenu from '../components/SideMenu.vue'
import DataPanel from '../components/DataPanel.vue'
import InteractiveMap from '../components/InteractiveMap.vue'

defineProps<{ isDark: boolean }>()
const emit = defineEmits(['toggle-theme', 'open-login', 'open-settings', 'open-about'])

const mapRef = ref<InstanceType<typeof InteractiveMap> | null>(null)

const handleMapFly = (lat: number, lon: number) => {
  if (mapRef.value) {
    mapRef.value.flyTo(lat, lon)
  }
}
</script>

<template>
  <div class="relative w-full h-full">
    <!-- Background Interactive Map -->
    <InteractiveMap ref="mapRef" :isDark="isDark" class="absolute inset-0 z-0" />

    <!-- Navigation and Overlay Components -->
    <TopBar @fly-to="handleMapFly" />
    <DataPanel />
    <SideMenu 
      :isDark="isDark" 
      @toggle-theme="emit('toggle-theme')" 
      @open-login="emit('open-login')" 
      @open-settings="emit('open-settings')" 
      @open-about="emit('open-about')" 
    />
  </div>
</template>
