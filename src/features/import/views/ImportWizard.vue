<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import FileUpload from 'primevue/fileupload'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Panel from 'primevue/panel'
import Tag from 'primevue/tag'
import InputNumber from 'primevue/inputnumber'
import Divider from 'primevue/divider'
import ProgressSpinner from 'primevue/progressspinner'
import importService from '@/features/import/services/importService.js'
import personGroupService from '@/features/nomenclatives/services/personGroupService.js'
import competenceService from '@/features/competences/services/competenceService.js'
import roleService from '@/features/roles/services/roleService.js'

const toast = useToast()
const router = useRouter()

// =====================
// Wizard state
// =====================
const currentStep = ref(1)
const totalSteps = 6
const importing = ref(false)

// =====================
// STEP 1 — Selección de Archivo
// =====================
const uploadedFile = ref(null)
const fileColumns = ref([])   // Column headers from CSV
const filePreview = ref([])   // First N rows for preview
const selectedGroup = ref(null)
const groupOptions = ref([])
const uploadingFile = ref(false)

// Field options for person mapping
const personFieldOptions = [
    { label: 'Nombre', value: 'personName' },
    { label: 'Apellidos', value: 'surName' },
    { label: 'Carné/CI', value: 'card' },
    { label: 'Dirección', value: 'address' },
    { label: 'Teléfono', value: 'phone' },
    { label: 'Correo electrónico', value: 'email' },
    { label: 'Sexo', value: 'sex' },
    { label: 'Fecha de ingreso', value: 'inDate' },
    { label: 'Fecha de nacimiento', value: 'birthDate' },
    { label: 'Carga laboral', value: 'workload' },
    { label: 'Años de experiencia', value: 'experience' },
    { label: 'Estado', value: 'status' },
    { label: 'Tipo MBTI', value: 'tipoMB' }
]

// =====================
// STEP 2 — Mapeo de Persona
// =====================
const personMappings = ref([])  // [{ csvColumn, personField }]

const addPersonMapping = () => {
    personMappings.value.push({ csvColumn: null, personField: null })
}
const removePersonMapping = (index) => {
    personMappings.value.splice(index, 1)
}

// =====================
// STEP 3 — Mapeo de Competencias
// =====================
const competenceOptions = ref([])
const competenceMappings = ref([])  // [{ csvColumn, competenceIds: [] }]

const addCompetenceMapping = () => {
    competenceMappings.value.push({ csvColumn: null, competenceIds: [] })
}
const removeCompetenceMapping = (index) => {
    competenceMappings.value.splice(index, 1)
}

// =====================
// STEP 4 — Configuración de Competencias
// =====================
const competenceWeights = ref([])  // [{ competenceId, competenceName, weight }]
const numericMaxValues = ref([])   // [{ csvColumn, maxValue }]

const initCompetenceWeights = () => {
    const allCompetenceIds = new Set()
    competenceMappings.value.forEach(m => m.competenceIds.forEach(id => allCompetenceIds.add(id)))
    competenceWeights.value = Array.from(allCompetenceIds).map(id => {
        const comp = competenceOptions.value.find(c => c.id === id)
        return { competenceId: id, competenceName: comp?.competitionName || `Competencia ${id}`, weight: 1.0 }
    })
    // Numeric columns
    numericMaxValues.value = fileColumns.value
        .filter(col => {
            const vals = filePreview.value.map(r => r[col])
            return vals.some(v => !isNaN(parseFloat(v)))
        })
        .map(col => ({ csvColumn: col, maxValue: 100 }))
}

// =====================
// STEP 5 — Mapeo de Roles
// =====================
const roleOptions = ref([])
const roleMappings = ref([])  // [{ csvColumn, roleId }]

const addRoleMapping = () => {
    roleMappings.value.push({ csvColumn: null, roleId: null })
}
const removeRoleMapping = (index) => {
    roleMappings.value.splice(index, 1)
}

// =====================
// STEP 6 — Verificación e Importación
// =====================
const importResult = ref(null)

// =====================
// Navigation
// =====================
const stepTitles = [
    'Seleccionar Archivo',
    'Atributos de Persona',
    'Atributos de Competencia',
    'Configurar Competencias',
    'Atributos de Rol',
    'Verificar e Importar'
]

const canNext = computed(() => {
    if (currentStep.value === 1) return uploadedFile.value !== null
    if (currentStep.value === 2) return personMappings.value.some(m => m.csvColumn && m.personField)
    return true
})

const goNext = () => {
    if (currentStep.value === 3) initCompetenceWeights()
    if (currentStep.value < totalSteps) currentStep.value++
}
const goPrev = () => {
    if (currentStep.value > 1) currentStep.value--
}

