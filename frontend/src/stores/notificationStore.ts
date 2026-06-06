import { defineStore } from 'pinia'
import { apiFetch } from '../services/api'

export interface AppNotification {
  _id: string
  type: 'error' | 'warning' | 'success'
  message: string
  status: string
  createdAt: string
}

let pollIntervalId: ReturnType<typeof setInterval> | null = null

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as AppNotification[],
    dismissedIds: (JSON.parse(localStorage.getItem('dismissedNotifications') || '[]')) as string[]
  }),

  getters: {
    active(): AppNotification[] {
      return this.notifications.filter(n => !this.dismissedIds.includes(n._id))
    },
    unreadCount(): number {
      return this.active.filter(n => n.status !== 'Resolved').length
    }
  },

  actions: {
    async fetch() {
      try {
        const res = await apiFetch('/api/v1/notifications')
        if (res.ok) this.notifications = await res.json()
      } catch (e) {
        console.error('Notifications fetch failed', e)
      }
    },

    dismiss(id: string) {
      if (!this.dismissedIds.includes(id)) {
        this.dismissedIds.push(id)
        localStorage.setItem('dismissedNotifications', JSON.stringify(this.dismissedIds))
      }
    },

    dismissAll() {
      const allIds = this.active.map(n => n._id)
      this.dismissedIds.push(...allIds.filter(id => !this.dismissedIds.includes(id)))
      localStorage.setItem('dismissedNotifications', JSON.stringify(this.dismissedIds))
    },

    startPolling(intervalMs = 60000) {
      this.fetch()
      if (pollIntervalId) clearInterval(pollIntervalId)
      pollIntervalId = setInterval(() => this.fetch(), intervalMs)
    },

    stopPolling() {
      if (pollIntervalId) { clearInterval(pollIntervalId); pollIntervalId = null }
    }
  }
})
