import { defineStore } from 'pinia'

export const useLayerStore = defineStore('layers', {
  state: () => ({
    activeLayers: {
      weather: false,
      traffic: false,
      lighting: false, // NUOVO
      crowd: false     // NUOVO
    }
  }),
  actions: {
    toggleLayer(layer: keyof typeof this.activeLayers) {
      this.activeLayers[layer] = !this.activeLayers[layer]
    }
  }
})