import { defineStore } from 'pinia'
import { apiFetch } from '../services/api'

export interface FavoritePlace {
  _id?: string
  lat: string
  lon: string
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
      if (token && raw) {
        const stored = JSON.parse(raw)
        this.token = token
        this.user = { ...stored, initials: computeInitials(stored.name), favorites: [] }
        this.isLoggedIn = true
        this.loadFavorites()
      }
    },

    async login(email: string, password: string) {
      const res = await apiFetch('/api/v1/authentications', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed.')

      this.token = data.token
      this.user = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        initials: computeInitials(data.name),
        favorites: []
      }
      this.isLoggedIn = true
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({ id: data.id, name: data.name, email: data.email, role: data.role }))
      await this.loadFavorites()
    },

    async googleLogin(credential: string) {
      const res = await apiFetch('/api/v1/authentications/google', {
        method: 'POST',
        body: JSON.stringify({ credential })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Google login failed.')

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
    },

    async toggleFavorite(place: FavoritePlace) {
      if (!this.user || !this.token) return
      const existing = this.user.favorites.find(f => f.lat === place.lat && f.lon === place.lon)

      if (existing) {
        await apiFetch(`/api/v1/users/me/favorites/${existing._id}`, { method: 'DELETE' }, this.token)
        this.user.favorites = this.user.favorites.filter(f => f._id !== existing._id)
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

    isFavorite(_name: string, lat: string, lon: string): boolean {
      if (!this.user) return false
      return this.user.favorites.some(f => f.lat === lat && f.lon === lon)
    }
  }
})
