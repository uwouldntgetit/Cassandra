<script setup lang="ts">
/**
 * SignupModal.vue
 * Registration modal for new users.
 * Validates user input and creates a new session via AuthStore.
 * 
 * Modale di registrazione per i nuovi utenti.
 * Valida l'input dell'utente e crea una nuova sessione tramite l'AuthStore.
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { Mail, Lock, User, X } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close', 'switch-to-login'])

const handleSignup = () => {
  errorMessage.value = ''

  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'Please fill in all fields.'
    return 
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email.value)) {
    errorMessage.value = 'Please enter a valid email address.'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long.'
    return
  }

  // Password confirmation validation
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  // Pass full name to AuthStore
  authStore.login(email.value, name.value)
  
  name.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  errorMessage.value = ''
  emit('close')
}

const close = () => {
  errorMessage.value = ''
  emit('close')
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    close()
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
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
          <h2 class="text-2xl font-bold text-white tracking-wide">Create Account</h2>
          <p class="text-cyan-50/80 text-sm mt-1">Join Trento Smart City</p>
        </div>

        <div class="p-8 space-y-4">
          
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Full Name</label>
            <div class="relative">
              <User class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
              <input v-model="name" type="text" placeholder="John Doe" class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm text-slate-900 dark:text-slate-100" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Email Address</label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
              <input v-model="email" type="email" placeholder="your.email@example.com" class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm text-slate-900 dark:text-slate-100" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Password</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
              <input v-model="password" type="password" placeholder="Min. 6 characters" class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm text-slate-900 dark:text-slate-100" />
            </div>
          </div>

          <!-- Confirm Password Field -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Confirm Password</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
              <input v-model="confirmPassword" type="password" placeholder="Repeat password" class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm text-slate-900 dark:text-slate-100" />
            </div>
          </div>

          <p v-if="errorMessage" class="text-xs font-medium text-red-500 text-center animate-pulse pt-1">
            {{ errorMessage }}
          </p>

          <button @click="handleSignup" class="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-2">
            Sign Up
          </button>

          <p class="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
            Already have an account? <button @click.prevent="emit('switch-to-login')" class="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>