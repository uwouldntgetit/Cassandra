<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, X } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'
import BaseButton from './BaseButton.vue'

const authStore = useAuthStore()
const router    = useRouter()

const email    = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading    = ref(false)
const googleBtnRef = ref<HTMLElement | null>(null)

const props = defineProps<{ isOpen: boolean }>()
const emit  = defineEmits(['close', 'switch-to-signup'])

const handleLogin = async () => {
  errorMessage.value = ''
  if (!email.value || !password.value) { errorMessage.value = 'Inserisci email e password.'; return }
  isLoading.value = true
  try {
    await authStore.login(email.value, password.value)
    email.value = ''; password.value = ''
    emit('close')
    router.push(authStore.user?.role === 'admin' ? '/admin' : '/dashboard')
  } catch (e: any) {
    errorMessage.value = e.message || 'Accesso non riuscito. Controlla le credenziali.'
  } finally {
    isLoading.value = false
  }
}

const handleGoogleCallback = async (response: any) => {
  errorMessage.value = ''
  isLoading.value = true
  try {
    await authStore.googleLogin(response.credential)
    emit('close')
    router.push(authStore.user?.role === 'admin' ? '/admin' : '/dashboard')
  } catch (e: any) {
    errorMessage.value = e.message || 'Accesso con Google non riuscito.'
  } finally {
    isLoading.value = false
  }
}

function initGoogleButton() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId || !(window as any).google || !googleBtnRef.value) return
  ;(window as any).google.accounts.id.initialize({
    client_id: clientId,
    callback:  handleGoogleCallback
  })
  ;(window as any).google.accounts.id.renderButton(googleBtnRef.value, {
    theme: 'outline', size: 'large', width: googleBtnRef.value.offsetWidth || 300, locale: 'it'
  })
}

// Load the Google Identity Services script once
onMounted(() => {
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && props.isOpen) emit('close') })
  if (!(window as any).google && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => initGoogleButton()
    document.head.appendChild(script)
  }
})

// Re-render the button when the modal opens
watch(() => props.isOpen, (open) => {
  if (open) setTimeout(() => initGoogleButton(), 100)
})

const close = () => { errorMessage.value = ''; emit('close') }
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
          <h2 class="text-2xl font-bold text-white">Bentornato</h2>
          <p class="text-cyan-50/80 text-sm mt-1">Accedi per usare Cassandra</p>
        </div>

        <div class="p-8 space-y-5">
          <!-- Google Sign-In button -->
          <div class="space-y-3">
            <div ref="googleBtnRef" class="flex justify-center min-h-[44px]"></div>
            <div class="flex items-center gap-3">
              <div class="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
              <span class="text-xs text-slate-400">oppure accedi con l'email</span>
              <div class="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Indirizzo email</label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
              <input v-model="email" type="email" placeholder="your.email@example.com"
                @keyup.enter="handleLogin"
                class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm text-slate-900 dark:text-slate-100" />
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="flex justify-between items-center px-1">
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400">Password</label>
            </div>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
              <input v-model="password" type="password" placeholder="Inserisci la password"
                @keyup.enter="handleLogin"
                class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm text-slate-900 dark:text-slate-100" />
            </div>
          </div>

          <p v-if="errorMessage" class="text-xs font-medium text-red-500 text-center animate-pulse">
            {{ errorMessage }}
          </p>

          <BaseButton variant="primary" class="w-full py-3.5 rounded-xl mt-2" @click="handleLogin" :disabled="isLoading">
            {{ isLoading ? 'Accesso in corso...' : 'Accedi' }}
          </BaseButton>

          <p class="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
            Non hai un account?
            <button @click.prevent="emit('switch-to-signup')" class="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">Registrati</button>
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
