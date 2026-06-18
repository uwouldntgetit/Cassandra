<script setup lang="ts">
import { ref } from 'vue'

import TopBar from '../components/TopBar.vue'
import SideMenu from '../components/SideMenu.vue'
import DataPanel from '../components/DataPanel.vue'
import InteractiveMap from '../components/InteractiveMap.vue'
import RoutePanel from '../components/RoutePanel.vue'

defineProps<{ isDark: boolean }>()
const emit = defineEmits(['toggle-theme', 'open-login', 'open-settings', 'open-about'])

const mapRef = ref<InstanceType<typeof InteractiveMap> | null>(null)
const showDirections = ref(false)

interface Place { lat: number; lon: number; label: string }
// Destination chosen from the search bar: passed to RoutePanel, which prefills it
const routeDestination = ref<Place | null>(null)

const handleMapFly = (lat: number, lon: number) => {
  if (mapRef.value) {
    mapRef.value.flyTo(lat, lon)
  }
}

interface RoutePayload {
  coordinates: [number, number][]
  from: Place
  to:   Place
}

const handleDrawRoute = (payload: RoutePayload) => {
  mapRef.value?.drawRoute(payload.coordinates, payload.from, payload.to)
}

// From a search result: open the panel with that destination
const handleDirectionsTo = (place: Place) => {
  routeDestination.value = { ...place }   // new reference → RoutePanel always reacts
  showDirections.value = true
  mapRef.value?.flyTo(place.lat, place.lon)
}
</script>

<template>
  <div class="relative w-full h-full">
    <!-- Background Interactive Map -->
    <InteractiveMap ref="mapRef" :isDark="isDark" class="absolute inset-0 z-0" />

    <!-- Navigation and Overlay Components -->
    <TopBar
      @fly-to="handleMapFly"
      @toggle-directions="showDirections = !showDirections"
      @directions-to="handleDirectionsTo"
    />
    <RoutePanel
      v-show="showDirections"
      :initial-dest="routeDestination"
      @draw="handleDrawRoute"
      @clear="mapRef?.clearRoute()"
      @close="showDirections = false"
    />
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
