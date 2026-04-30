import { createApp } from 'vue'
import { createPinia } from 'pinia' // 1. Importiamo Pinia
import './style.css'
import App from './App.vue'

const pinia = createPinia() // 2. Creiamo l'istanza
const app = createApp(App)

app.use(pinia) // 3. Diciamo a Vue di usarla
app.mount('#app')