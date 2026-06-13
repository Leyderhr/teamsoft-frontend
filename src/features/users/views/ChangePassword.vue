<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { Save, Loader2, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import { useAuth } from '@/composables/useAuth'

const toast = useToast()
const { changePassword, isChangingPassword } = useAuth()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
const strengthVisible = ref(false)

const requirements = computed(() => [
  { label: 'Al menos 8 caracteres',       met: newPassword.value.length >= 8 },
  { label: 'Al menos una letra mayúscula', met: /[A-Z]/.test(newPassword.value) },
  { label: 'Al menos una letra minúscula', met: /[a-z]/.test(newPassword.value) },
  { label: 'Al menos un número',           met: /[0-9]/.test(newPassword.value) },
  { label: 'Al menos un carácter especial', met: /[^A-Za-z0-9]/.test(newPassword.value) },
])

const metCount = computed(() => requirements.value.filter(r => r.met).length)

const strengthConfig = computed(() => {
  const n = metCount.value
  if (n === 0) return { label: '',           segments: 0, color: 'bg-gray-200',    text: 'text-gray-400' }
  if (n === 1) return { label: 'Muy débil',  segments: 1, color: 'bg-error-500',   text: 'text-error-600' }
  if (n === 2) return { label: 'Débil',      segments: 2, color: 'bg-orange-400',  text: 'text-orange-500' }
  if (n === 3) return { label: 'Regular',    segments: 3, color: 'bg-warning-400', text: 'text-warning-600' }
  if (n === 4) return { label: 'Fuerte',     segments: 4, color: 'bg-success-400', text: 'text-success-600' }
  return              { label: 'Muy fuerte', segments: 5, color: 'bg-success-500', text: 'text-success-600' }
})

const handleSubmit = async () => {
  if (!currentPassword.value?.trim()) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'Ingrese su contraseña actual', life: 3000 })
    return
  }
  if (!newPassword.value?.trim()) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'Ingrese la nueva contraseña', life: 3000 })
    return
  }
  if (newPassword.value.length < 8) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'La contraseña debe tener al menos 8 caracteres', life: 3000 })
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'Las contraseñas no coinciden', life: 3000 })
    return
  }

  try {
    await changePassword({
      currentPassword: currentPassword.value.trim(),
      newPassword: newPassword.value.trim(),
      confirmPassword: confirmPassword.value.trim(),
    })
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Contraseña actualizada correctamente', life: 3000 })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    strengthVisible.value = false
  } catch (error) {
    console.error('Error cambiando contraseña:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar la contraseña. Verifique su contraseña actual.', life: 4000 })
  }
}
</script>

<template>
  <div>
    <PageBreadcrumb page-title="Cambiar Contraseña" />

    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-base font-semibold text-gray-800">Cambiar Contraseña</h2>
      </div>

      <div class="p-6 space-y-5">
        <!-- Contraseña actual -->
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700">
            Contraseña actual <span class="text-error-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="currentPassword"
              :type="showCurrent ? 'text' : 'password'"
              placeholder="Ingrese su contraseña actual"
              autocomplete="current-password"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
            <button
              type="button"
              @click="showCurrent = !showCurrent"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              :aria-label="showCurrent ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <EyeOff v-if="showCurrent" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Nueva contraseña -->
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700">
            Nueva contraseña <span class="text-error-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="newPassword"
              :type="showNew ? 'text' : 'password'"
              placeholder="Ingrese la nueva contraseña"
              autocomplete="new-password"
              @focus="strengthVisible = true"
              @blur="strengthVisible = false"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
            <button
              type="button"
              @mousedown.prevent
              @click="showNew = !showNew"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              :aria-label="showNew ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <EyeOff v-if="showNew" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>

            <!-- Strength panel — floating, does not affect layout -->
            <div
              v-if="strengthVisible && newPassword.length > 0"
              class="absolute left-0 right-0 top-full mt-1.5 z-20 p-4 rounded-xl border border-gray-200 bg-white shadow-theme-md space-y-3"
            >
              <!-- Bar + label -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500 font-medium">Fortaleza</span>
                  <span :class="[strengthConfig.text, 'font-semibold']">{{ strengthConfig.label }}</span>
                </div>
                <div class="flex gap-1">
                  <div
                    v-for="i in 5"
                    :key="i"
                    class="h-1.5 flex-1 rounded-full transition-colors duration-300"
                    :class="i <= strengthConfig.segments ? strengthConfig.color : 'bg-gray-200'"
                  />
                </div>
              </div>

              <!-- Requirements -->
              <ul class="space-y-1.5">
                <li
                  v-for="req in requirements"
                  :key="req.label"
                  class="flex items-center gap-2 text-xs"
                  :class="req.met ? 'text-success-600' : 'text-error-600'"
                >
                  <CheckCircle2 v-if="req.met" class="w-3.5 h-3.5 flex-shrink-0" />
                  <XCircle v-else class="w-3.5 h-3.5 flex-shrink-0" />
                  {{ req.label }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Confirmar nueva contraseña -->
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700">
            Confirmar nueva contraseña <span class="text-error-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              placeholder="Confirme la nueva contraseña"
              autocomplete="new-password"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
            <button
              type="button"
              @click="showConfirm = !showConfirm"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              :aria-label="showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <EyeOff v-if="showConfirm" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
        <button
          type="button"
          @click="handleSubmit"
          :disabled="isChangingPassword"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Loader2 v-if="isChangingPassword" class="w-4 h-4 animate-spin" />
          <Save v-else class="w-4 h-4" />
          {{ isChangingPassword ? 'Actualizando...' : 'Actualizar Contraseña' }}
        </button>
      </div>
    </div>
  </div>
</template>
