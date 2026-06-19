import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './authStore'
import { apiFetch } from '../services/api'

// L'unica dipendenza esterna dello store è apiFetch: la mockiamo.
vi.mock('../services/api', () => ({ apiFetch: vi.fn() }))
const apiFetchMock = apiFetch as unknown as Mock

// Costruisce un JWT fittizio con la scadenza data (secondi epoch).
function makeToken(expSeconds: number): string {
  const payload = btoa(JSON.stringify({ exp: expSeconds }))
  return `header.${payload}.signature`
}

const okJson = (body: unknown) => ({ ok: true, status: 200, json: async () => body })

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  apiFetchMock.mockReset()
})

describe('authStore — sessione', () => {
  it('setSession popola stato e localStorage e calcola le iniziali', () => {
    const store = useAuthStore()
    store.setSession({ token: 't', id: '1', name: 'Mario Rossi', email: 'mario@x.it', role: 'user' })

    expect(store.isLoggedIn).toBe(true)
    expect(store.token).toBe('t')
    expect(store.user?.initials).toBe('MR')
    expect(localStorage.getItem('token')).toBe('t')
    expect(JSON.parse(localStorage.getItem('user')!).email).toBe('mario@x.it')
  })

  it('le iniziali di un nome singolo usano le prime due lettere', () => {
    const store = useAuthStore()
    store.setSession({ token: 't', id: '1', name: 'Cassandra', email: 'c@x.it', role: 'admin' })
    expect(store.user?.initials).toBe('CA')
  })

  it('logout azzera stato e localStorage', () => {
    const store = useAuthStore()
    store.setSession({ token: 't', id: '1', name: 'Mario Rossi', email: 'mario@x.it', role: 'user' })
    store.logout()

    expect(store.isLoggedIn).toBe(false)
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })
})

describe('authStore — init da localStorage', () => {
  it('ripristina la sessione con token valido', () => {
    const token = makeToken(Math.floor(Date.now() / 1000) + 3600) // scade tra 1h
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Mario Rossi', email: 'm@x.it', role: 'user' }))
    apiFetchMock.mockResolvedValue(okJson([])) // loadFavorites

    const store = useAuthStore()
    store.init()

    expect(store.isLoggedIn).toBe(true)
    expect(store.user?.initials).toBe('MR')
  })

  it('con token scaduto esegue logout e non ripristina la sessione', () => {
    localStorage.setItem('token', makeToken(Math.floor(Date.now() / 1000) - 10)) // già scaduto
    localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Mario', email: 'm@x.it', role: 'user' }))

    const store = useAuthStore()
    store.init()

    expect(store.isLoggedIn).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
  })
})

describe('authStore — preferiti', () => {
  it('isFavorite confronta per lat/lon', () => {
    const store = useAuthStore()
    store.setSession({ token: 't', id: '1', name: 'Mario Rossi', email: 'm@x.it', role: 'user' })
    store.user!.favorites = [{ _id: 'a', lat: 46.07, lon: 11.12, name: 'Duomo', display_name: 'Piazza Duomo' }]

    expect(store.isFavorite('', 46.07, 11.12)).toBe(true)
    expect(store.isFavorite('', 45.0, 11.0)).toBe(false)
  })

  it('toggleFavorite aggiunge la ricerca se non presente', async () => {
    const store = useAuthStore()
    store.setSession({ token: 't', id: '1', name: 'Mario Rossi', email: 'm@x.it', role: 'user' })
    const fav = { _id: 'new', lat: 46.07, lon: 11.12, name: 'Duomo', display_name: 'Piazza Duomo' }
    apiFetchMock.mockResolvedValue(okJson({ favorite: fav }))

    await store.toggleFavorite({ lat: 46.07, lon: 11.12, name: 'Duomo', display_name: 'Piazza Duomo' })

    expect(apiFetchMock).toHaveBeenCalledWith('/api/v1/users/me/favorites', expect.objectContaining({ method: 'POST' }), 't')
    expect(store.user?.favorites).toHaveLength(1)
  })

  it('toggleFavorite rimuove la ricerca se già presente', async () => {
    const store = useAuthStore()
    store.setSession({ token: 't', id: '1', name: 'Mario Rossi', email: 'm@x.it', role: 'user' })
    store.user!.favorites = [{ _id: 'a', lat: 46.07, lon: 11.12, name: 'Duomo', display_name: 'Piazza Duomo' }]
    apiFetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })

    await store.toggleFavorite({ lat: 46.07, lon: 11.12, name: 'Duomo', display_name: 'Piazza Duomo' })

    expect(apiFetchMock).toHaveBeenCalledWith('/api/v1/users/me/favorites/a', expect.objectContaining({ method: 'DELETE' }), 't')
    expect(store.user?.favorites).toHaveLength(0)
  })
})

describe('authStore — login', () => {
  it('login salva la sessione in caso di successo', async () => {
    apiFetchMock
      .mockResolvedValueOnce(okJson({ token: 'jwt', id: '1', name: 'Mario Rossi', email: 'm@x.it', role: 'user' })) // POST auth
      .mockResolvedValueOnce(okJson([])) // loadFavorites

    const store = useAuthStore()
    await store.login('m@x.it', 'password123')

    expect(store.isLoggedIn).toBe(true)
    expect(store.token).toBe('jwt')
  })

  it('login lancia un errore con il messaggio del server in caso di credenziali errate', async () => {
    apiFetchMock.mockResolvedValue({ ok: false, status: 401, json: async () => ({ message: 'Invalid credentials.' }) })

    const store = useAuthStore()
    await expect(store.login('m@x.it', 'wrong')).rejects.toThrow('Invalid credentials.')
    expect(store.isLoggedIn).toBe(false)
  })
})
