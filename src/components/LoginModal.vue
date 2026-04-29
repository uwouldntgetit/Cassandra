<script setup lang="ts">
import { Mail, Lock, X } from 'lucide-vue-next'

// Definiamo le proprietà che il componente riceve dall'esterno
defineProps<{
  isOpen: boolean
}>()

// Definiamo gli eventi che il componente può inviare al "padre" (App.vue)
const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div @click="close" class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"></div>
      
      <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-cyan-500/20 overflow-hidden transform transition-all">
        
        <div class="bg-gradient-to-r from-cyan-500 to-teal-500 p-6 text-center relative">
          <button @click="close" class="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
            <X class="w-5 h-5" />
          </button>
          <h2 class="text-2xl font-bold text-white">Welcome Back</h2>
          <p class="text-cyan-50/80 text-sm mt-1">Sign in to access Trento Smart City</p>
        </div>

        <div class="p-8 space-y-5">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Email Address</label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
              <input 
                type="email" 
                placeholder="your.email@example.com" 
                class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="flex justify-between items-center px-1">
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400">Password</label>
              <a href="#" class="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline">Forgot password?</a>
            </div>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
              <input 
                type="password" 
                placeholder="Enter your password" 
                class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <button class="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-2">
            Sign In
          </button>

          <p class="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
            Don't have an account? <a href="#" class="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>