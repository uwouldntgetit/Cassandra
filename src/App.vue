<script setup lang="ts">
/**
 * App.vue
 * Main orchestrator component.
 * Responsible for layout positioning, theme management, and mounting global modals.
 * 
 * Componente principale di orchestrazione.
 * Responsabile del posizionamento del layout, gestione del tema e caricamento dei modali globali.
 */
import { ref, onMounted } from 'vue'

import LoginModal from './components/LoginModal.vue'
import SignupModal from './components/SignupModal.vue'
import SettingsModal from './components/SettingsModal.vue'
import AboutModal from './components/AboutModal.vue'

const isDark = ref(true)

const showLoginModal = ref(false)
const showSignupModal = ref(false)
const showSettingsModal = ref(false)
const showAboutModal = ref(false)

const openLogin = () => { showSignupModal.value = false; showLoginModal.value = true }
const openSignup = () => { showLoginModal.value = false; showSignupModal.value = true }

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark')
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', 'dark')
  document.documentElement.classList.add('dark')
})
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden font-sans">
    
    <router-view 
      :isDark="isDark" 
      @toggle-theme="toggleTheme" 
      @open-login="openLogin" 
      @open-settings="showSettingsModal = true" 
      @open-about="showAboutModal = true" 
    />
    
    <!-- Global Modals -->
    <LoginModal :isOpen="showLoginModal" @close="showLoginModal = false" @switch-to-signup="openSignup" />
    <SignupModal :isOpen="showSignupModal" @close="showSignupModal = false" @switch-to-login="openLogin" />
    <SettingsModal :isOpen="showSettingsModal" @close="showSettingsModal = false" />
    <AboutModal :isOpen="showAboutModal" @close="showAboutModal = false" />

  </div>
</template>

<style>
/* Global styles can be added here or in style.css */
</style>