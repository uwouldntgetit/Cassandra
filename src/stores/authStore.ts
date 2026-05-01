import { defineStore } from 'pinia'

interface User {
  name: string
  email: string
  initials: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isLoggedIn: false
  }),
  actions: {
    // Ora login accetta un secondo parametro OPZIONALE (il nome)
    login(email: string, fullName?: string) {
      
      // Se mi passi un fullName (es. durante il Signup), uso quello.
      // Altrimenti (es. Login normale), prendo la parte prima della @ e metto la prima lettera maiuscola.
      const name = fullName 
        ? fullName 
        : email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
      
      // Calcolo le iniziali corrette. Se c'è uno spazio ("Mirco Rossi"), prendo "MR".
      // Se è una parola sola ("Mirco"), prendo "M".
      const nameParts = name.split(' ')
      const initials = nameParts.length > 1 
        ? nameParts[0][0].toUpperCase() + nameParts[1][0].toUpperCase()
        : name.substring(0, 2).toUpperCase()

      this.user = { name, email, initials }
      this.isLoggedIn = true
    },
    logout() {
      this.user = null
      this.isLoggedIn = false
    }
  }
})