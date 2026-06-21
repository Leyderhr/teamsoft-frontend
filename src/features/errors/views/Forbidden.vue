<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Lock } from 'lucide-vue-next'

const { t } = useI18n()
const router = useRouter()
const currentYear = ref(new Date().getFullYear())
</script>

<template>
  <div class="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 bg-white font-outfit">

    <!-- Grid decoration: top-right -->
    <div class="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px] pointer-events-none select-none">
      <svg viewBox="0 0 450 450" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
        <defs>
          <pattern id="g403" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#fedf89"/>
          </pattern>
        </defs>
        <rect width="450" height="450" fill="url(#g403)"/>
      </svg>
    </div>
    <!-- Grid decoration: bottom-left -->
    <div class="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px] pointer-events-none select-none">
      <svg viewBox="0 0 450 450" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
        <rect width="450" height="450" fill="url(#g403)"/>
      </svg>
    </div>

    <!-- Content -->
    <div class="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">

      <h1 class="mb-8 font-bold text-warning-500 text-title-md xl:text-title-2xl">
        {{ t('errors.common.errorLabel') }}
      </h1>

      <div class="mx-auto mb-2 flex items-center justify-center w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] rounded-full bg-warning-50">
        <Lock class="w-24 h-24 sm:w-32 sm:h-32 text-warning-400" stroke-width="1.2" />
      </div>

      <!-- Sub-label -->
      <p class="text-sm font-semibold text-warning-500 tracking-widest uppercase mb-4">{{ t('errors.forbidden.subtitle') }}</p>

      <p class="mt-6 mb-6 text-base text-gray-700 sm:text-lg">
        {{ t('errors.forbidden.message') }}
      </p>

      <div class="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          @click="router.push('/')"
          class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer"
        >
          {{ t('common.goHome') }}
        </button>
        <button
          type="button"
          @click="router.back()"
          class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer"
        >
          {{ t('common.goBack') }}
        </button>
      </div>
    </div>

    <!-- Footer -->
    <p class="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 whitespace-nowrap">
      &copy; {{ currentYear }} - TeamSoft
    </p>
  </div>
</template>
