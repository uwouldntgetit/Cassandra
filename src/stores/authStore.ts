import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false)
  const user = ref<{ name: string; email: string; initials: string } | null>(null)

  const login = (email: string) => {
    isLoggedIn.value = true
    
    // Estraiamo nome e cognome dall'email (es. mario.rossi)
    const parts = email.split('@')[0].split('.')
    const first = parts[0] || 'U'
    const last = parts[1] || ''
    
    // Creiamo il nome completo formattato
    const name = first.charAt(0).toUpperCase() + first.slice(1) + 
                 (last ? ' ' + last.charAt(0).toUpperCase() + last.slice(1) : '')
                 
    // Creiamo le iniziali (es. MR)
    const initials = (first.charAt(0) + (last ? last.charAt(0) : '')).toUpperCase()

    user.value = { name, email, initials }
  }

  const logout = () => {
    isLoggedIn.value = false
    user.value = null
  }

  return { isLoggedIn, user, login, logout }
})