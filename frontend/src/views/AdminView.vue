<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  LayoutDashboard,
  RadioTower,
  Users,
  Settings,
  BellRing,
  LogOut,
  Map as MapIcon,
  Activity,
  Server,
  AlertTriangle,
  CheckCircle2
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'
import { API_URL } from '../services/api'
import BaseButton from '../components/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('dashboard')

const metrics = ref({ activeSensors: 0, totalSensors: 0, onlinePercentage: 0, systemLoad: 0, activeAlerts: 0, apiRequests: '—' })
const systemEvents = ref<any[]>([])

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'proprio ora'
  if (m < 60) return `${m} min fa`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ${h > 1 ? 'ore' : 'ora'} fa`
  return `${Math.floor(h / 24)} giorni fa`
}

onMounted(async () => {
  const headers = { 'Authorization': `Bearer ${authStore.token}` }
  const [mRes, eRes] = await Promise.all([
    fetch(`${API_URL}/api/v1/admin/metrics`, { headers }),
    fetch(`${API_URL}/api/v1/admin/events`, { headers })
  ])
  if (mRes.ok) metrics.value = await mRes.json()
  if (eRes.ok) systemEvents.value = await eRes.json()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

const goToMap = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
    
    <!-- Sidebar -->
    <aside class="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex shrink-0">
      <div class="p-6 flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-black text-xl">
          C
        </div>
        <span class="text-xl font-bold tracking-tight">Admin<span class="text-cyan-500">OS</span></span>
      </div>
      
      <div class="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        <button @click="activeTab = 'dashboard'" :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors', activeTab === 'dashboard' ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50']">
          <LayoutDashboard class="w-5 h-5" /> Panoramica
        </button>
        <button @click="activeTab = 'sensors'" :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors', activeTab === 'sensors' ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50']">
          <RadioTower class="w-5 h-5" /> Sensori
        </button>
        <button @click="activeTab = 'alerts'" :class="['w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors', activeTab === 'alerts' ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50']">
          <div class="flex items-center gap-3"><BellRing class="w-5 h-5" /> Avvisi</div>
          <span class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">2</span>
        </button>
        <button @click="activeTab = 'users'" :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors', activeTab === 'users' ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50']">
          <Users class="w-5 h-5" /> Utenti
        </button>
      </div>

      <div class="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button @click="activeTab = 'settings'" :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors', activeTab === 'settings' ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50']">
          <Settings class="w-5 h-5" /> Impostazioni
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
      <!-- Header -->
      <header class="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0">
        <h1 class="text-2xl font-bold hidden md:block">Dashboard di sistema</h1>
        
        <!-- Mobile Menu Toggle (simplified for demo) -->
        <div class="md:hidden flex items-center gap-2">
           <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-black">C</div>
           <span class="font-bold">Admin<span class="text-cyan-500">OS</span></span>
        </div>

        <div class="flex items-center gap-4">
          <BaseButton variant="secondary" class="px-4 py-2 text-sm rounded-lg" @click="goToMap">
            <MapIcon class="w-4 h-4" /> Mappa live
          </BaseButton>
          
          <div class="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
          
          <div class="flex items-center gap-3">
            <div class="text-right hidden sm:block">
              <p class="text-sm font-bold leading-none">{{ authStore.user?.name || 'Operatore' }}</p>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-wider">Amministratore</p>
            </div>
            <div class="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              {{ authStore.user?.initials || 'OP' }}
            </div>
            <button @click="handleLogout" class="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 ml-1">
              <LogOut class="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8">
        
        <!-- Welcome Message -->
        <div class="mb-8">
          <h2 class="text-3xl font-black mb-1">Bentornato, {{ authStore.user?.name?.split(' ')[0] || 'Admin' }}! 👋</h2>
          <p class="text-slate-500 dark:text-slate-400">Ecco cosa succede oggi su Cassandra.</p>
        </div>

        <!-- Metrics Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div class="flex justify-between items-start mb-4">
              <div class="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <RadioTower class="w-5 h-5" />
              </div>
              <span class="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                {{ metrics.onlinePercentage }}% Online
              </span>
            </div>
            <h3 class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Sensori attivi</h3>
            <p class="text-3xl font-black">{{ metrics.activeSensors }}</p>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div class="flex justify-between items-start mb-4">
              <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Server class="w-5 h-5" />
              </div>
              <span class="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                Regolare
              </span>
            </div>
            <h3 class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Carico di sistema</h3>
            <p class="text-3xl font-black">{{ metrics.systemLoad }}%</p>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div class="flex justify-between items-start mb-4">
              <div class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <AlertTriangle class="w-5 h-5" />
              </div>
              <span class="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md">
                Richiede attenzione
              </span>
            </div>
            <h3 class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Avvisi attivi</h3>
            <p class="text-3xl font-black">{{ metrics.activeAlerts }}</p>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div class="flex justify-between items-start mb-4">
              <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Activity class="w-5 h-5" />
              </div>
              <span class="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                +12% su base annua
              </span>
            </div>
            <h3 class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Richieste API</h3>
            <p class="text-3xl font-black">{{ metrics.apiRequests }}</p>
          </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 class="font-bold text-lg">Eventi di sistema recenti</h3>
            <button class="text-sm text-cyan-600 dark:text-cyan-400 font-bold hover:underline">Vedi tutti</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold">
                <tr>
                  <th class="px-6 py-4">Tipo evento</th>
                  <th class="px-6 py-4">Messaggio</th>
                  <th class="px-6 py-4">Ora</th>
                  <th class="px-6 py-4 text-right">Stato</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
                <tr v-for="event in systemEvents" :key="event.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2 font-medium">
                      <AlertTriangle v-if="event.type === 'error'" class="w-4 h-4 text-red-500" />
                      <AlertTriangle v-else-if="event.type === 'warning'" class="w-4 h-4 text-amber-500" />
                      <CheckCircle2 v-else class="w-4 h-4 text-emerald-500" />
                      <span class="capitalize">{{ event.type }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{{ event.message }}</td>
                  <td class="px-6 py-4 text-slate-500">{{ timeAgo(event.time) }}</td>
                  <td class="px-6 py-4 text-right">
                    <span :class="['px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider', 
                      event.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      event.status === 'Investigating' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    ]">
                      {{ event.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>
