import { defineStore } from 'pinia'

export interface FavoritePlace {
  lat: string
  lon: string
  name: string
  display_name: string
}

interface User {
  name: string
  email: string
  initials: string
  favorites: FavoritePlace[]
}

/**
 * AuthStore
 * Manages the user authentication state, storing user details, login status, and favorites.
 * 
 * Gestisce lo stato di autenticazione dell'utente, salvando i dettagli dell'utente, lo stato di accesso e i preferiti.
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

      this.user = { name, email, initials, favorites: [] }
      this.isLoggedIn = true
    },
    /**
     * Clears the user data and logs the user out.
     */
    logout() {
      this.user = null
      this.isLoggedIn = false
    },
    /**
     * Toggles a place in the user's favorites list.
     */
    toggleFavorite(place: FavoritePlace) {
      if (!this.user) return

      const index = this.user.favorites.findIndex(f => f.name === place.name && f.lat === place.lat && f.lon === place.lon)
      if (index === -1) {
        this.user.favorites.push(place)
      } else {
        this.user.favorites.splice(index, 1)
      }
    },
    /**
     * Checks if a place is currently favorited by the user.
     */
    isFavorite(name: string, lat: string, lon: string): boolean {
      if (!this.user) return false
      return this.user.favorites.some(f => f.name === name && f.lat === lat && f.lon === lon)
    }
  }
})