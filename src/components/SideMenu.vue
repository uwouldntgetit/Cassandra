<script setup lang="ts">
/**
 * SideMenu.vue
 * Sidebar navigation component containing user session details and global settings toggles.
 * 
 * Componente di navigazione laterale con i dettagli della sessione utente e le impostazioni globali.
 */
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
    <!-- Hamburger Button -->
    <button 
      @click="isOpen = true" 
      class="absolute right-2.5 top-2.5 md:right-4 md:top-3 md:right-6 md:top-5 p-1.5 md:p-3 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/20 rounded-lg md:rounded-xl shadow-xl text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
      title="Apri Menu"
    >
      <Menu class="w-4 h-4 md:w-6 md:h-6" />
    </button>

    <!-- Slide-out Menu -->
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
          'fixed top-0 right-0 h-full w-[65vw] md:w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-l border-cyan-500/20 shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        ]"
      >
        <!-- Menu Header -->
        <div class="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="font-bold text-base md:text-lg text-slate-800 dark:text-white tracking-wide">Menu</h2>
          <button @click="isOpen = false" class="p-1.5 md:p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 rounded-full">
            <X class="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        <!-- Menu Content -->
        <div class="p-3 md:p-4 flex flex-col gap-1 md:gap-2 overflow-y-auto">

          <!-- Logged In User Section -->
          <div v-if="authStore.isLoggedIn" class="p-3 md:p-4 mb-3 md:mb-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl flex flex-col items-center">
            <div class="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-md mb-2 md:mb-3">
              {{ authStore.user?.initials }}
            </div>
            <p class="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{{ authStore.user?.name }}</p>
            <p class="text-[10px] md:text-xs text-slate-500 mb-3 md:mb-4">{{ authStore.user?.email }}</p>
            <button @click="authStore.logout()" class="w-full py-2 md:py-2.5 flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg md:rounded-xl transition-colors">
              <LogOut class="w-3.5 h-3.5 md:w-4 md:h-4" />
              Logout
            </button>
          </div>

          <!-- Guest Section -->
          <div v-else class="mb-3 md:mb-4 flex justify-center">
            <button @click="handleAction('open-login')" class="w-full max-w-[200px] py-2.5 md:py-3.5 flex items-center justify-center gap-1.5 md:gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg md:rounded-xl shadow-lg shadow-cyan-500/30 transition-all font-bold text-xs md:text-sm">
              <LogIn class="w-4 h-4 md:w-5 md:h-5" />
              Log in
            </button>
          </div>

          <!-- Separator -->
          <div class="w-full h-px bg-slate-200 dark:bg-slate-800 my-1 md:my-2 transition-colors"></div>

          <!-- Tools & Settings -->
          <button @click="handleAction('toggle-theme')" class="flex items-center gap-3 md:gap-4 p-2.5 md:p-3.5 w-full rounded-lg md:rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
            <Sun v-if="isDark" class="w-4 h-4 md:w-5 md:h-5 text-amber-500 group-hover:rotate-90 transition-transform duration-300" />
            <Moon v-else class="w-4 h-4 md:w-5 md:h-5 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
            <span class="font-medium text-xs md:text-sm">{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
          </button>


          <button @click="handleAction('open-settings')" class="flex items-center gap-3 md:gap-4 p-2.5 md:p-3.5 w-full rounded-lg md:rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
            <Settings class="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:rotate-90 transition-transform duration-500" />
            <span class="font-medium text-xs md:text-sm">Settings</span>
          </button>


          <button @click="handleAction('open-about')" class="flex items-center gap-3 md:gap-4 p-2.5 md:p-3.5 w-full rounded-lg md:rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
            <Info class="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:scale-125 transition-transform duration-300" />
            <span class="font-medium text-xs md:text-sm">About us</span>
          </button>

        </div>
      </div>
    </Teleport>
  </div>
</template>