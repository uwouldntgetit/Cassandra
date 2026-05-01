<script setup lang="ts">
/**
 * AboutModal.vue
 * Informational modal displaying project details, team members, and data sources.
 * 
 * Modale informativo che mostra i dettagli del progetto, i membri del team e le fonti dei dati.
 */
import { X, MapPin, Database, Users, Github } from 'lucide-vue-next'
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close'])

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
      
      <!-- Blurred Overlay -->
      <div @click="close" class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"></div>
      
      <!-- About Us Card -->
      <div class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-cyan-500/20 overflow-hidden transform transition-all">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-cyan-500 to-teal-500 p-6 text-center relative">
          <button @click="close" class="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
            <X class="w-5 h-5" />
          </button>
          
          <!-- Mock Logo -->
          <div class="w-12 h-12 mx-auto bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
            <MapPin class="w-6 h-6 text-white" />
          </div>
          
          <h2 class="text-2xl font-bold text-white tracking-wide">Trento Smart City</h2>
          <p class="text-cyan-50/90 text-sm mt-1 font-medium">Dashboard v1.0.0</p>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-6">
          
          <!-- Mission -->
          <div class="text-center space-y-2">
            <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Un progetto universitario per il monitoraggio in tempo reale della mobilità e dell'ambiente urbano. Progettato per rendere Trento una città più intelligente, sicura e sostenibile.
            </p>
          </div>

          <div class="border-t border-slate-200 dark:border-slate-700/80"></div>

          <!-- Data Sources -->
          <div class="space-y-3">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Database class="w-4 h-4" /> Data Sources
            </h3>
            <div class="flex flex-wrap gap-2">
              <span class="px-2.5 py-1 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs rounded-lg border border-cyan-200 dark:border-cyan-800">Open Data Trentino</span>
              <span class="px-2.5 py-1 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs rounded-lg border border-cyan-200 dark:border-cyan-800">Copernicus Satellite</span>
              <span class="px-2.5 py-1 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs rounded-lg border border-cyan-200 dark:border-cyan-800">OpenStreetMap</span>
            </div>
          </div>

          <!-- Team -->
          <div class="space-y-3">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Users class="w-4 h-4" /> The Team
            </h3>
            <div class="grid grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-300">
              <div class="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white">Tuo Nome</p>
                <p class="text-xs text-slate-500">Frontend & UI/UX</p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white">Nome Compagno</p>
                <p class="text-xs text-slate-500">Backend & Data</p>
              </div>
            </div>
          </div>

          <!-- Repo Button -->
          <a href="#" target="_blank" class="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:opacity-90 transition-all">
            <Github class="w-5 h-5" />
            View on GitHub
          </a>
          
        </div>
      </div>
    </div>
  </Teleport>
</template>