<template>
  <div>
    <PageBreadcrumb
      :page-title="pageTitle"
      :items="[{ label: 'Proyectos', path: '/manage-projects/project' }]"
    />

    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-base font-semibold text-gray-800">{{ pageTitle }}</h2>
      </div>

      <!-- Form fields -->
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <!-- Nombre -->
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">
              Nombre del Proyecto <span class="text-error-500">*</span>
            </label>
            <input
              v-model="projectName"
              type="text"
              placeholder="Nombre"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>

          <!-- Fecha inicial -->
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">
              Fecha Inicial <span class="text-error-500">*</span>
            </label>
            <AppDatePicker v-model="initialDate" placeholder="dd/mm/aaaa" />
          </div>

          <!-- Cliente -->
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">
              Cliente <span class="text-error-500">*</span>
            </label>
            <AppSelect
              v-model="selectedClient"
              :options="clientOptions"
              placeholder="Seleccione..."
              searchable
            />
          </div>

          <!-- Provincia -->
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">
              Provincia <span class="text-error-500">*</span>
            </label>
            <AppSelect
              v-model="selectedProvince"
              :options="provinceOptions"
              placeholder="Seleccione..."
              searchable
            />
          </div>
        </div>

        <!-- Estructura del proyecto -->
        <div class="space-y-1 mb-6">
          <label class="block text-sm font-medium text-gray-700">
            Estructura del Proyecto <span class="text-error-500">*</span>
          </label>
          <AppSelect
            v-model="selectedProjectStructure"
            :options="projectStructureOptions"
            placeholder="Seleccione una estructura..."
          />
        </div>

        <!-- Add project button (create mode only) -->
        <div v-if="isCreateMode" class="mb-6">
          <button
            @click="addProject"
            :disabled="!canAddProject"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus class="w-4 h-4" />
            Agregar Proyecto
          </button>
        </div>

        <!-- Projects list (create mode) -->
        <div v-if="isCreateMode && projectsList.length > 0" class="mb-6">
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
              <span class="text-sm font-medium text-gray-700">
                Proyectos a crear ({{ projectsList.length }})
              </span>
              <button
                v-if="selectedProjects.length"
                @click="removeSelectedProjects"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error-50 text-error-600 text-xs font-medium hover:bg-error-100 transition-colors"
              >
                <Trash2 class="w-3.5 h-3.5" />
                Eliminar seleccionados
              </button>
            </div>
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50">
                <tr>
                  <th class="w-10 px-4 py-2"></th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Provincia</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="(p, i) in projectsList"
                  :key="i"
                  class="hover:bg-gray-50"
                >
                  <td class="w-10 px-4 py-2">
                    <input
                      type="checkbox"
                      :value="p"
                      v-model="selectedProjects"
                      class="w-4 h-4 rounded border-gray-300 text-brand-500"
                    />
                  </td>
                  <td class="px-4 py-2 text-sm text-gray-700">{{ p.projectName }}</td>
                  <td class="px-4 py-2 text-sm text-gray-700">{{ p.clientName }}</td>
                  <td class="px-4 py-2 text-sm text-gray-700">{{ p.provinceName }}</td>
                  <td class="px-4 py-2 text-sm text-gray-700">{{ formatDate(p.initialDate) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <button
          type="button"
          @click="router.push('/manage-projects/project')"
          class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="handleSave"
          :disabled="saving"
          class="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors flex items-center gap-2"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { Plus, Trash2, Save, Loader2 } from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import AppDatePicker from '@/components/ui/AppDatePicker.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import clientService from '@/features/nomenclatives/services/clientService.js'
import countyService from '@/features/nomenclatives/services/countyService.js'
import projectStructureService from '@/features/nomenclatives/services/projectStructureService.js'

const props = defineProps({
  mode: { type: String, default: 'create' },
})

const router = useRouter()
const route = useRoute()
const toast = useToast()

// Form fields
const projectName = ref('')
const initialDate = ref('')
const selectedClient = ref('')
const selectedProvince = ref('')
const selectedProjectStructure = ref('')

// Options
const clientOptions = ref([])
const provinceOptions = ref([])
const projectStructureOptions = ref([])

// Create mode: batch list
const projectsList = ref([])
const selectedProjects = ref([])

const saving = ref(false)

const isCreateMode = computed(() => props.mode === 'create')
const pageTitle = computed(() => isCreateMode.value ? 'Crear Proyectos' : 'Editar Proyecto')

const canAddProject = computed(() =>
  projectName.value.trim() &&
  initialDate.value &&
  selectedClient.value &&
  selectedProvince.value &&
  selectedProjectStructure.value
)

function getLabel(options, value) {
  return options.find(o => o.value === value)?.label ?? ''
}

function formatDate(d) {
  if (!d) return ''
  const dt = typeof d === 'string' ? new Date(d) : d
  return dt.toLocaleDateString()
}

function addProject() {
  if (!canAddProject.value) return
  projectsList.value.push({
    projectName: projectName.value,
    initialDate: initialDate.value,
    client: selectedClient.value,
    clientName: getLabel(clientOptions.value, selectedClient.value),
    province: selectedProvince.value,
    provinceName: getLabel(provinceOptions.value, selectedProvince.value),
    projectStructure: selectedProjectStructure.value,
    structureName: getLabel(projectStructureOptions.value, selectedProjectStructure.value),
  })
  projectName.value = ''
  initialDate.value = ''
  selectedClient.value = ''
  selectedProvince.value = ''
  selectedProjectStructure.value = ''
}

function removeSelectedProjects() {
  projectsList.value = projectsList.value.filter(p => !selectedProjects.value.includes(p))
  selectedProjects.value = []
}

onMounted(async () => {
  try {
    const [clients, provinces, structures] = await Promise.all([
      clientService.getAll(),
      countyService.getAll(),
      projectStructureService.getAll(),
    ])
    clientOptions.value = clients.map(c => ({ label: c.entityName, value: c.id }))
    provinceOptions.value = provinces.map(p => ({ label: p.countyName, value: p.id }))
    projectStructureOptions.value = structures.map(s => ({ label: s.name, value: s.id }))
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las opciones', life: 3000 })
  }

  if (!isCreateMode.value && route.params.id) {
    // Load project data for editing — import projectService dynamically to avoid circular
    try {
      const { default: projectService } = await import('@/features/projects/services/projectService.js')
      const res = await projectService.getById(route.params.id)
      const p = res?.data ?? res
      projectName.value = p.projectName ?? ''
      initialDate.value = p.initialDate ? new Date(p.initialDate).toISOString().split('T')[0] : ''
      selectedClient.value = p.client?.id ?? p.client ?? ''
      selectedProvince.value = p.county?.id ?? p.province ?? ''
      selectedProjectStructure.value = p.projectStructure?.id ?? p.projectStructure ?? ''
    } catch {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el proyecto', life: 3000 })
    }
  }
})

async function handleSave() {
  saving.value = true
  try {
    const { default: projectService } = await import('@/features/projects/services/projectService.js')

    if (!isCreateMode.value) {
      // Edit: single project
      if (!canAddProject.value) {
        toast.add({ severity: 'warn', summary: 'Validación', detail: 'Complete todos los campos requeridos', life: 3000 })
        saving.value = false
        return
      }
      await projectService.update(route.params.id, {
        projectName: projectName.value,
        initialDate: new Date(initialDate.value).toISOString(),
        client: selectedClient.value,
        province: selectedProvince.value,
        projectStructure: selectedProjectStructure.value,
      })
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Proyecto actualizado correctamente', life: 3000 })
    } else {
      // Create: batch list
      if (!projectsList.value.length) {
        toast.add({ severity: 'warn', summary: 'Validación', detail: 'Debe agregar al menos un proyecto', life: 3000 })
        saving.value = false
        return
      }
      const projects = projectsList.value.map(p => ({
        projectName: p.projectName,
        initialDate: new Date(p.initialDate).toISOString(),
        client: p.client,
        province: p.province,
        projectStructure: p.projectStructure,
      }))
      await projectService.create(projects)
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Proyectos creados correctamente', life: 3000 })
    }
    router.push('/manage-projects/project')
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: e?.response?.data?.message ?? 'Error al guardar',
      life: 3000,
    })
  } finally {
    saving.value = false
  }
}
</script>
