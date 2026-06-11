import { defineStore } from 'pinia'
import { apiFetch } from '../services/api'

export interface FavoritePlace {
  _id?: string
  lat: number
  lon: number
  name: string
  display_name: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  initials: string
  favorites: FavoritePlace[]
}

function computeInitials(name: string): string {
  const parts = name.trim().split(' ')
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase()
}

// Legge la scadenza dal payload del JWT; un token illeggibile è considerato scaduto
function tokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isLoggedIn: false,
    token: null as string | null
  }),
  actions: {
    // Ripristina la sessione da localStorage (chiamato in main.ts prima del mount)
    init() {
      const token = localStorage.getItem('token')
      const raw = localStorage.getItem('user')
      if (!token || !raw) return
      if (tokenExpired(token)) return this.logout()

      try {
        const stored = JSON.parse(raw)
        this.token = token
        this.user = { ...stored, initials: computeInitials(stored.name), favorites: [] }
        this.isLoggedIn = true
        this.loadFavorites()
      } catch {
        this.logout()
      }
    },

    // Salva token e dati utente nello store e in localStorage
    setSession(data: { token: string; id: string; name: string; email: string; role: string }) {
      this.token = data.token
      this.user = {
        id:       data.id,
        name:     data.name,
        email:    data.email,
        role:     data.role,
        initials: computeInitials(data.name),
        favorites: []
      }
      this.isLoggedIn = true
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({ id: data.id, name: data.name, email: data.email, role: data.role }))
    },

    async login(email: string, password: string) {
      const res = await apiFetch('/api/v1/authentications', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed.')

      this.setSession(data)
      await this.loadFavorites()
    },

    async googleLogin(credential: string) {
      const res = await apiFetch('/api/v1/authentications/google', {
        method: 'POST',
        body: JSON.stringify({ credential })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Google login failed.')

      this.setSession(data)
      await this.loadFavorites()
    },

    async register(name: string, email: string, password: string) {
      const res = await apiFetch('/api/v1/authentications/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed.')
      await this.login(email, password)
    },

    logout() {
      this.user = null
      this.isLoggedIn = false
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    async loadFavorites() {
      if (!this.token || !this.user) return
      const res = await apiFetch('/api/v1/users/me/favorites', {}, this.token)
      if (res.ok) this.user.favorites = await res.json()
      else if (res.status === 401 || res.status === 403) this.logout()
    },

    async toggleFavorite(place: FavoritePlace) {
      if (!this.user || !this.token) return
      const existing = this.user.favorites.find(f => f.lat === place.lat && f.lon === place.lon)

      if (existing) {
        const res = await apiFetch(`/api/v1/users/me/favorites/${existing._id}`, { method: 'DELETE' }, this.token)
        if (res.ok) this.user.favorites = this.user.favorites.filter(f => f._id !== existing._id)
      } else {
        const res = await apiFetch('/api/v1/users/me/favorites', {
          method: 'POST',
          body: JSON.stringify(place)
        }, this.token)
        if (res.ok) {
          const data = await res.json()
          this.user.favorites.push(data.favorite)
        }
      }
    },

    isFavorite(_name: string, lat: number, lon: number): boolean {
      if (!this.user) return false
      return this.user.favorites.some(f => f.lat === lat && f.lon === lon)
    }
  }
})
