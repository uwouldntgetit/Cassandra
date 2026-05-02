<script setup lang="ts">
/**
 * SettingsModal.vue
 * User preferences modal to toggle global application settings.
 * 
 * Modale delle preferenze per attivare/disattivare le impostazioni globali dell'app.
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { X, Globe, Bell, Ruler, MonitorPlay } from 'lucide-vue-next'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close'])

// Mock states for settings
const notifications = ref(true)
const metricSystem = ref(true)
const animations = ref(true)

const close = () => emit('close')

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      <div @click="close" class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"></div>
      
      <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-cyan-500/20 overflow-hidden transform transition-all scale-[0.7] sm:scale-100">
        
        <div class="bg-gradient-to-r from-cyan-500 to-teal-500 p-6 text-center relative">
          <button @click="close" class="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
            <X class="w-5 h-5" />
          </button>
          <h2 class="text-2xl font-bold text-white tracking-wide">Settings</h2>
          <p class="text-cyan-50/80 text-sm mt-1">Customize your dashboard experience</p>
        </div>

        <div class="p-6 space-y-6">
          
          <div class="space-y-2">
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Globe class="w-4 h-4" /> Language
            </label>
            <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm text-slate-900 dark:text-slate-100 appearance-none">
              <option value="en">English (US)</option>
              <option value="it">Italiano (IT)</option>
              <option value="de">Deutsch (DE)</option>
            </select>
          </div>

          <div class="border-t border-slate-200 dark:border-slate-700/80"></div>

          <div class="space-y-4">
            
            <button @click="notifications = !notifications" class="w-full flex items-center justify-between group">
              <div class="flex items-center gap-3 text-slate-700 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                <Bell class="w-4 h-4" />
                <span class="text-sm font-medium">Push Notifications</span>
              </div>
              <div :class="['w-10 h-5 rounded-full transition-all flex items-center px-1', notifications ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700']">
                <div :class="['w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all transform', notifications ? 'translate-x-4' : 'translate-x-0']"></div>
              </div>
            </button>

            <button @click="metricSystem = !metricSystem" class="w-full flex items-center justify-between group">
              <div class="flex items-center gap-3 text-slate-700 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                <Ruler class="w-4 h-4" />
                <span class="text-sm font-medium">Metric System (°C, km/h)</span>
              </div>
              <div :class="['w-10 h-5 rounded-full transition-all flex items-center px-1', metricSystem ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700']">
                <div :class="['w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all transform', metricSystem ? 'translate-x-4' : 'translate-x-0']"></div>
              </div>
            </button>

            <button @click="animations = !animations" class="w-full flex items-center justify-between group">
              <div class="flex items-center gap-3 text-slate-700 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                <MonitorPlay class="w-4 h-4" />
                <span class="text-sm font-medium">Enable UI Animations</span>
              </div>
              <div :class="['w-10 h-5 rounded-full transition-all flex items-center px-1', animations ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700']">
                <div :class="['w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all transform', animations ? 'translate-x-4' : 'translate-x-0']"></div>
              </div>
            </button>

          </div>
          
        </div>
      </div>
    </div>
  </Teleport>
</template>