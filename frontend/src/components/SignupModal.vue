<script setup lang="ts">
/**
 * SignupModal.vue
 * Registration modal for new users.
 * Validates user input and creates a new session via AuthStore.
 * 
 * Modale di registrazione per i nuovi utenti.
 * Valida l'input dell'utente e crea una nuova sessione tramite l'AuthStore.
 */
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, User, X } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'
import BaseButton from './BaseButton.vue'

const authStore = useAuthStore()
const router    = useRouter()
const googleBtnRef = ref<HTMLElement | null>(null)

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close', 'switch-to-login'])

const isLoading = ref(false)

const handleSignup = async () => {
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

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  isLoading.value = true
  try {
    await authStore.register(name.value, email.value, password.value)
    name.value = ''
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    emit('close')
    router.push(authStore.user?.role === 'admin' ? '/admin' : '/dashboard')
  } catch (e: any) {
    errorMessage.value = e.message || 'Registration failed. Try again.'
  } finally {
    isLoading.value = false
  }
}

const close = () => { errorMessage.value = ''; emit('close') }

const handleGoogleCallback = async (response: any) => {
  errorMessage.value = ''
  isLoading.value = true
  try {
    await authStore.googleLogin(response.credential)
    emit('close')
    router.push(authStore.user?.role === 'admin' ? '/admin' : '/dashboard')
  } catch (e: any) {
    errorMessage.value = e.message || 'Google Sign-In failed.'
  } finally {
    isLoading.value = false
  }
}

function initGoogleButton() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId || !(window as any).google || !googleBtnRef.value) return
  ;(window as any).google.accounts.id.initialize({ client_id: clientId, callback: handleGoogleCallback })
  ;(window as any).google.accounts.id.renderButton(googleBtnRef.value, {
    theme: 'outline', size: 'large', width: googleBtnRef.value.offsetWidth || 300, locale: 'en'
  })
}

watch(() => props.isOpen, (open) => { if (open) setTimeout(() => initGoogleButton(), 100) })

onMounted(() => {
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && props.isOpen) close() })
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div @click="close" class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"></div>
      

      <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-cyan-500/20 overflow-hidden transform transition-all scale-[0.7] md:scale-100">
        
        <div class="bg-gradient-to-r from-cyan-500 to-blue-500 p-6 text-center relative">
          <button @click="close" class="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
            <X class="w-5 h-5" />
          </button>
          <h2 class="text-2xl font-bold text-white tracking-wide">Create Account</h2>
          <p class="text-cyan-50/80 text-sm mt-1">Join Trento Smart City</p>
        </div>

        <div class="p-8 space-y-4">

          <!-- Google Sign-In -->
          <div class="space-y-3">
            <div ref="googleBtnRef" class="flex justify-center min-h-[44px]"></div>
            <div class="flex items-center gap-3">
              <div class="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
              <span class="text-xs text-slate-400">or sign up with email</span>
              <div class="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
            </div>
          </div>

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

          <BaseButton variant="primary" class="w-full py-3.5 rounded-xl mt-2" @click="handleSignup" :disabled="isLoading">
            {{ isLoading ? 'Creating account...' : 'Sign Up' }}
          </BaseButton>

          <p class="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
            Already have an account? <button @click.prevent="emit('switch-to-login')" class="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>