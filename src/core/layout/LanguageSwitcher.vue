<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Check } from 'lucide-vue-next'
import { useLocaleStore } from '@/core/store/locale.store.js'
import FlagIcon from '@/core/layout/FlagIcon.vue'

const localeStore = useLocaleStore()
const isOpen = ref(false)
const containerRef = ref(null)

const languages = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' }
]

const currentLang = computed(() =>
  languages.find(l => l.code === localeStore.currentLanguage) ?? languages[0]
)

const selectLanguage = (code) => {
  localeStore.setLanguage(code)
  isOpen.value = false
}

const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div class="relative" ref="containerRef">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
    >
      <FlagIcon :code="localeStore.currentLanguage" />
      <span class="font-medium text-sm uppercase">{{ localeStore.currentLanguage }}</span>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-44 rounded-2xl border border-gray-200 bg-white p-2 shadow-theme-lg z-50"
    >
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="selectLanguage(lang.code)"
        class="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-100"
        :class="localeStore.currentLanguage === lang.code ? 'text-brand-500 font-medium' : 'text-gray-700'"
      >
        <FlagIcon :code="lang.code" />
        <span class="flex-1 text-left">{{ lang.name }}</span>
        <Check v-if="localeStore.currentLanguage === lang.code" class="w-4 h-4 flex-shrink-0" />
      </button>
    </div>
  </div>
</template>
