<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, X, Settings, Info, LogIn, LogOut, Moon, Sun } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'

const props = defineProps<{ isDark: boolean }>()
const emit = defineEmits(['toggle-theme', 'open-login', 'open-settings', 'open-about'])

const authStore = useAuthStore()

const isOpen = ref(false)

const handleAction = (action: 'toggle-theme' | 'open-login' | 'open-settings' | 'open-about') => {
  emit(action)
  if (action !== 'toggle-theme') {
    isOpen.value = false 
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div>
    <!-- PULSANTE HAMBURGER -->
    <button 
      @click="isOpen = true" 
      class="absolute right-6 top-6 z-50 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/20 rounded-xl shadow-xl text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
      title="Apri Menu"
    >
      <Menu class="w-6 h-6" />
    </button>

    <!-- MENU A SCOMPARSA -->
    <Teleport to="body">
      
      <transition 
        enter-active-class="transition-opacity duration-300" 
        enter-from-class="opacity-0" 
        enter-to-class="opacity-100" 
        leave-active-class="transition-opacity duration-300" 
        leave-from-class="opacity-100" 
        leave-to-class="opacity-0"
      >
        <div v-if="isOpen" @click="isOpen = false" class="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[90]"></div>
      </transition>

      <div 
        :class="[
          'fixed top-0 right-0 h-full w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-l border-cyan-500/20 shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        ]"
      >
        <!-- Intestazione Menu -->
        <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="font-bold text-lg text-slate-800 dark:text-white tracking-wide">Menu</h2>
          <button @click="isOpen = false" class="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 rounded-full">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Contenuto Menu -->
        <div class="p-4 flex flex-col gap-2 overflow-y-auto">

          <!-- SEZIONE UTENTE LOGGATO -->
          <div v-if="authStore.isLoggedIn" class="p-4 mb-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-md mb-3">
              {{ authStore.user?.initials }}
            </div>
            <p class="font-bold text-slate-900 dark:text-white text-sm">{{ authStore.user?.name }}</p>
            <p class="text-xs text-slate-500 mb-4">{{ authStore.user?.email }}</p>
            <button @click="authStore.logout()" class="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-colors">
              <LogOut class="w-4 h-4" />
              Logout
            </button>
          </div>

          <!-- SEZIONE UTENTE NON LOGGATO -->
          <div v-else class="mb-4">
            <button @click="handleAction('open-login')" class="w-full py-3.5 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl shadow-lg shadow-cyan-500/30 transition-all font-bold text-sm">
              <LogIn class="w-5 h-5" />
              Accedi
            </button>
          </div>

          <!-- Riga Separatoria Sistemata -->
          <div class="w-full h-px bg-slate-200 dark:bg-slate-800 my-2 transition-colors"></div>

          <!-- ALTRI STRUMENTI -->
          <button @click="handleAction('toggle-theme')" class="flex items-center gap-4 p-3.5 w-full rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
            <Sun v-if="isDark" class="w-5 h-5 text-amber-500 group-hover:rotate-90 transition-transform duration-300" />
            <Moon v-else class="w-5 h-5 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
            <span class="font-medium text-sm">{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
          </button>

          <!-- Aggiunto "group" al bottone e l'animazione di rotazione all'icona -->
          <button @click="handleAction('open-settings')" class="flex items-center gap-4 p-3.5 w-full rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
            <Settings class="w-5 h-5 text-slate-400 group-hover:rotate-90 transition-transform duration-500" />
            <span class="font-medium text-sm">Impostazioni</span>
          </button>

          <!-- Aggiunto "group" al bottone e l'animazione di zoom (scale-125) all'icona -->
          <button @click="handleAction('open-about')" class="flex items-center gap-4 p-3.5 w-full rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
            <Info class="w-5 h-5 text-slate-400 group-hover:scale-125 transition-transform duration-300" />
            <span class="font-medium text-sm">Informazioni</span>
          </button>

        </div>
      </div>
    </Teleport>
  </div>
</template>