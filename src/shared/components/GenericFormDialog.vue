<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Checkbox from "primevue/checkbox";

const props = defineProps({
  visible: Boolean,
  mode: String,
  fields: Array,
  initialData: Object,
  title: String
})

const emit = defineEmits(['update:visible', 'save', 'cancel'])

const formData = ref({})
const selectOptions = ref({})
const errors = ref({})

const dialogTitle = computed(() => {
  return props.mode === 'create' ? `Crear ${props.title}` : `Editar ${props.title}`
})

const initializeForm = () => {
  const data = {}
  props.fields.forEach(field => {
    data[field.name] = props.initialData?.[field.name] ?? field.default ?? null
  })
  formData.value = data
  errors.value = {}
}

const loadSelectOptions = async () => {
  for (const field of props.fields) {
    if (field.type === 'select' && field.optionsService) {
      try {
        const data = await field.optionsService.getAll()
        selectOptions.value[field.name] = data.map(item => ({
          label: item[field.optionLabel],
          value: item[field.optionValue]
        }))
      } catch (error) {
        console.error(`Error loading options for ${field.name}:`, error)
      }
    }
  }
}

const validate = () => {
  const newErrors = {}
  props.fields.forEach(field => {
    if (field.required && !formData.value[field.name]) {
      newErrors[field.name] = `${field.label} es requerido`
    }
  })
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleSave = () => {
  if (validate()) {
    emit('save', { ...formData.value })
  }
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    initializeForm()
    loadSelectOptions()
  }
})

onMounted(() => {
  if (props.visible) {
    initializeForm()
    loadSelectOptions()
  }
})
</script>

<template>
  <Dialog
    :visible="visible"
    :modal="true"
    :closable="true"
    :style="{ width: '500px' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <h3 class="text-xl font-bold">{{ dialogTitle }}</h3>
    </template>

    <div class="form-container">
      <div v-for="field in fields" :key="field.name" class="field mb-4">
        <label :for="field.name" class="block mb-2 font-semibold text-gray-700">
          {{ field.label }}
          <span v-if="field.required" class="text-red-500">*</span>
        </label>

        <InputText
          v-if="field.type === 'text'"
          :id="field.name"
          v-model="formData[field.name]"
          :class="{ 'p-invalid': errors[field.name] }"
          class="w-full"
        />

        <InputNumber
          v-else-if="field.type === 'number'"
          :id="field.name"
          v-model="formData[field.name]"
          :class="{ 'p-invalid': errors[field.name] }"
          class="w-full"
          :min="field.min"
          :max="field.max"
        />

        <Dropdown
          v-else-if="field.type === 'select'"
          :id="field.name"
          v-model="formData[field.name]"
          :options="selectOptions[field.name] || []"
          optionLabel="label"
          optionValue="value"
          :placeholder="`Seleccione ${field.label}`"
          :class="{ 'p-invalid': errors[field.name] }"
          class="w-full"
        />

        <div v-else-if="field.type === 'boolean'" class="flex align-items-center gap-2">
          <Checkbox
              :id="field.name"
              v-model="formData[field.name]"
              :binary="true"
          />
        </div>


        <small v-if="errors[field.name]" class="p-error block mt-1">{{ errors[field.name] }}</small>
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" @click="handleCancel" class="p-button-text" />
      <Button label="Guardar" icon="pi pi-check" @click="handleSave" />
    </template>
  </Dialog>
</template>

<style scoped>
.form-container {
  padding: 1rem 0;
}

.field {
  margin-bottom: 1.5rem;
}
</style>
