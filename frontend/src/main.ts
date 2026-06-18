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

// Restore the session from localStorage before the router evaluates protected routes
import { useAuthStore } from './stores/authStore'
useAuthStore(pinia).init()

app.use(router)
app.mount('#app')