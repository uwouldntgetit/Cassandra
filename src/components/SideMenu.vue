<script setup lang="ts">
import { Sun, Moon, Settings, Info, LogIn } from 'lucide-vue-next'

defineProps<{ isDark: boolean }>()
const emit = defineEmits(['toggle-theme', 'open-login', 'open-settings'])
</script>

<template>
  <div class="absolute bottom-6 right-4 md:top-6 md:right-6 md:bottom-auto flex flex-col gap-2.5 pointer-events-auto z-10">
    
    <button @click="emit('open-login')" class="w-11 h-11 mb-3 flex items-center justify-center bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-cyan-500/30 transition-all">
      <LogIn class="w-5 h-5" />
    </button>
    
    <button @click="emit('toggle-theme')" class="w-11 h-11 flex items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 dark:border-cyan-400/30 rounded-xl shadow-lg shadow-cyan-500/10 dark:shadow-cyan-400/10 hover:border-cyan-500/60 dark:hover:border-cyan-400/60 transition-all text-cyan-600 dark:text-cyan-400">
      <Sun v-if="isDark" class="w-5 h-5" />
      <Moon v-else class="w-5 h-5" />
    </button>
    
    <button @click="emit('open-settings')" class="w-11 h-11 flex items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 dark:border-cyan-400/30 rounded-xl shadow-lg shadow-cyan-500/10 dark:shadow-cyan-400/10 hover:border-cyan-500/60 dark:hover:border-cyan-400/60 transition-all text-cyan-600 dark:text-cyan-400">
      <Settings class="w-5 h-5" />
    </button>
    
    <button class="w-11 h-11 flex items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 dark:border-cyan-400/30 rounded-xl shadow-lg shadow-cyan-500/10 dark:shadow-cyan-400/10 hover:border-cyan-500/60 dark:hover:border-cyan-400/60 transition-all text-cyan-600 dark:text-cyan-400">
      <Info class="w-5 h-5" />
    </button>

  </div>
</template>