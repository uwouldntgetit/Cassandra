<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close', 'switch-to-login'])

const close = () => emit('close')
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
          <h2 class="text-2xl font-bold text-white tracking-wide">Create Account</h2>
          <p class="text-cyan-50/80 text-sm mt-1">Join Trento Smart City Dashboard</p>
        </div>

        <div class="p-8 space-y-4">

          <form @submit.prevent class="space-y-4">
            
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Email address</label>
              <input 
                type="email" 
                placeholder="your.email@example.com" 
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Confirm Password</label>
              <input 
                type="password" 
                placeholder="Enter password again" 
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            <button type="submit" class="w-full py-3.5 mt-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
              Create Account
            </button>
          </form>

          <div class="relative flex py-3 items-center">
            <div class="flex-grow border-t border-slate-200 dark:border-slate-700/80"></div>
            <span class="flex-shrink-0 mx-4 text-slate-400 dark:text-slate-500 text-xs">or</span>
            <div class="flex-grow border-t border-slate-200 dark:border-slate-700/80"></div>
          </div>

          <p class="text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account? 
            <button @click="emit('switch-to-login')" class="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>