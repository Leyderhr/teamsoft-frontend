<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AlertTriangle } from 'lucide-vue-next'

const router = useRouter()
const currentYear = ref(new Date().getFullYear())

const reload = () => window.location.reload()
</script>

<template>
  <div class="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 bg-white font-outfit">

    <!-- Grid decoration: top-right -->
    <div class="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px] pointer-events-none select-none">
      <svg viewBox="0 0 450 450" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
        <defs>
          <pattern id="g500" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#ddd6fe"/>
          </pattern>
        </defs>
        <rect width="450" height="450" fill="url(#g500)"/>
      </svg>
    </div>
    <!-- Grid decoration: bottom-left -->
    <div class="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px] pointer-events-none select-none">
      <svg viewBox="0 0 450 450" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
        <rect width="450" height="450" fill="url(#g500)"/>
      </svg>
    </div>

    <!-- Content -->
    <div class="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">

      <h1 class="mb-8 font-bold text-title-md xl:text-title-2xl" style="color: #7a5af8;">
        ERROR
      </h1>

      <div class="mx-auto mb-2 flex items-center justify-center w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] rounded-full" style="background-color: #f5f3ff;">
        <AlertTriangle class="w-24 h-24 sm:w-32 sm:h-32" stroke-width="1.2" style="color: #9d78fb;" />
      </div>

      <!-- Sub-label -->
      <p class="text-sm font-semibold tracking-widest uppercase mb-4" style="color: #7a5af8;">500 — Error del Servidor</p>

      <p class="mt-6 mb-6 text-base text-gray-700 sm:text-lg">
        Ha ocurrido un error interno en el servidor. Intenta recargar la página o vuelve
        más tarde. Si el problema persiste, contacta al administrador.
      </p>

      <div class="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          @click="reload"
          class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer"
        >
          Recargar Página
        </button>
        <button
          type="button"
          @click="router.push('/')"
          class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer"
        >
          Ir al Inicio
        </button>
      </div>
    </div>

    <!-- Footer -->
    <p class="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 whitespace-nowrap">
      &copy; {{ currentYear }} - TeamSoft
    </p>
  </div>
</template>
