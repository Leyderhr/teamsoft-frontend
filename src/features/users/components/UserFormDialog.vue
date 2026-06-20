<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import { useToast } from 'primevue/usetoast'
import { parseApiError } from '@/lib/apiError'
import userService from '@/features/users/services/userService.js'

const props = defineProps({
  visible: Boolean,
  mode: String,
  initialData: Object
})

const emit = defineEmits(['update:visible', 'save', 'cancel'])
const toast = useToast()
const { t } = useI18n()

// Form fields
const personName = ref('')
const surname = ref('')
const card = ref('')
const mail = ref('')
const enabled = ref(true)
const selectedRoles = ref([])

// Options
const roleOptions = ref([])

// Load roles on mount
onMounted(async () => {
  try {
    const data = await userService.getRoles()
    roleOptions.value = data
  } catch (e) {
    console.error('Error cargando roles:', e)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: await parseApiError(e, t('features.users.rolesLoadError')),
      life: 3000
    })
  }
})

// Reset form
const resetForm = () => {
  personName.value = ''
  surname.value = ''
  card.value = ''
  mail.value = ''
  enabled.value = true
  selectedRoles.value = []
}

// Populate form in edit mode
watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.mode === 'edit' && props.initialData) {
        personName.value = props.initialData.personName || ''
        surname.value = props.initialData.surname || ''
        card.value = props.initialData.idCard || ''
        mail.value = props.initialData.mail || ''
        enabled.value = props.initialData.enabled ?? true
        selectedRoles.value = props.initialData.roles?.map(r => r.id) || []
      } else {
        resetForm()
      }
    }
  }
)

const dialogTitle = computed(() =>
  props.mode === 'create' ? t('features.users.dialogNewTitle') : t('features.users.dialogViewTitle')
)

const isEditMode = computed(() => props.mode === 'edit')

const handleSave = () => {
  if (!personName.value?.trim()) {
    toast.add({ severity: 'warn', summary: t('features.users.validationSummary'), detail: t('features.users.nameRequired'), life: 3000 })
    return
  }
  if (!surname.value?.trim()) {
    toast.add({ severity: 'warn', summary: t('features.users.validationSummary'), detail: t('features.users.surnameRequired'), life: 3000 })
    return
  }
  if (!card.value?.trim()) {
    toast.add({ severity: 'warn', summary: t('features.users.validationSummary'), detail: t('features.users.cardRequired'), life: 3000 })
    return
  }
  if (!mail.value?.trim()) {
    toast.add({ severity: 'warn', summary: t('features.users.validationSummary'), detail: t('features.users.mailRequired'), life: 3000 })
    return
  }
  if (!selectedRoles.value || selectedRoles.value.length === 0) {
    toast.add({ severity: 'warn', summary: t('features.users.validationSummary'), detail: t('features.users.rolesRequired'), life: 3000 })
    return
  }

  const payload = {
    personName: personName.value.trim(),
    surname: surname.value.trim(),
    card: card.value.trim(),
    mail: mail.value.trim(),
    enabled: enabled.value,
    roleIds: selectedRoles.value
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
    :style="{ width: '520px' }"
    @update:visible="$emit('update:visible', $event)"
    @hide="handleCancel"
  >
    <div class="flex flex-col gap-4 pt-2">
      <!-- Nombre -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-[var(--ts-text-primary)]">
          {{ t('features.users.nameLabel') }} <span class="text-red-500">*</span>
        </label>
        <InputText
          v-model="personName"
          :placeholder="t('features.users.nameLabel')"
          class="w-full"
          :disabled="isEditMode"
        />
      </div>

      <!-- Apellido -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-[var(--ts-text-primary)]">
          {{ t('features.users.surnameLabel') }} <span class="text-red-500">*</span>
        </label>
        <InputText
          v-model="surname"
          :placeholder="t('features.users.surnameLabel')"
          class="w-full"
          :disabled="isEditMode"
        />
      </div>

      <!-- Cédula -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-[var(--ts-text-primary)]">
          {{ t('features.users.cardLabel') }} <span class="text-red-500">*</span>
        </label>
        <InputText
          v-model="card"
          :placeholder="t('features.users.cardLabel')"
          class="w-full"
          :disabled="isEditMode"
        />
      </div>

      <!-- Correo -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-[var(--ts-text-primary)]">
          {{ t('features.users.mailLabel') }} <span class="text-red-500">*</span>
        </label>
        <InputText
          v-model="mail"
          type="email"
          :placeholder="t('features.users.mailLabel')"
          class="w-full"
          :disabled="isEditMode"
        />
      </div>

      <!-- Roles -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-[var(--ts-text-primary)]">
          {{ t('features.users.assignedRoles') }} <span class="text-red-500">*</span>
        </label>
        <Select
          v-model="selectedRoles"
          :options="roleOptions"
          optionLabel="name"
          optionValue="id"
          :placeholder="t('features.users.availableRoles')"
          multiple
          filter
          class="w-full"
          :disabled="isEditMode"
        />
      </div>

      <!-- Habilitado -->
      <div class="flex items-center gap-2">
        <Checkbox
          v-model="enabled"
          inputId="enabled"
          :binary="true"
          :disabled="isEditMode"
        />
        <label for="enabled" class="text-sm font-semibold text-[var(--ts-text-primary)]">
          {{ t('features.users.enabledCheckbox') }}
        </label>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          :label="t('features.users.close')"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="handleCancel"
        />
        <Button
          v-if="!isEditMode"
          :label="t('common.save')"
          icon="pi pi-check"
          @click="handleSave"
        />
      </div>
    </template>
  </Dialog>
</template>
