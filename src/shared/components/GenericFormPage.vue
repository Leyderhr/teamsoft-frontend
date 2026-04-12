<template>
  <div>
    <PageBreadcrumb :page-title="formTitle" :items="breadcrumbItems" />

    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-base font-semibold text-gray-800">{{ formTitle }}</h2>
        </div>

        <!-- Form -->
        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div
            v-for="field in props.fields"
            :key="field.key ?? field.name"
            class="space-y-1"
            :class="field.colSpan === 'full' ? 'sm:col-span-2 lg:col-span-3 xl:col-span-4' : field.colSpan === 2 ? 'sm:col-span-2' : ''"
          >
            <label class="block text-sm font-medium text-gray-700">
              {{ field.label }}
              <span v-if="field.required" class="text-error-500 ml-0.5">*</span>
            </label>

            <!-- Select -->
            <select
              v-if="field.type === 'select'"
              v-model="formData[fieldKey(field)]"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white"
            >
              <option value="" disabled>Seleccione...</option>
              <option
                v-for="opt in fieldOptions[fieldKey(field)]"
                :key="opt.value ?? opt.id"
                :value="opt.value ?? opt.id"
              >
                {{ opt.label ?? opt.name }}
              </option>
            </select>

            <!-- Boolean / Checkbox -->
            <label
              v-else-if="field.type === 'boolean'"
              class="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                v-model="formData[fieldKey(field)]"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20"
              />
              <span class="text-sm text-gray-600">{{ field.label }}</span>
            </label>

            <!-- Number -->
            <input
              v-else-if="field.type === 'number'"
              type="number"
              v-model="formData[fieldKey(field)]"
              :placeholder="field.placeholder || field.label"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />

            <!-- Textarea -->
            <textarea
              v-else-if="field.type === 'textarea'"
              v-model="formData[fieldKey(field)]"
              :placeholder="field.placeholder || field.label"
              rows="3"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors resize-none"
            ></textarea>

            <!-- Text (default) -->
            <input
              v-else
              type="text"
              v-model="formData[fieldKey(field)]"
              :placeholder="field.placeholder || field.label"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />

            <!-- Error message -->
            <p v-if="errors[fieldKey(field)]" class="text-xs text-error-600 flex items-center gap-1">
              <AlertCircle class="w-3 h-3 flex-shrink-0" />
              {{ errors[fieldKey(field)] }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            @click="router.back()"
            class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="handleSave"
            :disabled="saving"
            class="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { AlertCircle, Save, Loader2 } from 'lucide-vue-next'
import PageBreadcrumb from './PageBreadcrumb.vue'

const props = defineProps({
  mode: { type: String, default: 'create' },
  fields: { type: Array, required: true },
  service: { type: Object, required: true },
  title: { type: String, required: true },
  listRoute: { type: String, required: true },
})

const router = useRouter()
const route = useRoute()
const toast = useToast()

const formData = reactive({})
const errors = reactive({})
const saving = ref(false)
const fieldOptions = ref({})

const formTitle = computed(() =>
  props.mode === 'create' ? `Crear ${props.title}` : `Editar ${props.title}`
)

const breadcrumbItems = computed(() => [
  { label: props.title, path: props.listRoute }
])

// Support both field.key and field.name as the form data key
function fieldKey(f) {
  return f.key ?? f.name
}

onMounted(async () => {
  // Initialize formData with defaults
  props.fields.forEach(f => {
    formData[fieldKey(f)] = f.type === 'boolean' ? false : (f.defaultValue ?? f.default ?? '')
  })

  // Load existing data in edit mode
  if (props.mode === 'edit' && route.params.id) {
    try {
      const res = await props.service.getById(route.params.id)
      const data = res?.data ?? res
      Object.assign(formData, data)
    } catch {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el registro', life: 3000 })
    }
  }

  // Load select options — supports optionsService as a service object (with .getAll()) or a plain function
  for (const field of props.fields) {
    const fk = fieldKey(field)
    if (field.type === 'select') {
      if (field.optionsService) {
        try {
          let items
          if (typeof field.optionsService === 'function') {
            const res = await field.optionsService()
            items = res?.data ?? res
          } else {
            items = await field.optionsService.getAll()
          }
          // Map using optionLabel/optionValue if provided
          if (field.optionLabel && field.optionValue) {
            fieldOptions.value[fk] = items.map(i => ({ label: i[field.optionLabel], value: i[field.optionValue] }))
          } else {
            fieldOptions.value[fk] = items
          }
        } catch {}
      } else if (field.options) {
        fieldOptions.value[fk] = field.options
      }
    }
  }
})

async function handleSave() {
  // Clear errors
  Object.keys(errors).forEach(k => delete errors[k])

  // Basic required validation
  let valid = true
  props.fields.forEach(f => {
    const fk = fieldKey(f)
    if (f.required && (formData[fk] === '' || formData[fk] == null)) {
      errors[fk] = `${f.label} es requerido`
      valid = false
    }
  })
  if (!valid) return

  saving.value = true
  try {
    if (props.mode === 'create') {
      await props.service.create(formData)
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Registro creado correctamente', life: 3000 })
    } else {
      await props.service.update(route.params.id, formData)
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Registro actualizado correctamente', life: 3000 })
    }
    router.push(props.listRoute)
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: e?.response?.data?.message ?? e?.message ?? 'Error al guardar',
      life: 3000,
    })
  } finally {
    saving.value = false
  }
}
</script>
