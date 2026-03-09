<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import InputNumber from 'primevue/inputnumber'
import RadioButton from 'primevue/radiobutton'
import Button from 'primevue/button'
import Card from 'primevue/card'
import importService from '@/features/import/services/importService.js'

const toast = useToast()
const loading = ref(false)
const saving = ref(false)

// Config fields
const cutoffPoint = ref(0.5)
const yearsExperience = ref(5)
const updateIfExists = ref('ignore')   // 'ignore' | 'update'
const oldValuesAction = ref('keep')    // 'keep' | 'delete'

const loadConfig = async () => {
    loading.value = true
    try {
        const data = await importService.getConfig()
        cutoffPoint.value = data.cutoffPoint ?? 0.5
        yearsExperience.value = data.yearsExperience ?? 5
        updateIfExists.value = data.updateIfExists ?? 'ignore'
        oldValuesAction.value = data.oldValuesAction ?? 'keep'
    } catch (error) {
        // Use defaults if config not found
        console.warn('Config not found, using defaults')
    } finally {
        loading.value = false
    }
}

const handleSave = async () => {
    saving.value = true
    try {
        await importService.saveConfig({
            cutoffPoint: cutoffPoint.value,
            yearsExperience: yearsExperience.value,
            updateIfExists: updateIfExists.value,
            oldValuesAction: oldValuesAction.value
        })
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Configuración guardada correctamente', life: 3000 })
    } catch (error) {
        console.error('Error guardando config:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la configuración', life: 3000 })
    } finally {
        saving.value = false
    }
}

const handleCancel = () => {
    loadConfig()
}

onMounted(loadConfig)
</script>

<template>
  <div class="p-4 pl-15 flex justify-center">
    <div class="w-full" style="max-width: 560px">
      <h1 class="titulo text-black font-bold">Configuración de Importación</h1>

      <Card class="mt-4">
        <template #content>
          <div class="flex flex-col gap-6">

            <!-- Punto de corte -->
            <div class="flex flex-col gap-2">
              <label class="font-semibold text-sm text-[var(--ts-text-primary)]">
                Punto de Corte
                <span class="text-[var(--ts-text-muted)] font-normal">(0.1 – 1.0)</span>
              </label>
              <InputNumber
                v-model="cutoffPoint"
                :min="0.1" :max="1.0" :step="0.1"
                :minFractionDigits="1" :maxFractionDigits="1"
                mode="decimal"
                showButtons
                class="w-48"
              />
              <small class="text-[var(--ts-text-muted)]">
                Umbral mínimo de compatibilidad para asignar un trabajador a un rol.
              </small>
            </div>

            <!-- Años de experiencia -->
            <div class="flex flex-col gap-2">
              <label class="font-semibold text-sm text-[var(--ts-text-primary)]">
                Número de Años de Experiencia
              </label>
              <InputNumber
                v-model="yearsExperience"
                :min="0" :max="60" :step="1"
                showButtons
                class="w-48"
              />
            </div>

            <!-- Actualizar si existe -->
            <div class="flex flex-col gap-3">
              <label class="font-semibold text-sm text-[var(--ts-text-primary)]">
                Actualizar si existe
              </label>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <RadioButton v-model="updateIfExists" value="ignore" inputId="ignore" />
                  <label for="ignore" class="cursor-pointer">Ignorar</label>
                </div>
                <div class="flex items-center gap-2">
                  <RadioButton v-model="updateIfExists" value="update" inputId="update" />
                  <label for="update" class="cursor-pointer">Actualizar valores</label>
                </div>
              </div>
            </div>

            <!-- Acción en valores antiguos (solo si update) -->
            <div v-if="updateIfExists === 'update'" class="flex flex-col gap-3 pl-4 border-l-2 border-[var(--ts-border)]">
              <label class="font-semibold text-sm text-[var(--ts-text-primary)]">
                Acciones en valores antiguos
              </label>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <RadioButton v-model="oldValuesAction" value="keep" inputId="keep" />
                  <label for="keep" class="cursor-pointer">Mantener valores antiguos</label>
                </div>
                <div class="flex items-center gap-2">
                  <RadioButton v-model="oldValuesAction" value="delete" inputId="delete" />
                  <label for="delete" class="cursor-pointer">Eliminar valores antiguos</label>
                </div>
              </div>
            </div>

            <!-- Botones -->
            <div class="flex justify-end gap-2 pt-2 border-t border-[var(--ts-border)]">
              <Button label="Cancelar" icon="pi pi-times" severity="secondary" outlined @click="handleCancel" />
              <Button label="Guardar" icon="pi pi-check" :loading="saving" @click="handleSave" />
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
