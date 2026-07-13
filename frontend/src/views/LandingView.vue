<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Activity, Shield, Zap, ArrowRight, User } from 'lucide-vue-next'
import BaseButton from '../components/BaseButton.vue'

const router = useRouter()
const emit = defineEmits(['open-login'])

const goToDashboard = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="relative w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center overflow-hidden">
    <!-- Background decorative elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-500/20 blur-[120px]"></div>
      <div class="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px]"></div>
    </div>

    <!-- Main Content -->
    <div class="z-10 flex flex-col items-center text-center max-w-3xl px-6">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-cyan-400 mb-8 backdrop-blur-md">
        <Activity class="w-4 h-4" /> v2.0 - Cassandra
      </div>
      
      <h1 class="text-5xl md:text-7xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
        Cassandra.
      </h1>
      
      <p class="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
        La dashboard in tempo reale per il Comune di Trento. Monitora traffico, affluenza, illuminazione smart e qualità dell'aria da un'unica interfaccia.
      </p>

      <div class="flex flex-col sm:flex-row items-center gap-4">
        <BaseButton variant="primary" class="px-8 py-4 rounded-2xl text-lg" @click="goToDashboard">
          Vai alla Dashboard <ArrowRight class="w-5 h-5" />
        </BaseButton>
        <BaseButton variant="secondary" class="px-8 py-4 rounded-2xl text-lg" @click="emit('open-login')">
          <User class="w-5 h-5" /> Accesso operatori
        </BaseButton>
      </div>
    </div>

    <!-- Features -->
    <div class="absolute bottom-12 left-0 w-full flex justify-center gap-8 px-6 hidden md:flex opacity-60">
      <div class="flex items-center gap-2 text-sm text-slate-300 font-medium"><Activity class="w-4 h-4 text-cyan-400" /> Analisi in tempo reale</div>
      <div class="flex items-center gap-2 text-sm text-slate-300 font-medium"><Shield class="w-4 h-4 text-purple-400" /> Architettura sicura</div>
      <div class="flex items-center gap-2 text-sm text-slate-300 font-medium"><Zap class="w-4 h-4 text-yellow-400" /> Interfaccia fulminea</div>
    </div>
  </div>
</template>
