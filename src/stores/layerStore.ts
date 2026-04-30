import { defineStore } from 'pinia'
import { ref } from 'vue'

// Creiamo e esportiamo il nostro Store
export const useLayerStore = defineStore('layers', () => {
  
  // STATO: I nostri dati (sostituiscono la variabile in App.vue)
  const activeLayers = ref({
    weather: false,
    traffic: false
  })

  // AZIONI: Le funzioni per modificare i dati
  const toggleLayer = (layer: 'weather' | 'traffic') => {
    activeLayers.value[layer] = !activeLayers.value[layer]
  }

  // Ritorniamo ciò che vogliamo rendere pubblico
  return { activeLayers, toggleLayer }
})