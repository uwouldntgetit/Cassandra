import { defineStore } from 'pinia'

/**
 * LayerStore
 * Manages the visibility state of the different interactive map layers.
 * 
 * Gestisce lo stato di visibilità dei vari layer interattivi della mappa.
 */
export const useLayerStore = defineStore('layers', {
  state: () => ({
    activeLayers: {
      weather: false,
      traffic: false,
      lighting: false,
      crowd: false
    }
  }),
  actions: {
    /**
     * Toggles the visibility state of a specific map layer.
     * @param layer The key identifying the map layer.
     */
    toggleLayer(layer: keyof typeof this.activeLayers) {
      this.activeLayers[layer] = !this.activeLayers[layer]
    }
  }
})