import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'

/**
 * Main application entry point.
 * Initializes the Vue application instance and registers global plugins like Pinia and Router.
 */
const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')