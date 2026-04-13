<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { Upload, FileText, ChevronRight, Trash2, Plus, Check, Loader2, ArrowLeft, ArrowRight } from 'lucide-vue-next'
import importService from '@/features/import/services/importService.js'
import personGroupService from '@/features/nomenclatives/services/personGroupService.js'
import competenceService from '@/features/competences/services/competenceService.js'
import roleService from '@/features/roles/services/roleService.js'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'

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

const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (file) await handleFileSelect({ files: [file] })
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
  <div class="space-y-6">
    <PageBreadcrumb page-title="Importar Personas" />

    <!-- Stepper -->
    <div class="flex items-center gap-1 overflow-x-auto pb-1">
      <template v-for="(title, idx) in stepTitles" :key="idx">
        <div class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all"
          :class="currentStep === idx + 1
            ? 'bg-brand-500 text-white font-semibold'
            : currentStep > idx + 1
              ? 'bg-brand-50 text-brand-600 font-medium'
              : 'bg-gray-100 text-gray-500 border border-gray-200'"
        >
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            :class="currentStep === idx + 1
              ? 'bg-white/20'
              : currentStep > idx + 1
                ? 'bg-brand-100 text-brand-600'
                : 'bg-gray-200 text-gray-500'"
          >
            <Check v-if="currentStep > idx + 1" class="w-3 h-3" />
            <span v-else>{{ idx + 1 }}</span>
          </span>
          {{ title }}
        </div>
        <div v-if="idx < stepTitles.length - 1" class="h-px w-4 bg-gray-200 shrink-0" />
      </template>
    </div>

    <!-- Step content card -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-base font-semibold text-gray-800">{{ stepTitles[currentStep - 1] }}</h3>
      </div>
      <div class="p-6">

        <!-- ======================== STEP 1: Seleccionar Archivo ======================== -->
        <div v-if="currentStep === 1" class="flex flex-col gap-6">

          <!-- File upload zone -->
          <div class="flex flex-col gap-3">
            <label class="text-sm font-medium text-gray-700">Archivo CSV</label>
            <label
              class="flex flex-col items-center justify-center gap-3 w-full rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-colors"
              :class="uploadedFile ? 'border-brand-400 bg-brand-50/20' : ''"
            >
              <input
                type="file"
                accept=".csv"
                class="hidden"
                @change="handleFileChange"
              />
              <div v-if="uploadingFile" class="flex flex-col items-center gap-2 text-brand-500">
                <Loader2 class="w-8 h-8 animate-spin" />
                <span class="text-sm font-medium">Procesando archivo...</span>
              </div>
              <div v-else-if="uploadedFile" class="flex flex-col items-center gap-2">
                <FileText class="w-8 h-8 text-brand-500" />
                <span class="text-sm font-semibold text-gray-800">{{ uploadedFile.name }}</span>
                <span class="text-xs text-gray-500">{{ Math.round(uploadedFile.size / 1024) }} KB — Haga clic para cambiar</span>
              </div>
              <div v-else class="flex flex-col items-center gap-2 text-gray-400">
                <Upload class="w-8 h-8" />
                <span class="text-sm font-medium text-gray-600">Haga clic para seleccionar un archivo CSV</span>
                <span class="text-xs text-gray-400">Máximo 10 MB</span>
              </div>
            </label>
          </div>

          <!-- Detected columns -->
          <div v-if="fileColumns.length" class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">Columnas detectadas en el archivo:</label>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="col in fileColumns"
                :key="col"
                class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
              >
                {{ col }}
              </span>
            </div>
          </div>

          <!-- Group select -->
          <div class="flex flex-col gap-2 max-w-sm">
            <label class="text-sm font-medium text-gray-700">Grupo destino <span class="text-gray-400 font-normal">(opcional)</span></label>
            <select
              v-model="selectedGroup"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white"
            >
              <option :value="null">Seleccione un grupo</option>
              <option v-for="g in groupOptions" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>
        </div>

        <!-- ======================== STEP 2: Mapeo de Persona ======================== -->
        <div v-else-if="currentStep === 2" class="flex flex-col gap-4">
          <p class="text-sm text-gray-500">
            Asocie cada columna del archivo con el campo correspondiente en la entidad Persona.
          </p>

          <div class="space-y-3">
            <div
              v-for="(mapping, idx) in personMappings"
              :key="idx"
              class="flex items-center gap-3"
            >
              <select
                v-model="mapping.csvColumn"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white"
              >
                <option :value="null">Columna CSV</option>
                <option v-for="col in fileColumns" :key="col" :value="col">{{ col }}</option>
              </select>

              <ChevronRight class="w-4 h-4 text-gray-300 flex-shrink-0" />

              <select
                v-model="mapping.personField"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white"
              >
                <option :value="null">Campo destino</option>
                <option v-for="opt in personFieldOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>

              <button
                type="button"
                class="p-1.5 rounded-lg hover:bg-error-50 text-gray-400 hover:text-error-600 transition-colors flex-shrink-0"
                @click="removePersonMapping(idx)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <button
              type="button"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-500 transition-colors"
              @click="addPersonMapping"
            >
              <Plus class="w-4 h-4" />
              Agregar mapeo
            </button>
          </div>
        </div>

        <!-- ======================== STEP 3: Mapeo de Competencias ======================== -->
        <div v-else-if="currentStep === 3" class="flex flex-col gap-4">
          <p class="text-sm text-gray-500">
            Asocie cada columna del CSV con una o más competencias que representa.
          </p>

          <div class="space-y-3">
            <div
              v-for="(mapping, idx) in competenceMappings"
              :key="idx"
              class="flex items-start gap-3"
            >
              <select
                v-model="mapping.csvColumn"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white"
              >
                <option :value="null">Columna CSV</option>
                <option v-for="col in fileColumns" :key="col" :value="col">{{ col }}</option>
              </select>

              <ChevronRight class="w-4 h-4 text-gray-300 flex-shrink-0 mt-2.5" />

              <div class="w-full flex flex-col gap-1">
                <select
                  v-model="mapping.competenceIds"
                  multiple
                  class="w-full h-28 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white"
                >
                  <option v-for="comp in competenceOptions" :key="comp.id" :value="comp.id">
                    {{ comp.competitionName }}
                  </option>
                </select>
                <span
                  v-if="mapping.competenceIds.length"
                  class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 self-start"
                >
                  {{ mapping.competenceIds.length }} seleccionada{{ mapping.competenceIds.length !== 1 ? 's' : '' }}
                </span>
              </div>

              <button
                type="button"
                class="p-1.5 rounded-lg hover:bg-error-50 text-gray-400 hover:text-error-600 transition-colors flex-shrink-0 mt-1"
                @click="removeCompetenceMapping(idx)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <button
              type="button"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-500 transition-colors"
              @click="addCompetenceMapping"
            >
              <Plus class="w-4 h-4" />
              Agregar mapeo
            </button>
          </div>
        </div>

        <!-- ======================== STEP 4: Configurar Competencias ======================== -->
        <div v-else-if="currentStep === 4" class="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <!-- Pesos de Competencias -->
          <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-base font-semibold text-gray-800">Pesos de Competencias</h3>
            </div>
            <div class="p-6">
              <div v-if="competenceWeights.length" class="flex flex-col gap-3">
                <div
                  v-for="(item, idx) in competenceWeights"
                  :key="idx"
                  class="flex items-center justify-between gap-4"
                >
                  <span class="text-sm text-gray-700 flex-1 truncate">{{ item.competenceName }}</span>
                  <input
                    v-model.number="item.weight"
                    type="number"
                    :min="0"
                    :max="1"
                    :step="0.05"
                    class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors w-24 text-right"
                  />
                </div>
                <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span class="text-sm text-gray-500">Total</span>
                  <span class="text-sm font-semibold text-gray-800">
                    {{ competenceWeights.reduce((s, c) => s + (c.weight || 0), 0).toFixed(2) }}
                  </span>
                </div>
              </div>
              <p v-else class="text-sm text-gray-400">No hay competencias mapeadas.</p>
            </div>
          </div>

          <!-- Valores Máximos Numéricos -->
          <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-base font-semibold text-gray-800">Valores Máximos Numéricos</h3>
            </div>
            <div class="p-6">
              <div v-if="numericMaxValues.length" class="flex flex-col gap-3">
                <div
                  v-for="(item, idx) in numericMaxValues"
                  :key="idx"
                  class="flex items-center justify-between gap-4"
                >
                  <span class="text-sm text-gray-700 flex-1 truncate">{{ item.csvColumn }}</span>
                  <input
                    v-model.number="item.maxValue"
                    type="number"
                    :min="1"
                    :max="10000"
                    class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors w-24 text-right"
                  />
                </div>
              </div>
              <p v-else class="text-sm text-gray-400">No se detectaron columnas numéricas.</p>
            </div>
          </div>
        </div>

        <!-- ======================== STEP 5: Mapeo de Roles ======================== -->
        <div v-else-if="currentStep === 5" class="flex flex-col gap-4">
          <p class="text-sm text-gray-500">
            Asocie columnas del CSV con el rol que representan.
          </p>

          <div class="space-y-3">
            <div
              v-for="(mapping, idx) in roleMappings"
              :key="idx"
              class="flex items-center gap-3"
            >
              <select
                v-model="mapping.csvColumn"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white"
              >
                <option :value="null">Columna CSV</option>
                <option v-for="col in fileColumns" :key="col" :value="col">{{ col }}</option>
              </select>

              <ChevronRight class="w-4 h-4 text-gray-300 flex-shrink-0" />

              <select
                v-model="mapping.roleId"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white"
              >
                <option :value="null">Seleccione rol</option>
                <option v-for="role in roleOptions" :key="role.id" :value="role.id">{{ role.roleName }}</option>
              </select>

              <button
                type="button"
                class="p-1.5 rounded-lg hover:bg-error-50 text-gray-400 hover:text-error-600 transition-colors flex-shrink-0"
                @click="removeRoleMapping(idx)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <button
              type="button"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-500 transition-colors"
              @click="addRoleMapping"
            >
              <Plus class="w-4 h-4" />
              Agregar mapeo
            </button>
          </div>
        </div>

        <!-- ======================== STEP 6: Verificar e Importar ======================== -->
        <div v-else-if="currentStep === 6" class="flex flex-col gap-4">

          <!-- Archivo y Grupo -->
          <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-base font-semibold text-gray-800">Archivo y Grupo</h3>
            </div>
            <div class="p-6">
              <div class="flex flex-wrap gap-6 text-sm">
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-gray-400 font-medium uppercase tracking-wide">Archivo</span>
                  <div class="flex items-center gap-2 text-gray-800 font-medium">
                    <FileText class="w-4 h-4 text-brand-500" />
                    {{ uploadedFile?.name }}
                  </div>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-gray-400 font-medium uppercase tracking-wide">Grupo</span>
                  <span class="text-gray-800 font-medium">
                    {{ groupOptions.find(g => g.id === selectedGroup)?.name || 'Sin grupo' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Mapeo de Persona -->
          <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-base font-semibold text-gray-800">Mapeo de Atributos de Persona</h3>
            </div>
            <div class="p-6">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-100">
                    <th class="text-left py-2 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Columna CSV</th>
                    <th class="text-left py-2 font-medium text-gray-500 text-xs uppercase tracking-wide">Campo de Persona</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(m, idx) in personMappings.filter(m => m.csvColumn && m.personField)"
                    :key="idx"
                    class="border-b border-gray-50 last:border-0"
                  >
                    <td class="py-2.5 pr-4 text-gray-700">
                      <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{{ m.csvColumn }}</span>
                    </td>
                    <td class="py-2.5 text-gray-700">
                      {{ personFieldOptions.find(f => f.value === m.personField)?.label || m.personField }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Mapeo de Competencias -->
          <div
            v-if="competenceMappings.some(m => m.csvColumn)"
            class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden"
          >
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-base font-semibold text-gray-800">Mapeo de Competencias</h3>
            </div>
            <div class="p-6">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-100">
                    <th class="text-left py-2 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Columna CSV</th>
                    <th class="text-left py-2 font-medium text-gray-500 text-xs uppercase tracking-wide">Competencias</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(m, idx) in competenceMappings.filter(m => m.csvColumn && m.competenceIds.length)"
                    :key="idx"
                    class="border-b border-gray-50 last:border-0"
                  >
                    <td class="py-2.5 pr-4 text-gray-700 align-top">
                      <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{{ m.csvColumn }}</span>
                    </td>
                    <td class="py-2.5">
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="cId in m.competenceIds"
                          :key="cId"
                          class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-600"
                        >
                          {{ competenceOptions.find(c => c.id === cId)?.competitionName || String(cId) }}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Mapeo de Roles -->
          <div
            v-if="roleMappings.some(m => m.csvColumn && m.roleId)"
            class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden"
          >
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-base font-semibold text-gray-800">Mapeo de Roles</h3>
            </div>
            <div class="p-6">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-100">
                    <th class="text-left py-2 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Columna CSV</th>
                    <th class="text-left py-2 font-medium text-gray-500 text-xs uppercase tracking-wide">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(m, idx) in roleMappings.filter(m => m.csvColumn && m.roleId)"
                    :key="idx"
                    class="border-b border-gray-50 last:border-0"
                  >
                    <td class="py-2.5 pr-4 text-gray-700">
                      <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{{ m.csvColumn }}</span>
                    </td>
                    <td class="py-2.5 text-gray-700">
                      {{ roleOptions.find(r => r.id === m.roleId)?.roleName || String(m.roleId) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Success result banner -->
          <div
            v-if="importResult"
            class="flex items-center gap-3 px-5 py-4 rounded-xl bg-success-50 border border-success-200 text-success-700"
          >
            <Check class="w-5 h-5 text-success-500 flex-shrink-0" />
            <div class="text-sm font-medium">
              Importación completada exitosamente.
              <span v-if="importResult.imported"> {{ importResult.imported }} registros importados.</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Navigation footer -->
    <div class="flex items-center justify-between pt-2">
      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        :disabled="currentStep === 1"
        @click="goPrev"
      >
        <ArrowLeft class="w-4 h-4" />
        Anterior
      </button>

      <span class="text-sm text-gray-400">Paso {{ currentStep }} de {{ totalSteps }}</span>

      <div class="flex items-center gap-2">
        <!-- Next -->
        <button
          v-if="currentStep < totalSteps"
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="!canNext"
          @click="goNext"
        >
          Siguiente
          <ArrowRight class="w-4 h-4" />
        </button>

        <!-- Import -->
        <button
          v-else-if="!importResult"
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="importing"
          @click="handleImport"
        >
          <Loader2 v-if="importing" class="w-4 h-4 animate-spin" />
          <Upload v-else class="w-4 h-4" />
          {{ importing ? 'Importando...' : 'Importar' }}
        </button>

        <!-- Nueva Importación -->
        <button
          v-else
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          @click="currentStep = 1; uploadedFile = null; importResult = null"
        >
          Nueva Importación
        </button>
      </div>
    </div>
  </div>
</template>
