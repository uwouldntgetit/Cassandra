<script setup lang="ts">
/**
 * Route panel (RF7): computes the road route between two places.
 * Geocodes origin and destination via Nominatim, then asks the backend
 * (/api/v1/routing), which computes the route via OSRM.
 * The destination can arrive from the search bar (`initialDest` prop): in that
 * case, if the origin is already set, the route is computed automatically.
 */
import { ref, watch } from 'vue'
import { Navigation, X, Loader2, MapPin, AlertCircle, Clock, Route, LocateFixed } from 'lucide-vue-next'
import { apiFetch } from '../services/api'

interface Place { lat: number; lon: number; label: string }
type Field = 'origin' | 'dest'

const props = defineProps<{ initialDest?: Place | null }>()
const emit = defineEmits(['draw', 'clear', 'close'])

const query    = ref<Record<Field, string>>({ origin: '', dest: '' })
const selected = ref<Record<Field, Place | null>>({ origin: null, dest: null })
const results  = ref<Record<Field, any[]>>({ origin: [], dest: [] })
const searching = ref<Field | null>(null)
const locating  = ref(false)

const isCalculating = ref(false)
const errorMsg = ref('')
const summary  = ref<{ distance: string; duration: string } | null>(null)

// Destination set from the search bar: prefill and, if possible, compute the route
watch(() => props.initialDest, (dest) => {
  if (!dest) return
  selected.value.dest = dest
  query.value.dest = dest.label
  results.value.dest = []
  summary.value = null
  if (selected.value.origin) calculateRoute()
})

const geocode = async (field: Field) => {
  if (!query.value[field].trim()) return
  searching.value = field
  errorMsg.value = ''
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.value[field] + ' Trento')}`
    const data = await (await fetch(url)).json()
    results.value[field] = Array.isArray(data) ? data : []
    if (!results.value[field].length) errorMsg.value = 'Nessuna località trovata.'
  } catch {
    errorMsg.value = 'Errore nella ricerca della località.'
  } finally {
    searching.value = null
  }
}

const pick = (field: Field, res: any) => {
  selected.value[field] = { lat: parseFloat(res.lat), lon: parseFloat(res.lon), label: res.display_name.split(',')[0] }
  query.value[field] = selected.value[field]!.label
  results.value[field] = []
  summary.value = null
}

// Use the browser location as the origin
const useMyLocation = () => {
  if (!navigator.geolocation) { errorMsg.value = 'Geolocalizzazione non disponibile.'; return }
  locating.value = true
  errorMsg.value = ''
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      selected.value.origin = { lat: pos.coords.latitude, lon: pos.coords.longitude, label: 'La mia posizione' }
      query.value.origin = 'La mia posizione'
      results.value.origin = []
      locating.value = false
      if (selected.value.dest) calculateRoute()
    },
    () => { locating.value = false; errorMsg.value = 'Impossibile ottenere la posizione.' },
    { enableHighAccuracy: true, timeout: 8000 }
  )
}

const formatDuration = (sec: number) => {
  const min = Math.round(sec / 60)
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)} h ${min % 60} min`
}

const calculateRoute = async () => {
  if (!selected.value.origin || !selected.value.dest) return
  isCalculating.value = true
  errorMsg.value = ''
  summary.value = null
  try {
    const params = new URLSearchParams({
      fromLat: String(selected.value.origin.lat), fromLon: String(selected.value.origin.lon),
      toLat:   String(selected.value.dest.lat),   toLon:   String(selected.value.dest.lon)
    })
    const res  = await apiFetch(`/api/v1/routing?${params}`)
    const data = await res.json()
    if (!res.ok || !data.success) {
      errorMsg.value = res.status === 404 ? 'Nessun percorso trovato tra i due punti.' : 'Servizio di routing non disponibile.'
      return
    }
    summary.value = {
      distance: data.distance >= 1000 ? `${(data.distance / 1000).toFixed(1)} km` : `${data.distance} m`,
      duration: formatDuration(data.duration)
    }
    emit('draw', { coordinates: data.geometry.coordinates, from: selected.value.origin, to: selected.value.dest })
  } catch {
    errorMsg.value = 'Servizio di routing non disponibile.'
  } finally {
    isCalculating.value = false
  }
}

const reset = () => {
  query.value = { origin: '', dest: '' }
  selected.value = { origin: null, dest: null }
  results.value = { origin: [], dest: [] }
  summary.value = null
  errorMsg.value = ''
  emit('clear')
}
</script>

<template>
  <div class="absolute top-16 md:top-24 left-1/2 -translate-x-1/2 z-[600] w-[90vw] max-w-sm bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-500/20 overflow-hidden pointer-events-auto">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
      <span class="flex items-center gap-2 font-bold text-sm"><Navigation class="w-4 h-4" /> Calcola percorso</span>
      <button @click="emit('close')" class="text-white/80 hover:text-white transition-colors" title="Chiudi (il percorso resta sulla mappa)"><X class="w-5 h-5" /></button>
    </div>

    <div class="p-4 space-y-3">
      <!-- Origin / destination fields -->
      <div v-for="field in (['origin', 'dest'] as const)" :key="field" class="relative">
        <div class="relative">
          <MapPin :class="['absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4', field === 'origin' ? 'text-emerald-500' : 'text-red-500']" />
          <input
            v-model="query[field]"
            @keyup.enter.prevent="geocode(field)"
            :placeholder="field === 'origin' ? 'Partenza...' : 'Destinazione...'"
            class="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-slate-100"
          />
          <Loader2 v-if="searching === field" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500 animate-spin" />
          <!-- "Use my location" only on the origin field -->
          <button
            v-else-if="field === 'origin'"
            @click="useMyLocation"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 transition-colors"
            title="Usa la mia posizione"
          >
            <Loader2 v-if="locating" class="w-4 h-4 animate-spin text-cyan-500" />
            <LocateFixed v-else class="w-4 h-4" />
          </button>
        </div>

        <!-- Geocoding results -->
        <ul v-if="results[field].length > 0" class="absolute z-10 mt-1 w-full max-h-44 overflow-y-auto bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-cyan-500/20">
          <li
            v-for="res in results[field]"
            :key="res.place_id"
            @click="pick(field, res)"
            class="px-3 py-2 hover:bg-cyan-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0"
          >
            <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ res.display_name.split(',')[0] }}</p>
            <p class="text-[10px] text-slate-500 line-clamp-1">{{ res.display_name }}</p>
          </li>
        </ul>
      </div>

      <!-- Error -->
      <p v-if="errorMsg" class="flex items-center gap-1.5 text-xs text-red-500"><AlertCircle class="w-3.5 h-3.5" /> {{ errorMsg }}</p>

      <!-- Route summary -->
      <div v-if="summary" class="flex items-center justify-around py-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
        <span class="flex items-center gap-1.5 text-sm font-bold text-cyan-700 dark:text-cyan-300"><Route class="w-4 h-4" /> {{ summary.distance }}</span>
        <span class="flex items-center gap-1.5 text-sm font-bold text-cyan-700 dark:text-cyan-300"><Clock class="w-4 h-4" /> {{ summary.duration }}</span>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <button
          @click="calculateRoute"
          :disabled="!selected.origin || !selected.dest || isCalculating"
          class="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-cyan-500/30 transition-colors"
        >
          <Loader2 v-if="isCalculating" class="w-4 h-4 animate-spin" />
          <Navigation v-else class="w-4 h-4" />
          Calcola
        </button>
        <button
          @click="reset"
          class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          Pulisci
        </button>
      </div>
    </div>
  </div>
</template>
