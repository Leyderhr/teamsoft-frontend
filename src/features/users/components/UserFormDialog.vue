<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Select from 'primevue/select'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import personService from '@/features/persons/services/personService.js'

const props = defineProps({
  visible: Boolean,
  mode: String,
  initialData: Object
})

const emit = defineEmits(['update:visible', 'save', 'cancel'])
const toast = useToast()

// Form fields
const username = ref('')
const password = ref('')
const selectedPerson = ref(null)
const selectedRole = ref(null)

// Options
const personOptions = ref([])

const roleOptions = [
  { label: 'Administrador', value: 'ROLE_ADMIN' },
  { label: 'Gestor RRHH', value: 'ROLE_GESTOR_RRHH' },
  { label: 'Directivo Técnico', value: 'ROLE_DIRECTIVO_TECNICO' },
  { label: 'Experimentador', value: 'ROLE_EXPERIMENTADOR' },
  { label: 'Jefe de Equipo', value: 'ROLE_JEFE_DE_EQUIPO' },
  { label: 'Trabajador', value: 'ROLE_WORKER' }
]

// Load persons on mount
onMounted(async () => {
  try {
    const data = await personService.getAll()
    personOptions.value = data
  } catch (error) {
    console.error('Error cargando personas:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las personas',
      life: 3000
    })
  }
})

// Reset form
const resetForm = () => {
  username.value = ''
  password.value = ''
  selectedPerson.value = null
  selectedRole.value = null
}

// Populate form in edit mode
watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.mode === 'edit' && props.initialData) {
        username.value = props.initialData.username || ''
        password.value = ''
        selectedPerson.value = props.initialData.person?.id ?? props.initialData.personId ?? null
        selectedRole.value = props.initialData.role || null
      } else {
        resetForm()
      }
    }
  }
)

const dialogTitle = computed(() =>
  props.mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'
)

const isEditMode = computed(() => props.mode === 'edit')

const handleSave = () => {
  if (!username.value?.trim()) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'El nombre de usuario es requerido', life: 3000 })
    return
  }
  if (!selectedPerson.value) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'Debe seleccionar una persona', life: 3000 })
    return
  }
  if (!selectedRole.value) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'Debe seleccionar un rol', life: 3000 })
    return
  }
  if (!isEditMode.value && !password.value?.trim()) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'La contraseña es requerida', life: 3000 })
    return
  }

  const payload = {
    username: username.value.trim(),
    personId: selectedPerson.value,
    role: selectedRole.value
  }

  // Only include password if provided
  if (password.value?.trim()) {
    payload.password = password.value.trim()
  }

  emit('save', payload)
  emit('update:visible', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    :header="dialogTitle"
    :modal="true"
    :closable="true"
    :style="{ width: '480px' }"
    @update:visible="$emit('update:visible', $event)"
    @hide="handleCancel"
  >
    <div class="flex flex-col gap-4 pt-2">
      <!-- Persona -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-[var(--ts-text-primary)]">
          Persona <span class="text-red-500">*</span>
        </label>
        <Select
          v-model="selectedPerson"
          :options="personOptions"
          optionLabel="personName"
          optionValue="id"
          placeholder="Seleccione una persona"
          filter
          filterPlaceholder="Buscar persona..."
          class="w-full"
        >
          <template #option="{ option }">
            <span>{{ option.personName }} {{ option.surName }}</span>
          </template>
          <template #value="{ value }">
            <span v-if="value">
              {{
                personOptions.find(p => p.id === value)
                  ? `${personOptions.find(p => p.id === value).personName} ${personOptions.find(p => p.id === value).surName}`
                  : value
              }}
            </span>
            <span v-else class="text-[var(--ts-text-muted)]">Seleccione una persona</span>
          </template>
        </Select>
      </div>

      <!-- Username -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-[var(--ts-text-primary)]">
          Nombre de usuario <span class="text-red-500">*</span>
        </label>
        <InputText
          v-model="username"
          placeholder="Ingrese el nombre de usuario"
          class="w-full"
          autocomplete="off"
        />
      </div>

      <!-- Password -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-[var(--ts-text-primary)]">
          Contraseña <span v-if="!isEditMode" class="text-red-500">*</span>
          <span v-else class="text-xs font-normal text-[var(--ts-text-muted)]"> (dejar en blanco para no cambiar)</span>
        </label>
        <Password
          v-model="password"
          :placeholder="isEditMode ? 'Nueva contraseña (opcional)' : 'Ingrese la contraseña'"
          :toggleMask="true"
          :feedback="true"
          class="w-full"
          inputClass="w-full"
          autocomplete="new-password"
        />
      </div>

      <!-- Rol -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-[var(--ts-text-primary)]">
          Rol <span class="text-red-500">*</span>
        </label>
        <Select
          v-model="selectedRole"
          :options="roleOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Seleccione un rol"
          class="w-full"
        />
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="handleCancel"
        />
        <Button
          label="Guardar"
          icon="pi pi-check"
          @click="handleSave"
        />
      </div>
    </template>
  </Dialog>
</template>
