<script setup lang="ts">
import { Thermometer, Droplets, Wind, CloudRain, Car, AlertTriangle, Activity } from 'lucide-vue-next'

defineProps<{
  activeLayers: { weather: boolean; traffic: boolean }
}>()
</script>

<template>
  <!-- Contenitore invisibile a tutta altezza, allineato a sinistra -->
  <div class="absolute left-4 top-0 bottom-0 w-full max-w-sm flex flex-col justify-center pointer-events-none z-10">
    
    <!-- La magia di Vue: TransitionGroup anima gli elementi che entrano, escono o si spostano! -->
    <TransitionGroup 
      name="panel" 
      tag="div" 
      class="flex flex-col gap-4 w-full relative"
    >
      
      <!-- CARD METEO (Notare il key="weather", fondamentale per l'animazione) -->
      <div v-if="activeLayers.weather" key="weather" class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 rounded-3xl p-6 shadow-xl pointer-events-auto">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></div>
          Weather Overview
        </h3>
        
        <div class="flex items-center justify-between mb-6">
          <div>
            <p class="text-5xl font-light text-slate-900 dark:text-white">18°<span class="text-2xl text-cyan-500 font-bold">C</span></p>
            <p class="text-sm font-medium text-slate-500 mt-1">Trento, Partly Cloudy</p>
          </div>
          <div class="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center text-cyan-500 shadow-inner">
            <CloudRain class="w-8 h-8" />
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-3">
          <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <Droplets class="w-5 h-5 text-cyan-500" />
            <div>
              <p class="text-[11px] font-bold text-slate-400 uppercase">Humidity</p>
              <p class="text-sm font-bold text-slate-900 dark:text-white">65%</p>
            </div>
          </div>
          <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <Wind class="w-5 h-5 text-cyan-500" />
            <div>
              <p class="text-[11px] font-bold text-slate-400 uppercase">Wind (NW)</p>
              <p class="text-sm font-bold text-slate-900 dark:text-white">12 km/h</p>
            </div>
          </div>
        </div>
      </div>

      <!-- CARD TRAFFICO (Notare il key="traffic") -->
      <div v-if="activeLayers.traffic" key="traffic" class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-orange-500/30 rounded-3xl p-6 shadow-xl pointer-events-auto">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
          Traffic Flow
        </h3>
        
        <div class="flex items-center justify-between mb-6">
          <div>
            <p class="text-3xl font-bold text-slate-900 dark:text-white">Moderate</p>
            <p class="text-sm font-medium text-slate-500 mt-1">Congestion Index: <span class="font-bold text-orange-500">42%</span></p>
          </div>
          <div class="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800 flex items-center justify-center text-orange-500 shadow-inner">
            <Car class="w-8 h-8" />
          </div>
        </div>
        
        <div class="space-y-3">
          <div class="flex items-start gap-3 bg-orange-50/50 dark:bg-orange-900/10 p-3.5 rounded-2xl border border-orange-100 dark:border-orange-900/30">
            <AlertTriangle class="w-5 h-5 text-orange-500 flex-shrink-0" />
            <div>
              <p class="text-sm font-bold text-slate-900 dark:text-white">Roadworks on Via Roma</p>
              <p class="text-xs font-medium text-slate-500 mt-0.5">Expected delay: 5-10 mins</p>
            </div>
          </div>
          <div class="flex items-start gap-3 bg-green-50/50 dark:bg-green-900/10 p-3.5 rounded-2xl border border-green-100 dark:border-green-900/30">
            <Activity class="w-5 h-5 text-green-500 flex-shrink-0" />
            <div>
              <p class="text-sm font-bold text-slate-900 dark:text-white">A22 Highway Toll</p>
              <p class="text-xs font-medium text-slate-500 mt-0.5">Flowing smoothly (60 km/h)</p>
            </div>
          </div>
        </div>
      </div>

    </TransitionGroup>
  </div>
</template>

<style scoped>
/* 1. Animazione di Entrata e Uscita */
.panel-enter-active,
.panel-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 2. Stato iniziale (quando entra) e stato finale (quando esce) -> Parte dal basso! */
.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(40px); /* Il 40px lo fa partire più in basso */
}

/* 3. La MAGIA: Anima fluidamente gli elementi esistenti quando devono fare spazio al nuovo */
.panel-move {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Evita comportamenti strani se un elemento viene rimosso mentre un altro si muove */
.panel-leave-active {
  position: absolute;
  width: 100%;
}
</style>