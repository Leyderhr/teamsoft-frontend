<script setup>
import { ref, watch, computed } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useToast } from 'primevue/usetoast'
import clientService from '@/features/nomenclatives/services/clientService.js'
import countyService from '@/features/nomenclatives/services/countyService.js'
import projectStructureService from '@/features/nomenclatives/services/projectStructureService.js'

const props = defineProps({
  visible: Boolean,
  mode: String,
  initialData: Object
})

const emit = defineEmits(['update:visible', 'save', 'cancel'])
const toast = useToast()

const projectName = ref('')
const initialDate = ref(null)
const selectedClient = ref(null)
const selectedProvince = ref(null)
const selectedProjectStructure = ref(null)
const projectsList = ref([])
const selectedProjects = ref([])

const clientOptions = ref([])
const provinceOptions = ref([])
const projectStructureOptions = ref([])

const dialogTitle = computed(() => {
  return props.mode === 'create' ? 'Crear Proyectos' : 'Editar Proyecto'
})

const canAddProject = computed(() => {
  return projectName.value.trim() &&
      initialDate.value &&
      selectedClient.value &&
      selectedProvince.value &&
      selectedProjectStructure.value
})

const loadOptions = async () => {
  try {
    const [clients, provinces, structures] = await Promise.all([
      clientService.getAll(),
      countyService.getAll(),
      projectStructureService.getAll()
    ])

    clientOptions.value = clients.map(c => ({
      label: c.entityName,
      value: c.id
    }))

    provinceOptions.value = provinces.map(p => ({
      label: p.countyName,
      value: p.id
    }))

    projectStructureOptions.value = structures.map(ps => ({
      label: ps.name,
      value: ps.id
    }))
  } catch (error) {
    console.error('Error loading options:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las opciones',
      life: 3000
    })
  }
}

const getClientName = (id) => clientOptions.value.find(c => c.value === id)?.label || ''
const getProvinceName = (id) => provinceOptions.value.find(p => p.value === id)?.label || ''
const getStructureName = (id) => projectStructureOptions.value.find(s => s.value === id)?.label || ''

const addProject = () => {
  if (!canAddProject.value) return

  projectsList.value.push({
    projectName: projectName.value,
    initialDate: initialDate.value,
    client: selectedClient.value,
    clientName: getClientName(selectedClient.value),
    province: selectedProvince.value,
    provinceName: getProvinceName(selectedProvince.value),
    projectStructure: selectedProjectStructure.value,
    structureName: getStructureName(selectedProjectStructure.value)
  })

  // Limpiar formulario
  projectName.value = ''
  initialDate.value = null
  selectedClient.value = null
  selectedProvince.value = null
  selectedProjectStructure.value = null
}

const removeSelectedProjects = () => {
  projectsList.value = projectsList.value.filter(
      p => !selectedProjects.value.includes(p)
  )
  selectedProjects.value = []
}

const initializeForm = () => {
  if (props.mode === 'edit' && props.initialData) {
    projectName.value = props.initialData.projectName || ''
    initialDate.value = props.initialData.initialDate ? new Date(props.initialData.initialDate) : null
    selectedClient.value = props.initialData.client?.id || props.initialData.client || null
    selectedProvince.value = props.initialData.county?.id || props.initialData.province || null
    selectedProjectStructure.value = props.initialData.projectStructure?.id || props.initialData.projectStructure || null
    projectsList.value = []
  } else {
    projectName.value = ''
    initialDate.value = null
    selectedClient.value = null
    selectedProvince.value = null
    selectedProjectStructure.value = null
    projectsList.value = []
  }
  selectedProjects.value = []
}

