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
    },
    loadingLayers: {
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
      const willBeActive = !this.activeLayers[layer]
      this.activeLayers[layer] = willBeActive
      
      // Simulate data fetch delay
      if (willBeActive) {
        this.loadingLayers[layer] = true
        setTimeout(() => {
          this.loadingLayers[layer] = false
        }, 1500)
      } else {
        this.loadingLayers[layer] = false
      }
    },
    /**
     * Sets the visibility state of all map layers simultaneously.
     * @param state The boolean state to set all layers to.
     */
    setAllLayers(state: boolean) {
      for (const key in this.activeLayers) {
        const layer = key as keyof typeof this.activeLayers
        this.activeLayers[layer] = state
        
        if (state) {
          this.loadingLayers[layer] = true
          setTimeout(() => {
            this.loadingLayers[layer] = false
          }, 1500)
        } else {
          this.loadingLayers[layer] = false
        }
      }
    }
  }
})