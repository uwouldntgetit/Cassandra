import { defineStore } from 'pinia'

interface User {
  name: string
  email: string
  initials: string
}

/**
 * AuthStore
 * Manages the user authentication state, storing user details and login status.
 * 
 * Gestisce lo stato di autenticazione dell'utente, salvando i dettagli dell'utente e lo stato di accesso.
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isLoggedIn: false
  }),
  actions: {
    /**
     * Authenticates the user and calculates their initials based on the provided name or email.
     * @param email The user's email address.
     * @param fullName The optional full name of the user.
     */
    login(email: string, fullName?: string) {
      const name = fullName
        ? fullName
        : email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)

      const nameParts = name.split(' ')
      const initials = nameParts.length > 1
        ? nameParts[0][0].toUpperCase() + nameParts[1][0].toUpperCase()
        : name.substring(0, 2).toUpperCase()

      this.user = { name, email, initials }
      this.isLoggedIn = true
    },
    /**
     * Clears the user data and logs the user out.
     */
    logout() {
      this.user = null
      this.isLoggedIn = false
    }
  }
})