const handleSave = () => {
  if (props.mode === 'edit') {
    // Modo editar: enviar un solo proyecto
    if (!canAddProject.value) {
      toast.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Complete todos los campos requeridos',
        life: 3000
      })
      return
    }

    const data = {
      projectName: projectName.value,
      initialDate: initialDate.value.toISOString(),
      client: selectedClient.value,
      province: selectedProvince.value,
      projectStructure: selectedProjectStructure.value
    }

    emit('save', data)
  } else {
    // Modo crear: enviar array de proyectos
    if (projectsList.value.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Debe agregar al menos un proyecto',
        life: 3000
      })
      return
    }

    const projects = projectsList.value.map(p => ({
      projectName: p.projectName,
      initialDate: p.initialDate.toISOString(),
      client: p.client,
      province: p.province,
      projectStructure: p.projectStructure
    }))

    emit('save', projects)
  }
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

watch(() => props.visible, async (newVal) => {
  if (newVal) {
    await loadOptions()
    initializeForm()
  }
})
</script>

<template>
  <Dialog
      :visible="visible"
      :modal="true"
      :closable="true"
      :style="{ width: '900px', maxHeight: '90vh' }"
      @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <h3 class="text-xl font-bold">{{ dialogTitle }}</h3>
    </template>

    <div class="form-container overflow-y-auto" style="max-height: calc(90vh - 200px)">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div class="field">
          <label for="projectName" class="block mb-2 text-sm font-semibold">
            Nombre del Proyecto <span class="text-red-500">*</span>
          </label>
          <InputText
              id="projectName"
              v-model="projectName"
              class="w-full"
              placeholder="Nombre"
          />
        </div>

        <div class="field">
          <label for="initialDate" class="block mb-2 text-sm font-semibold">
            Fecha Inicial <span class="text-red-500">*</span>
          </label>
          <Calendar
              id="initialDate"
              v-model="initialDate"
              class="w-full"
              dateFormat="dd/mm/yy"
              placeholder="dd/mm/yyyy"
              showIcon
          />
        </div>

        <div class="field">
          <label for="client" class="block mb-2 text-sm font-semibold">
            Cliente <span class="text-red-500">*</span>
          </label>
          <Dropdown
              id="client"
              v-model="selectedClient"
              :options="clientOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione"
              class="w-full"
              :filter="true"
          />
        </div>

        <div class="field">
          <label for="province" class="block mb-2 text-sm font-semibold">
            Provincia <span class="text-red-500">*</span>
          </label>
          <Dropdown
              id="province"
              v-model="selectedProvince"
              :options="provinceOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione"
              class="w-full"
              :filter="true"
          />
        </div>
      </div>

      <div class="field mb-4">
        <label for="projectStructure" class="block mb-2 text-sm font-semibold">
          Estructura del Proyecto <span class="text-red-500">*</span>
        </label>
        <Dropdown
            id="projectStructure"
            v-model="selectedProjectStructure"
            :options="projectStructureOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione una estructura"
            class="w-full"
            :filter="true"
        />
      </div>

      <div v-if="mode === 'create'" class="mb-4">
        <Button
            label="Agregar Proyecto"
            icon="pi pi-plus"
            @click="addProject"
            :disabled="!canAddProject"
            class="w-full md:w-auto"
        />
      </div>

      <div v-if="mode === 'create' && projectsList.length > 0" class="field">
        <DataTable
            v-model:selection="selectedProjects"
            :value="projectsList"
            dataKey="projectName"
            selectionMode="multiple"
            class="p-datatable-sm"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-semibold">Proyectos a Crear</span>
              <Button
                  label="Eliminar Seleccionados"
                  icon="pi pi-trash"
                  severity="danger"
                  size="small"
                  @click="removeSelectedProjects"
                  :disabled="selectedProjects.length === 0"
              />
            </div>
          </template>

          <Column selectionMode="multiple" style="width: 3rem" />
          <Column field="projectName" header="Nombre" />
          <Column field="clientName" header="Cliente" />
          <Column field="provinceName" header="Provincia" />
          <Column header="Fecha Inicial">
            <template #body="slotProps">
              {{ new Date(slotProps.data.initialDate).toLocaleDateString() }}
            </template>
          </Column>

          <template #empty>
            <div class="text-center py-4 text-gray-500">
              No hay proyectos agregados
            </div>
          </template>
        </DataTable>
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
  margin-bottom: 0.5rem;
}
</style>
