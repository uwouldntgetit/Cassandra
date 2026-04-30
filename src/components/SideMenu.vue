<script setup lang="ts">
import { Settings, Info, LogIn, LogOut, Moon, Sun } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'

defineProps<{ isDark: boolean }>()
const emit = defineEmits(['toggle-theme', 'open-login', 'open-settings', 'open-about'])

const authStore = useAuthStore()
</script>

<template>
  <div class="absolute right-4 top-24 md:top-28 flex flex-col gap-2 z-10">
    
    <!-- CONTENITORE MENU: Tutti i bottoni della stessa dimensione -->
    <div class="flex flex-col gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-2 shadow-xl">
      
      <!-- SE L'UTENTE È LOGGATO -->
      <template v-if="authStore.isLoggedIn">
        <!-- Avatar Iniziali (Rotondo ma grande come le altre icone) -->
        <div class="w-11 h-11 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md cursor-help" :title="authStore.user?.name">
          {{ authStore.user?.initials }}
        </div>
        
        <!-- Tasto Logout (Solo icona rossa) -->
        <button @click="authStore.logout()" class="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors flex justify-center" title="Logout">
          <LogOut class="w-5 h-5" />
        </button>
      </template>

      <!-- SE L'UTENTE NON È LOGGATO -->
      <template v-else>
        <!-- Tasto Login (Solo icona) -->
        <button @click="emit('open-login')" class="p-3 text-cyan-600 dark:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex justify-center" title="Accedi">
          <LogIn class="w-5 h-5" />
        </button>
      </template>

      <!-- LINEA SEPARATRICE -->
      <div class="w-8 h-px bg-slate-200 dark:bg-slate-700 mx-auto my-1"></div>

      <!-- ALTRI STRUMENTI (Sempre visibili, solo icone) -->
      <button @click="emit('toggle-theme')" class="p-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex justify-center" title="Cambia Tema">
        <Sun v-if="isDark" class="w-5 h-5" />
        <Moon v-else class="w-5 h-5" />
      </button>
      
      <button @click="emit('open-settings')" class="p-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex justify-center" title="Impostazioni">
        <Settings class="w-5 h-5" />
      </button>
      
      <button @click="emit('open-about')" class="p-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex justify-center" title="Informazioni">
        <Info class="w-5 h-5" />
      </button>

    </div>
  </div>
</template>