// =====================
// Handlers
// =====================
const handleFileSelect = async (event) => {
    const file = event.files[0]
    if (!file) return
    uploadingFile.value = true
    try {
        const result = await importService.uploadFile(file)
        uploadedFile.value = file
        fileColumns.value = result.columns || []
        filePreview.value = result.preview || []
        // Auto-init 3 person mapping rows
        personMappings.value = fileColumns.value.slice(0, Math.min(3, fileColumns.value.length)).map(col => ({
            csvColumn: col, personField: null
        }))
        toast.add({ severity: 'success', summary: 'Archivo cargado', detail: `${fileColumns.value.length} columnas detectadas`, life: 3000 })
    } catch (error) {
        console.error('Error uploading file:', error)
        // Demo mode: simulate columns from file name
        uploadedFile.value = file
        fileColumns.value = ['nombre', 'apellidos', 'carnet', 'email', 'telefono', 'sexo', 'experiencia']
        filePreview.value = []
        personMappings.value = fileColumns.value.map(col => ({ csvColumn: col, personField: null }))
        toast.add({ severity: 'info', summary: 'Modo demo', detail: 'Columnas simuladas (API no disponible)', life: 3000 })
    } finally {
        uploadingFile.value = false
    }
}

const handleImport = async () => {
    importing.value = true
    try {
        const payload = {
            groupId: selectedGroup.value,
            personMappings: personMappings.value.filter(m => m.csvColumn && m.personField),
            competenceMappings: competenceMappings.value.filter(m => m.csvColumn && m.competenceIds.length),
            competenceWeights: competenceWeights.value,
            numericMaxValues: numericMaxValues.value,
            roleMappings: roleMappings.value.filter(m => m.csvColumn && m.roleId)
        }
        importResult.value = await importService.executeImport(payload)
        toast.add({ severity: 'success', summary: 'Importación exitosa', detail: `Se importaron los datos correctamente`, life: 5000 })
    } catch (error) {
        console.error('Error importando:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo completar la importación', life: 4000 })
    } finally {
        importing.value = false
    }
}

const loadOptions = async () => {
    const [groups, competences, roles] = await Promise.allSettled([
        personGroupService.getAll(),
        competenceService.getAll(),
        roleService.getAll()
    ])
    if (groups.status === 'fulfilled') groupOptions.value = groups.value
    if (competences.status === 'fulfilled') competenceOptions.value = competences.value
    if (roles.status === 'fulfilled') roleOptions.value = roles.value
}

onMounted(loadOptions)
</script>

