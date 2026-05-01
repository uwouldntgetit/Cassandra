import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'

/**
 * Main application entry point.
 * Initializes the Vue application instance and registers global plugins like Pinia.
 * 
 * Punto di ingresso principale dell'applicazione.
 * Inizializza l'istanza dell'applicazione Vue e registra i plugin globali come Pinia.
 */
const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.mount('#app')