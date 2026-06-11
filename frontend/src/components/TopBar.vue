<script setup lang="ts">
/**
 * TopBar.vue
 * Top navigation bar providing location search and map layer toggles.
 * Interfaces with the Nominatim API for geocoding search results.
 * 
 * Barra di navigazione superiore con ricerca località e toggle per i layer della mappa.
 * Si interfaccia con l'API Nominatim per i risultati di geocodifica della ricerca.
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { Search, Layers, Loader2, MapPin, AlertCircle, Star, Eye, EyeOff, Bell, BellRing, X, CheckCircle2, TriangleAlert } from 'lucide-vue-next'
import { useLayerStore } from '../stores/layerStore'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'

const layerStore = useLayerStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const emit = defineEmits(['fly-to'])

const showLayersMenu = ref(false)
const showFavoritesMenu = ref(false)
const showNotificationsMenu = ref(false)
const searchQuery = ref('')
const isSearching = ref(false)
const searchResults = ref<any[]>([])
const noResults = ref(false) 

const showWarningModal = ref(false)
const pendingLayer = ref<string>('')
const dontShowAgain = ref(false)

const topBarRef = ref<HTMLElement | null>(null)

const handleInput = () => {
  noResults.value = false
  showLayersMenu.value = false
  showFavoritesMenu.value = false
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  showLayersMenu.value = false
  showFavoritesMenu.value = false
  isSearching.value = true
  noResults.value = false
  searchResults.value = [] 
  
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value + ' Trento')}`
    const response = await fetch(url)
    const data = await response.json()
    if (data && data.length > 0) searchResults.value = data
    else noResults.value = true
  } catch (error) {
    console.error("Errore API:", error)
    noResults.value = true
  } finally {
    isSearching.value = false
  }
}

const selectLocation = (lat: string | number, lon: string | number, name: string) => {
  emit('fly-to', Number(lat), Number(lon))
  searchQuery.value = name.split(',')[0]
  searchResults.value = []
  noResults.value = false
}

const closeDropdowns = () => {
  showLayersMenu.value = false
  showFavoritesMenu.value = false
  showNotificationsMenu.value = false
  searchResults.value = []
  noResults.value = false
}

const toggleNotificationsMenu = () => {
  const willShow = !showNotificationsMenu.value
  closeDropdowns()
  showNotificationsMenu.value = willShow
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const toggleFavoritesMenu = () => {
  const willShow = !showFavoritesMenu.value
  closeDropdowns()
  showFavoritesMenu.value = willShow
}

const toggleLayersMenu = () => {
  const willShow = !showLayersMenu.value
  closeDropdowns()
  showLayersMenu.value = willShow
}

const handleLayerToggle = (layer: keyof typeof layerStore.activeLayers) => {
  if ((layer === 'crowd' && layerStore.activeLayers.lighting && !layerStore.activeLayers.crowd) ||
      (layer === 'lighting' && layerStore.activeLayers.crowd && !layerStore.activeLayers.lighting)) {
    
    const hideWarning = localStorage.getItem('hideLayerWarning') === 'true'
    
    if (!hideWarning) {
      pendingLayer.value = layer
      dontShowAgain.value = false
      showWarningModal.value = true
      closeDropdowns()
      return
    }
  }
  
  layerStore.toggleLayer(layer)
}

const confirmToggle = () => {
  if (dontShowAgain.value) {
    localStorage.setItem('hideLayerWarning', 'true')
  }
  if (pendingLayer.value) {
    layerStore.toggleLayer(pendingLayer.value as keyof typeof layerStore.activeLayers)
  }
  showWarningModal.value = false
  pendingLayer.value = ''
}

const cancelToggle = () => {
  showWarningModal.value = false
  pendingLayer.value = ''
}

const toggleFavoriteResult = (res: any, event: Event) => {
  event.stopPropagation()
  if (!authStore.isLoggedIn) {
    alert("Log in to save favorites")
    return
  }
  authStore.toggleFavorite({
    lat: parseFloat(res.lat),
    lon: parseFloat(res.lon),
    name: res.display_name.split(',')[0],
    display_name: res.display_name
  })
}

const handleClickOutside = (event: MouseEvent) => {
  if (topBarRef.value && !topBarRef.value.contains(event.target as Node)) {
    closeDropdowns()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  notificationStore.startPolling()
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  notificationStore.stopPolling()
})
</script>

<template>
  <div ref="topBarRef" class="absolute top-0 left-0 right-0 p-2 pr-20 md:p-4 md:p-6 pointer-events-auto z-10">
    <div class="max-w-3xl mx-auto flex flex-row items-center gap-1.5 md:gap-3">
      
      <!-- Search Bar -->
      <div class="flex-1 relative group order-3 md:order-1">
        <Loader2 v-if="isSearching" class="absolute left-2.5 md:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-500 animate-spin" />
        <Search v-else class="absolute left-2.5 md:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-600 dark:text-cyan-400" />
        
        <input 
          type="text" 
          v-model="searchQuery"
          @input="handleInput"
          @keyup.enter.prevent="handleSearch"
          placeholder="Search locations..." 
          class="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2.5 text-xs md:text-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 hover:border-cyan-500/60 rounded-lg md:rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-slate-900 dark:text-slate-100" 
        />

        <div v-if="searchResults.length > 0 || noResults" class="absolute top-full mt-2 left-0 w-full bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl rounded-xl shadow-xl border border-cyan-500/20 z-50 overflow-hidden">
          <ul v-if="searchResults.length > 0" class="max-h-60 overflow-y-auto">
            <li v-for="res in searchResults" :key="res.place_id">
              <div class="w-full flex items-center justify-between px-4 py-3 hover:bg-cyan-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer" @click="selectLocation(res.lat, res.lon, res.display_name)">
                <div class="flex items-start gap-3 w-full overflow-hidden">
                  <MapPin class="w-4 h-4 mt-0.5 text-cyan-500 flex-shrink-0" />
                  <div class="flex-1 min-w-0 pr-2">
                    <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ res.display_name.split(',')[0] }}</p>
                    <p class="text-xs text-slate-500 line-clamp-1">{{ res.display_name }}</p>
                  </div>
                </div>
                <button @click.stop="toggleFavoriteResult(res, $event)" class="p-2 -mr-2 text-slate-300 hover:text-amber-400 transition-colors" title="Toggle Favorite">
                  <Star :class="['w-5 h-5 transition-all', authStore.isFavorite(res.display_name.split(',')[0], parseFloat(res.lat), parseFloat(res.lon)) ? 'fill-amber-400 text-amber-400' : '']" />
                </button>
              </div>
            </li>
          </ul>
          <div v-else-if="noResults" class="px-4 py-6 text-center">
            <AlertCircle class="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p class="text-sm font-bold text-slate-900 dark:text-white">No results found</p>
            <p class="text-xs text-slate-500 mt-1">Try checking your spelling or use more generic terms.</p>
          </div>
        </div>
      </div>

      <!-- Favorites Dropdown -->
      <div class="relative order-1 md:order-2 shrink-0">
        <button @click="toggleFavoritesMenu" class="flex items-center justify-center p-1.5 md:px-3.5 md:py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 hover:border-cyan-500/60 rounded-lg md:rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 active:scale-95" title="Favorites">
          <Star class="w-4 h-4 md:w-5 md:h-5 text-amber-500 drop-shadow-sm" />
        </button>
        
        <div v-if="showFavoritesMenu" class="absolute top-full mt-2 left-0 md:left-1/2 md:-translate-x-1/2 w-48 md:w-72 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl rounded-lg md:rounded-xl shadow-xl border border-cyan-500/20 z-50 overflow-hidden">
          <div v-if="!authStore.isLoggedIn" class="p-4 md:p-6 text-center">
            <Star class="w-4 h-4 md:w-6 md:h-6 text-slate-300 mx-auto mb-1 md:mb-2" />
            <p class="text-xs md:text-sm font-bold text-slate-900 dark:text-white">Log in to save favorites</p>
          </div>
          <div v-else-if="authStore.user?.favorites?.length === 0" class="p-4 md:p-6 text-center">
            <Star class="w-4 h-4 md:w-6 md:h-6 text-slate-300 mx-auto mb-1 md:mb-2" />
            <p class="text-xs md:text-sm font-bold text-slate-900 dark:text-white">No favorites yet</p>
            <p class="text-[10px] md:text-xs text-slate-500 mt-1">Search for a place and click the star to add it.</p>
          </div>
          <ul v-else class="max-h-60 overflow-y-auto">
            <li v-for="fav in authStore.user?.favorites" :key="fav.lat + fav.lon">
              <div class="w-full flex items-center justify-between px-3 py-2 md:px-4 md:py-3 hover:bg-cyan-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer" @click="selectLocation(fav.lat, fav.lon, fav.display_name)">
                <div class="flex items-start gap-2 md:gap-3 w-full overflow-hidden">
                  <Star class="w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                  <div class="flex-1 min-w-0 pr-2">
                    <p class="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate">{{ fav.name }}</p>
                    <p class="text-[10px] md:text-xs text-slate-500 line-clamp-1">{{ fav.display_name }}</p>
                  </div>
                </div>
                <button @click.stop="authStore.toggleFavorite(fav)" class="p-1 md:p-2 -mr-1 md:-mr-2 text-amber-400 hover:text-slate-400 transition-colors" title="Remove Favorite">
                  <Star class="w-3.5 h-3.5 md:w-4 md:h-4 fill-amber-400" />
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Notifications Bell -->
      <div class="relative order-2 md:order-3 shrink-0">
        <button @click="toggleNotificationsMenu" class="relative flex items-center justify-center p-1.5 md:px-3.5 md:py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 hover:border-cyan-500/60 rounded-lg md:rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 active:scale-95" title="Notifications">
          <BellRing v-if="notificationStore.unreadCount > 0" class="w-4 h-4 md:w-5 md:h-5 text-red-500 animate-[bell-ring_1s_ease-in-out_infinite]" />
          <Bell v-else class="w-4 h-4 md:w-5 md:h-5 text-slate-500 dark:text-slate-400" />
          <span v-if="notificationStore.unreadCount > 0" class="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 shadow-md">
            {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
          </span>
        </button>

        <div v-if="showNotificationsMenu" class="absolute top-full mt-2 right-0 w-72 md:w-80 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl rounded-xl shadow-xl border border-cyan-500/20 z-50 overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <span class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell class="w-4 h-4 text-cyan-500" />
              Notifications
              <span v-if="notificationStore.unreadCount > 0" class="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full">{{ notificationStore.unreadCount }}</span>
            </span>
            <button v-if="notificationStore.active.length > 0" @click="notificationStore.dismissAll()" class="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium transition-colors">
              Dismiss all
            </button>
          </div>

          <!-- Lista notifiche -->
          <div class="max-h-72 overflow-y-auto">
            <!-- Empty state -->
            <div v-if="notificationStore.active.length === 0" class="py-8 px-4 text-center">
              <CheckCircle2 class="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p class="text-sm font-bold text-slate-900 dark:text-white">All clear!</p>
              <p class="text-xs text-slate-500 mt-1">No active alerts at the moment.</p>
            </div>

            <!-- Notifica -->
            <div
              v-for="n in notificationStore.active"
              :key="n._id"
              class="flex items-start gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <!-- Icona tipo -->
              <div class="shrink-0 mt-0.5">
                <CheckCircle2 v-if="n.type === 'success'" class="w-4 h-4 text-emerald-500" />
                <TriangleAlert v-else-if="n.type === 'error'" class="w-4 h-4 text-red-500" />
                <TriangleAlert v-else class="w-4 h-4 text-amber-500" />
              </div>

              <!-- Contenuto -->
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">{{ n.message }}</p>
                <div class="flex items-center gap-1.5 mt-1">
                  <span :class="[
                    'text-[9px] font-bold px-1.5 py-0.5 rounded uppercase',
                    n.status === 'Resolved'      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                    n.status === 'Investigating' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                                                   'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  ]">{{ n.status }}</span>
                  <span class="text-[10px] text-slate-400">{{ timeAgo(n.createdAt) }}</span>
                </div>
              </div>

              <!-- Dismiss -->
              <button @click.stop="notificationStore.dismiss(n._id)" class="shrink-0 p-1 text-slate-300 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded">
                <X class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Layers Dropdown -->
      <div class="relative order-3 md:order-4 shrink-0">
        <button @click="toggleLayersMenu" class="flex items-center gap-1.5 p-1.5 md:px-5 md:py-2.5 text-xs md:text-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 hover:border-cyan-500/60 rounded-lg md:rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 active:scale-95">
          <Layers class="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span class="hidden md:inline">Layers</span>
        </button>
        
        <div v-if="showLayersMenu" class="absolute top-full mt-2 left-0 md:left-1/2 md:-translate-x-1/2 w-48 md:w-64 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl rounded-lg md:rounded-xl shadow-xl border border-cyan-500/20 z-50 p-1 md:p-1.5 flex flex-col gap-0.5 md:gap-1">
          
          <!-- Global Toggles -->
          <div class="flex items-center gap-1 mb-1 pb-1 border-b border-cyan-500/10 dark:border-slate-700/50">
            <button @click="layerStore.setAllLayers(true)" class="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] md:text-xs rounded-md hover:bg-cyan-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300 font-medium uppercase tracking-wider">
              <Eye class="w-3 h-3 text-cyan-500" />
              <span>Show All</span>
            </button>
            <button @click="layerStore.setAllLayers(false)" class="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] md:text-xs rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300 font-medium uppercase tracking-wider">
              <EyeOff class="w-3 h-3 text-slate-400" />
              <span>Hide All</span>
            </button>
          </div>
          
          <!-- Weather -->
          <button @click="handleLayerToggle('weather')" class="w-full flex items-center justify-between px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm rounded-md md:rounded-lg hover:bg-cyan-50 dark:hover:bg-slate-800 transition-all text-slate-900 dark:text-slate-100">
            <span class="flex items-center gap-2 md:gap-2.5"><div :class="['w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-sky-500', layerStore.activeLayers.weather ? 'opacity-100' : 'opacity-30']"></div>Weather</span>
            <div :class="['w-6 h-3 md:w-8 md:h-4 rounded-full flex items-center px-0.5 md:px-1 transition-all', layerStore.activeLayers.weather ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700']"><div :class="['w-2 h-2 md:w-2.5 md:h-2.5 bg-white rounded-full transition-all transform', layerStore.activeLayers.weather ? 'translate-x-3 md:translate-x-3.5' : 'translate-x-0']"></div></div>
          </button>
          
          <!-- Traffic -->
          <button @click="handleLayerToggle('traffic')" class="w-full flex items-center justify-between px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm rounded-md md:rounded-lg hover:bg-cyan-50 dark:hover:bg-slate-800 transition-all text-slate-900 dark:text-slate-100">
            <span class="flex items-center gap-2 md:gap-2.5"><div :class="['w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-orange-500', layerStore.activeLayers.traffic ? 'opacity-100' : 'opacity-30']"></div>Traffic Flow</span>
            <div :class="['w-6 h-3 md:w-8 md:h-4 rounded-full flex items-center px-0.5 md:px-1 transition-all', layerStore.activeLayers.traffic ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700']"><div :class="['w-2 h-2 md:w-2.5 md:h-2.5 bg-white rounded-full transition-all transform', layerStore.activeLayers.traffic ? 'translate-x-3 md:translate-x-3.5' : 'translate-x-0']"></div></div>
          </button>

          <!-- Lighting -->
          <button @click="handleLayerToggle('lighting')" class="w-full flex items-center justify-between px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm rounded-md md:rounded-lg hover:bg-cyan-50 dark:hover:bg-slate-800 transition-all text-slate-900 dark:text-slate-100">
            <span class="flex items-center gap-2 md:gap-2.5"><div :class="['w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-yellow-500', layerStore.activeLayers.lighting ? 'opacity-100' : 'opacity-30']"></div>Smart Lighting</span>
            <div :class="['w-6 h-3 md:w-8 md:h-4 rounded-full flex items-center px-0.5 md:px-1 transition-all', layerStore.activeLayers.lighting ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700']"><div :class="['w-2 h-2 md:w-2.5 md:h-2.5 bg-white rounded-full transition-all transform', layerStore.activeLayers.lighting ? 'translate-x-3 md:translate-x-3.5' : 'translate-x-0']"></div></div>
          </button>

          <!-- Crowd Density -->
          <button @click="handleLayerToggle('crowd')" class="w-full flex items-center justify-between px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm rounded-md md:rounded-lg hover:bg-cyan-50 dark:hover:bg-slate-800 transition-all text-slate-900 dark:text-slate-100">
            <span class="flex items-center gap-2 md:gap-2.5"><div :class="['w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-purple-500', layerStore.activeLayers.crowd ? 'opacity-100' : 'opacity-30']"></div>Crowd Density</span>
            <div :class="['w-6 h-3 md:w-8 md:h-4 rounded-full flex items-center px-0.5 md:px-1 transition-all', layerStore.activeLayers.crowd ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700']"><div :class="['w-2 h-2 md:w-2.5 md:h-2.5 bg-white rounded-full transition-all transform', layerStore.activeLayers.crowd ? 'translate-x-3 md:translate-x-3.5' : 'translate-x-0']"></div></div>
          </button>

        </div>
      </div>

    </div>
  </div>

  <!-- Layer Conflict Warning Modal -->
  <div v-if="showWarningModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 pointer-events-auto">
    <div class="bg-white dark:bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
      <div class="p-6">
        <div class="flex items-center gap-3 mb-4 text-amber-500">
          <AlertCircle class="w-6 h-6" />
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Layer Overlap Warning</h3>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          Visualizing both Crowd Density and Smart Lighting simultaneously might be confusing as their heatmaps can overlap.
        </p>
        
        <label class="flex items-center gap-3 mb-6 cursor-pointer group w-max">
          <input type="checkbox" v-model="dontShowAgain" class="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-cyan-500 focus:ring-cyan-500 dark:bg-slate-800" />
          <span class="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Don't show this again</span>
        </label>

        <div class="flex justify-end gap-3">
          <button @click="cancelToggle" class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            Cancel
          </button>
          <button @click="confirmToggle" class="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-lg shadow-cyan-500/30 transition-colors">
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>