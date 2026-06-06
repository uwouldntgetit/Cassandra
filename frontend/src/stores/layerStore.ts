import { defineStore } from 'pinia'
import { apiFetch } from '../services/api'

const LAYER_REFRESH_MS   = 30_000       // live layers: every 30s
const FORECAST_REFRESH_MS = 5 * 60_000  // forecast: every 5 minutes

const _layerIntervals: Partial<Record<string, ReturnType<typeof setInterval>>> = {}
let   _forecastInterval: ReturnType<typeof setInterval> | null = null

export interface WeatherData {
  aqi: number; status: string; temperature: number; humidity: number; windSpeed: number
  trend: number[]; trendLabels: string[]
  markers: { lat: number; lon: number; type: string; temp: string }[]
}
export interface TrafficData {
  delay: number; status: string; avgSpeed: number; incidents: number
  trend: number[]; trendLabels: string[]
  segments: any
}
export interface CrowdData {
  density: number; status: string; hotspot: string; trend: string
  trendData: number[]; trendLabels: string[]
  heatmapPoints: [number, number, number][]
}
export interface LightingData {
  coverage: number; status: string; energySaved: number
  trendData: number[]; trendLabels: string[]
  heatmapPoints: [number, number, number][]
}
export interface PredictionZone {
  id: string; name: string; lat: number; lon: number; profile: string
  predictedDensity: number; intensity: number; level: 'low' | 'medium' | 'high'
}

export const TIME_SLOTS = [
  { id: 0, label: 'Morning',   icon: '🌅', hour: 8  },
  { id: 1, label: 'Noon',      icon: '☀️', hour: 13 },
  { id: 2, label: 'Evening',   icon: '🌆', hour: 18 },
  { id: 3, label: 'Night',     icon: '🌙', hour: 23 },
]

// Moltiplicatori affollamento per profilo zona × fascia oraria [mattina, mezzogiorno, sera, notte]
export const CROWD_TIME_MULT: Record<string, number[]> = {
  tourist_shopping: [0.45, 1.20, 1.00, 0.10],
  commuter:         [1.80, 0.45, 1.60, 0.05],
  shopping:         [0.35, 1.40, 0.90, 0.10],
  student:          [1.50, 0.90, 0.50, 0.05],
  transit:          [1.60, 0.70, 1.50, 0.10],
  leisure:          [0.25, 0.80, 1.50, 0.55],
  events:           [0.35, 0.90, 1.60, 0.50],
  residential:      [0.70, 0.60, 1.00, 0.95],
}

// Congestione traffico per tipo strada × fascia oraria [mattina, mezzogiorno, sera, notte]
export const TRAFFIC_TIME_CONG: Record<string, string[]> = {
  trunk:     ['high',   'medium', 'high',   'low'],
  primary:   ['medium', 'low',    'medium', 'low'],
  secondary: ['low',    'low',    'medium', 'low'],
}
export interface WeatherForecast {
  tempMax: number; tempMin: number; precipProbability: number
  windSpeed: number; icon: string; description: string
}
export interface TrafficForecast {
  congestionLevel: string; avgSpeed: number; delay: number; segments: any
}
export interface CrowdForecast {
  totalDensity: number; peakZone: string; zones: PredictionZone[]
}
export interface DayForecast {
  date: string; dayLabel: string; isHoliday: boolean; isWeekend: boolean
  weather: WeatherForecast; traffic: TrafficForecast; crowd: CrowdForecast
}

type LayerKey = 'weather' | 'traffic' | 'lighting' | 'crowd'

export const useLayerStore = defineStore('layers', {
  state: () => ({
    activeLayers:  { weather: false, traffic: false, lighting: false, crowd: false },
    loadingLayers: { weather: false, traffic: false, lighting: false, crowd: false },
    layerData: {
      weather:  null as WeatherData | null,
      traffic:  null as TrafficData | null,
      lighting: null as LightingData | null,
      crowd:    null as CrowdData | null,
    },
    forecastData:        null as DayForecast[] | null,
    loadingForecast:     false,
    selectedForecastDay: 0,   // 0 = oggi (live), 1-6 = giorni futuri
    selectedTimeSlot:    0,   // 0-3: mattina/mezzogiorno/sera/notte (solo in forecast mode)
  }),

  actions: {
    async toggleLayer(layer: LayerKey) {
      const willBeActive = !this.activeLayers[layer]
      this.activeLayers[layer] = willBeActive

      if (willBeActive) {
        this.loadingLayers[layer] = true
        try {
          const res = await apiFetch(`/api/v1/layers/${layer}`)
          if (res.ok) this.layerData[layer] = await res.json() as any
        } catch (e) {
          console.error(`Failed to fetch ${layer} data`, e)
          this.activeLayers[layer] = false
        } finally {
          this.loadingLayers[layer] = false
        }

        // Auto-refresh ogni 30s finché il layer è attivo
        if (this.activeLayers[layer]) {
          _layerIntervals[layer] = setInterval(async () => {
            if (!this.activeLayers[layer]) return
            try {
              const res = await apiFetch(`/api/v1/layers/${layer}`)
              if (res.ok) this.layerData[layer] = await res.json() as any
            } catch { /* silent — non interrompere l'esperienza */ }
          }, LAYER_REFRESH_MS)
        }

        // Pre-carica il forecast in background al primo layer attivato
        if (!this.forecastData && !this.loadingForecast) this.fetchForecast()
      } else {
        // Ferma il refresh interval
        if (_layerIntervals[layer]) {
          clearInterval(_layerIntervals[layer])
          delete _layerIntervals[layer]
        }
        this.layerData[layer] = null
        if (!Object.values(this.activeLayers).some(Boolean)) this.selectedForecastDay = 0
      }
    },

    async fetchForecast() {
      this.loadingForecast = true
      try {
        const res = await apiFetch('/api/v1/predictions')
        if (res.ok) this.forecastData = await res.json()
      } catch (e) {
        console.error('Forecast fetch failed', e)
      } finally {
        this.loadingForecast = false
      }

      // Avvia il refresh del forecast ogni 5 minuti (una sola volta)
      if (!_forecastInterval) {
        _forecastInterval = setInterval(async () => {
          try {
            const res = await apiFetch('/api/v1/predictions')
            if (res.ok) this.forecastData = await res.json()
          } catch { /* silent */ }
        }, FORECAST_REFRESH_MS)
      }
    },

    setSelectedForecastDay(day: number) {
      this.selectedForecastDay = day
      if (day === 0) this.selectedTimeSlot = 0
      if (day > 0 && !this.forecastData && !this.loadingForecast) this.fetchForecast()
    },

    setSelectedTimeSlot(slot: number) {
      this.selectedTimeSlot = slot
    },

    async setAllLayers(state: boolean) {
      for (const key of Object.keys(this.activeLayers) as LayerKey[]) {
        if (state !== this.activeLayers[key]) await this.toggleLayer(key)
      }
    }
  }
})
