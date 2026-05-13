<script setup lang="ts">
/**
 * BaseButton.vue
 * A unified button component to enforce consistent styling across the application.
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'github',
  type?: 'button' | 'submit' | 'reset'
}>(), {
  variant: 'primary',
  type: 'button'
})

const emit = defineEmits(['click'])

const baseClasses = "flex items-center justify-center gap-2 font-bold transition-all duration-300 transform"

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98]"
    case 'secondary':
      return "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:scale-105"
    case 'github':
      return "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg hover:opacity-90"
    default:
      return "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98]"
  }
})
</script>

<template>
  <button :type="type" @click="emit('click')" :class="[baseClasses, variantClasses]">
    <slot />
  </button>
</template>
