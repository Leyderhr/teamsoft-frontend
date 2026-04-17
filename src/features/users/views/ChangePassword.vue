<script setup>
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Card from 'primevue/card'
import { useAuth } from '@/composables/useAuth'

const toast = useToast()
const { changePassword, isChangingPassword } = useAuth()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const handleSubmit = async () => {
  if (!currentPassword.value?.trim()) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'Ingrese su contraseña actual', life: 3000 })
    return
  }
  if (!newPassword.value?.trim()) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'Ingrese la nueva contraseña', life: 3000 })
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'Las contraseñas no coinciden', life: 3000 })
    return
  }
  if (newPassword.value.length < 6) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'La contraseña debe tener al menos 6 caracteres', life: 3000 })
    return
  }

  try {
    await changePassword({
      currentPassword: currentPassword.value.trim(),
      newPassword: newPassword.value.trim(),
      confirmPassword: confirmPassword.value.trim()
    })
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Contraseña actualizada correctamente',
      life: 3000
    })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    console.error('Error cambiando contraseña:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cambiar la contraseña. Verifique su contraseña actual.',
      life: 4000
    })
  }
}
</script>

<template>
  <div class="p-4 pl-15 flex justify-center">
    <div class="w-full" style="max-width: 480px">
      <h1 class="text-black titulo text-left font-bold py-0 my-0">Cambiar Contraseña</h1>

      <Card class="mt-4">
        <template #content>
          <div class="flex flex-col gap-5">
            <!-- Contraseña actual -->
            <div class="flex flex-col gap-1">
              <label class="text-sm font-semibold text-[var(--ts-text-primary)]">
                Contraseña actual <span class="text-red-500">*</span>
              </label>
              <Password
                v-model="currentPassword"
                placeholder="Ingrese su contraseña actual"
                :toggleMask="true"
                :feedback="false"
                class="w-full"
                inputClass="w-full"
                autocomplete="current-password"
              />
            </div>

            <!-- Nueva contraseña -->
            <div class="flex flex-col gap-1">
              <label class="text-sm font-semibold text-[var(--ts-text-primary)]">
                Nueva contraseña <span class="text-red-500">*</span>
              </label>
              <Password
                v-model="newPassword"
                placeholder="Ingrese la nueva contraseña"
                :toggleMask="true"
                :feedback="true"
                class="w-full"
                inputClass="w-full"
                autocomplete="new-password"
              />
            </div>

            <!-- Confirmar nueva contraseña -->
            <div class="flex flex-col gap-1">
              <label class="text-sm font-semibold text-[var(--ts-text-primary)]">
                Confirmar nueva contraseña <span class="text-red-500">*</span>
              </label>
              <Password
                v-model="confirmPassword"
                placeholder="Confirme la nueva contraseña"
                :toggleMask="true"
                :feedback="false"
                class="w-full"
                inputClass="w-full"
                autocomplete="new-password"
              />
            </div>

            <!-- Submit button -->
            <div class="flex justify-end pt-2">
              <Button
                label="Actualizar Contraseña"
                icon="pi pi-lock"
                :loading="isChangingPassword"
                @click="handleSubmit"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.titulo {
  font-size: 2.5rem;
  margin: 20px 0;
  font-family: Arial, "Arial CE", "Lucida Grande CE", lucida, "Helvetica CE", sans-serif;
}
</style>