<template>
  <div class="p-4 pl-15">
    <h1 class="titulo text-black font-bold">Importar Personas</h1>

    <!-- Stepper visual -->
    <div class="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
      <template v-for="(title, idx) in stepTitles" :key="idx">
        <div
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all"
          :class="currentStep === idx + 1
            ? 'bg-[var(--ts-primary)] text-white font-semibold shadow'
            : currentStep > idx + 1
              ? 'bg-[var(--ts-primary-light,#e8f0fe)] text-[var(--ts-primary)] font-medium'
              : 'bg-[var(--ts-bg-surface)] text-[var(--ts-text-muted)] border border-[var(--ts-border)]'"
        >
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            :class="currentStep > idx + 1 ? 'bg-[var(--ts-primary)] text-white' : ''">
            <span v-if="currentStep > idx + 1">✓</span>
            <span v-else>{{ idx + 1 }}</span>
          </span>
          {{ title }}
        </div>
        <div v-if="idx < stepTitles.length - 1" class="h-px w-4 bg-[var(--ts-border)] shrink-0" />
      </template>
    </div>

    <!-- ======================== STEP 1: Seleccionar Archivo ======================== -->
    <div v-if="currentStep === 1">
      <Panel header="Seleccionar archivo CSV y grupo">
        <div class="flex flex-col gap-5">
          <div>
            <FileUpload
              mode="basic"
              accept=".csv"
              :maxFileSize="10000000"
              :auto="false"
              chooseLabel="Seleccionar CSV"
              class="mb-3"
              @select="handleFileSelect"
            />
            <p v-if="uploadedFile" class="text-sm text-[var(--ts-text-muted)] mt-2">
              <i class="pi pi-file text-green-500 mr-1"></i>
              {{ uploadedFile.name }} — {{ Math.round(uploadedFile.size / 1024) }} KB
            </p>
            <ProgressSpinner v-if="uploadingFile" style="width:30px;height:30px" class="mt-2" />
          </div>

          <div v-if="fileColumns.length" class="flex flex-col gap-2">
            <label class="text-sm font-semibold">Columnas detectadas en el archivo:</label>
            <div class="flex flex-wrap gap-2">
              <Tag v-for="col in fileColumns" :key="col" :value="col" severity="secondary" />
            </div>
          </div>

          <div class="flex flex-col gap-2 max-w-sm">
            <label class="text-sm font-semibold">Grupo destino (opcional)</label>
            <Select
              v-model="selectedGroup"
              :options="groupOptions"
              optionLabel="name"
              optionValue="id"
              placeholder="Seleccione un grupo"
              filter
              class="w-full"
            />
          </div>
        </div>
      </Panel>
    </div>

    <!-- ======================== STEP 2: Mapeo de Persona ======================== -->
    <div v-else-if="currentStep === 2">
      <Panel header="Mapear columnas del CSV a campos de Persona">
        <div class="flex flex-col gap-3">
          <p class="text-sm text-[var(--ts-text-muted)]">
            Asocie cada columna del archivo con el campo correspondiente en la entidad Persona.
          </p>
          <DataTable :value="personMappings" class="p-datatable-sm" editMode="cell">
            <Column header="Columna del CSV" :style="{ width: '45%' }">
              <template #body="{ data }">
                <Select v-model="data.csvColumn" :options="fileColumns" placeholder="Columna CSV" class="w-full" />
              </template>
            </Column>
            <Column header="Campo de Persona" :style="{ width: '45%' }">
              <template #body="{ data }">
                <Select
                  v-model="data.personField"
                  :options="personFieldOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Campo destino"
                  class="w-full"
                />
              </template>
            </Column>
            <Column header="" :style="{ width: '10%' }">
              <template #body="{ index }">
                <Button icon="pi pi-trash" text severity="danger" size="small" @click="removePersonMapping(index)" />
              </template>
            </Column>
          </DataTable>
          <Button label="Agregar mapeo" icon="pi pi-plus" size="small" outlined @click="addPersonMapping" />
        </div>
      </Panel>
    </div>

    <!-- ======================== STEP 3: Mapeo de Competencias ======================== -->
    <div v-else-if="currentStep === 3">
      <Panel header="Mapear columnas a Competencias">
        <div class="flex flex-col gap-3">
          <p class="text-sm text-[var(--ts-text-muted)]">
            Asocie cada columna del CSV con una o más competencias que representa.
          </p>
          <DataTable :value="competenceMappings" class="p-datatable-sm">
            <Column header="Columna del CSV" :style="{ width: '40%' }">
              <template #body="{ data }">
                <Select v-model="data.csvColumn" :options="fileColumns" placeholder="Columna CSV" class="w-full" />
              </template>
            </Column>
            <Column header="Competencias" :style="{ width: '50%' }">
              <template #body="{ data }">
                <MultiSelect
                  v-model="data.competenceIds"
                  :options="competenceOptions"
                  optionLabel="competitionName"
                  optionValue="id"
                  placeholder="Seleccione competencias"
                  filter
                  class="w-full"
                />
              </template>
            </Column>
            <Column header="" :style="{ width: '10%' }">
              <template #body="{ index }">
                <Button icon="pi pi-trash" text severity="danger" size="small" @click="removeCompetenceMapping(index)" />
              </template>
            </Column>
          </DataTable>
          <Button label="Agregar mapeo" icon="pi pi-plus" size="small" outlined @click="addCompetenceMapping" />
        </div>
      </Panel>
    </div>

    <!-- ======================== STEP 4: Configurar Competencias ======================== -->
    <div v-else-if="currentStep === 4">
      <div class="grid grid-cols-2 gap-4">
        <Panel header="Pesos de Competencias">
          <DataTable :value="competenceWeights" class="p-datatable-sm" editMode="cell">
            <Column field="competenceName" header="Competencia" />
            <Column header="Peso (0–1)">
              <template #body="{ data }">
                <InputNumber v-model="data.weight" :min="0" :max="1" :step="0.05"
                  :minFractionDigits="2" :maxFractionDigits="2" mode="decimal"
                  class="w-28" />
              </template>
            </Column>
          </DataTable>
          <div v-if="competenceWeights.length" class="mt-2 text-sm text-right font-semibold">
            Total: {{ competenceWeights.reduce((s, c) => s + (c.weight || 0), 0).toFixed(2) }}
          </div>
        </Panel>

        <Panel header="Valores Máximos para Atributos Numéricos">
          <DataTable :value="numericMaxValues" class="p-datatable-sm" editMode="cell">
            <Column field="csvColumn" header="Columna" />
            <Column header="Valor Máximo">
              <template #body="{ data }">
                <InputNumber v-model="data.maxValue" :min="1" :max="10000" class="w-28" />
              </template>
            </Column>
          </DataTable>
          <p v-if="!numericMaxValues.length" class="text-sm text-[var(--ts-text-muted)] mt-2">
            No se detectaron columnas numéricas.
          </p>
        </Panel>
      </div>
    </div>

    <!-- ======================== STEP 5: Mapeo de Roles ======================== -->
    <div v-else-if="currentStep === 5">
      <Panel header="Mapear columnas a Roles">
        <div class="flex flex-col gap-3">
          <p class="text-sm text-[var(--ts-text-muted)]">
            Asocie columnas del CSV con el rol que representan.
          </p>
          <DataTable :value="roleMappings" class="p-datatable-sm">
            <Column header="Columna del CSV" :style="{ width: '45%' }">
              <template #body="{ data }">
                <Select v-model="data.csvColumn" :options="fileColumns" placeholder="Columna CSV" class="w-full" />
              </template>
            </Column>
            <Column header="Rol" :style="{ width: '45%' }">
              <template #body="{ data }">
                <Select
                  v-model="data.roleId"
                  :options="roleOptions"
                  optionLabel="roleName"
                  optionValue="id"
                  placeholder="Seleccione rol"
                  filter
                  class="w-full"
                />
              </template>
            </Column>
            <Column header="" :style="{ width: '10%' }">
              <template #body="{ index }">
                <Button icon="pi pi-trash" text severity="danger" size="small" @click="removeRoleMapping(index)" />
              </template>
            </Column>
          </DataTable>
          <Button label="Agregar mapeo" icon="pi pi-plus" size="small" outlined @click="addRoleMapping" />
        </div>
      </Panel>
    </div>

    <!-- ======================== STEP 6: Verificar e Importar ======================== -->
    <div v-else-if="currentStep === 6">
      <div class="flex flex-col gap-4">
        <!-- Resumen archivo -->
        <Panel header="Archivo y Grupo">
          <div class="flex gap-6 text-sm">
            <div><span class="font-semibold">Archivo:</span> {{ uploadedFile?.name }}</div>
            <div>
              <span class="font-semibold">Grupo:</span>
              {{ groupOptions.find(g => g.id === selectedGroup)?.name || 'Sin grupo' }}
            </div>
          </div>
        </Panel>

        <!-- Resumen mapeo persona -->
        <Panel header="Mapeo de Atributos de Persona">
          <DataTable :value="personMappings.filter(m => m.csvColumn && m.personField)" class="p-datatable-sm">
            <Column field="csvColumn" header="Columna CSV" />
            <Column header="Campo de Persona">
              <template #body="{ data }">
                {{ personFieldOptions.find(f => f.value === data.personField)?.label || data.personField }}
              </template>
            </Column>
          </DataTable>
        </Panel>

        <!-- Resumen mapeo competencias -->
        <Panel v-if="competenceMappings.some(m => m.csvColumn)" header="Mapeo de Competencias">
          <DataTable :value="competenceMappings.filter(m => m.csvColumn && m.competenceIds.length)" class="p-datatable-sm">
            <Column field="csvColumn" header="Columna CSV" />
            <Column header="Competencias">
              <template #body="{ data }">
                <div class="flex flex-wrap gap-1">
                  <Tag
                    v-for="cId in data.competenceIds" :key="cId"
                    :value="competenceOptions.find(c => c.id === cId)?.competitionName || String(cId)"
                    severity="info"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </Panel>

        <!-- Resumen mapeo roles -->
        <Panel v-if="roleMappings.some(m => m.csvColumn && m.roleId)" header="Mapeo de Roles">
          <DataTable :value="roleMappings.filter(m => m.csvColumn && m.roleId)" class="p-datatable-sm">
            <Column field="csvColumn" header="Columna CSV" />
            <Column header="Rol">
              <template #body="{ data }">
                {{ roleOptions.find(r => r.id === data.roleId)?.roleName || String(data.roleId) }}
              </template>
            </Column>
          </DataTable>
        </Panel>

        <!-- Resultado -->
        <div v-if="importResult" class="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
          <i class="pi pi-check-circle mr-2 text-green-600"></i>
          Importación completada exitosamente.
          <span v-if="importResult.imported"> {{ importResult.imported }} registros importados.</span>
        </div>
      </div>
    </div>

    <!-- ======================== Footer de Navegación ======================== -->
    <Divider />
    <div class="flex justify-between items-center mt-4">
      <Button
        label="Anterior"
        icon="pi pi-chevron-left"
        severity="secondary"
        outlined
        :disabled="currentStep === 1"
        @click="goPrev"
      />
      <span class="text-sm text-[var(--ts-text-muted)]">Paso {{ currentStep }} de {{ totalSteps }}</span>
      <div class="flex gap-2">
        <Button
          v-if="currentStep < totalSteps"
          label="Siguiente"
          icon="pi pi-chevron-right"
          iconPos="right"
          :disabled="!canNext"
          @click="goNext"
        />
        <Button
          v-else-if="!importResult"
          label="Importar"
          icon="pi pi-upload"
          :loading="importing"
          @click="handleImport"
        />
        <Button
          v-else
          label="Nueva Importación"
          icon="pi pi-refresh"
          severity="secondary"
          @click="currentStep = 1; uploadedFile = null; importResult = null"
        />
      </div>
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
