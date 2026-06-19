import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLayerStore, TIME_SLOTS, CROWD_TIME_MULT, TRAFFIC_TIME_CONG } from './layerStore'
import { apiFetch } from '../services/api'

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }))
const apiFetchMock = apiFetch as unknown as Mock

// Risposta per path: layer -> dato fittizio, predictions -> lista vuota.
function routeFetch(path: string) {
  if (path.includes('/predictions')) return { ok: true, json: async () => [] }
  return { ok: true, json: async () => ({ status: 'Good', value: 42 }) }
}

beforeEach(() => {
  setActivePinia(createPinia())
  apiFetchMock.mockReset()
  apiFetchMock.mockImplementation((path: string) => Promise.resolve(routeFetch(path)))
  // Evita timer reali (auto-refresh dei layer e delle previsioni).
  vi.stubGlobal('setInterval', vi.fn(() => 1))
  vi.stubGlobal('clearInterval', vi.fn())
})

describe('layerStore — toggle dei layer', () => {
  it('attivare un layer ne scarica i dati e lo segna attivo', async () => {
    const store = useLayerStore()
    await store.toggleLayer('weather')

    expect(store.activeLayers.weather).toBe(true)
    expect(store.layerData.weather).toEqual({ status: 'Good', value: 42 })
    expect(apiFetchMock).toHaveBeenCalledWith('/api/v1/layers/weather')
  })

  it('disattivare un layer ne azzera i dati', async () => {
    const store = useLayerStore()
    await store.toggleLayer('traffic')
    await store.toggleLayer('traffic')

    expect(store.activeLayers.traffic).toBe(false)
    expect(store.layerData.traffic).toBeNull()
  })

  it('setAllLayers(true) attiva tutti i layer', async () => {
    const store = useLayerStore()
    await store.setAllLayers(true)

    expect(Object.values(store.activeLayers).every(Boolean)).toBe(true)
  })
})

describe('layerStore — selezione giorno/fascia', () => {
  it('setSelectedForecastDay(0) riporta la fascia oraria a 0', () => {
    const store = useLayerStore()
    store.setSelectedTimeSlot(3)
    store.setSelectedForecastDay(0)

    expect(store.selectedForecastDay).toBe(0)
    expect(store.selectedTimeSlot).toBe(0)
  })

  it('applyLayers ripristina layer, giorno e fascia di una ricerca salvata', async () => {
    const store = useLayerStore()
    await store.applyLayers(['weather', 'crowd'], 3, 2)

    expect(store.activeLayers.weather).toBe(true)
    expect(store.activeLayers.crowd).toBe(true)
    expect(store.activeLayers.traffic).toBe(false)
    expect(store.selectedForecastDay).toBe(3)
    expect(store.selectedTimeSlot).toBe(2)
  })
})

describe('layerStore — tabelle costanti', () => {
  it('ogni profilo folla ha un moltiplicatore per ciascuna delle 4 fasce', () => {
    expect(TIME_SLOTS).toHaveLength(4)
    for (const mult of Object.values(CROWD_TIME_MULT)) {
      expect(mult).toHaveLength(4)
      expect(mult.every(n => n >= 0)).toBe(true)
    }
  })

  it('la congestione del traffico usa solo valori validi su 4 fasce', () => {
    const valid = new Set(['low', 'medium', 'high'])
    for (const slots of Object.values(TRAFFIC_TIME_CONG)) {
      expect(slots).toHaveLength(4)
      expect(slots.every(s => valid.has(s))).toBe(true)
    }
  })
})
