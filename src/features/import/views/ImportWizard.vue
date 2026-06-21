<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import {
  Upload, FileText, ChevronRight, Trash2, Plus, Check, Loader2,
  ArrowLeft, ArrowRight, AlertCircle,
} from 'lucide-vue-next'
import personGroupService from '@/features/nomenclatives/services/personGroupService.js'
import competenceService from '@/features/competences/services/competenceService.js'
import roleService from '@/features/roles/services/roleService.js'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import { parseApiError } from '@/lib/apiError'
import { useImportWizard } from '@/features/import/composables/useImportWizard.js'

const { t } = useI18n()
const toast = useToast()

const {
  totalSteps, currentStep,
  uploadedFile, headers, groupName, uploadingFile,
  nombreColumn, experienceColumn,
  competenceMappings,
  puntoCorte, maxExpValue, updateIfExist, deleteOldValues,
  roleMappings,
  importing, importResult,
  parseFile, execute, reset,
  addCompetence, removeCompetence, addAttribute, removeAttribute,
  syncTextValues, addTextValue, removeTextValue,
  addRole, removeRole,
  canNext, goNext, goPrev,
} = useImportWizard()

// Catálogos para los selects
const groupOptions = ref([])
const competenceOptions = ref([])
const roleOptions = ref([])

const stepTitles = computed(() => [
  t('features.import.wizard.steps.selectFile'),
  t('features.import.wizard.steps.personAttributes'),
  t('features.import.wizard.steps.competenceAttributes'),
  t('features.import.wizard.steps.configureCompetences'),
  t('features.import.wizard.steps.roleAttributes'),
  t('features.import.wizard.steps.verifyImport'),
])

const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  try {
    await parseFile(file)
    toast.add({
      severity: 'success',
      summary: t('features.import.wizard.fileLoaded'),
      detail: t('features.import.wizard.columnsDetected', [headers.value.length]),
      life: 3000,
    })
  } catch (error) {
    const detail = await parseApiError(error, t('features.import.wizard.importError'))
    toast.add({ severity: 'error', summary: t('common.error'), detail, life: 5000 })
  }
}

const onNumericToggle = (attr) => {
  if (!attr.isNumeric) syncTextValues(attr)
}

const handleImport = async () => {
  try {
    const res = await execute()
    toast.add({
      severity: 'success',
      summary: t('features.import.wizard.importSuccess'),
      detail: t('features.import.wizard.importSummary', [res.created, res.updated, res.skipped, res.errors]),
      life: 6000,
    })
  } catch (error) {
    const detail = await parseApiError(error, t('features.import.wizard.importError'))
    toast.add({ severity: 'error', summary: t('common.error'), detail, life: 6000 })
  }
}

const loadOptions = async () => {
  const [groups, competences, roles] = await Promise.allSettled([
    personGroupService.getAll(),
    competenceService.getAll(),
    roleService.getAll(),
  ])
  if (groups.status === 'fulfilled') groupOptions.value = groups.value
  if (competences.status === 'fulfilled') competenceOptions.value = competences.value
  if (roles.status === 'fulfilled') roleOptions.value = roles.value
}

onMounted(loadOptions)
</script>

<template>
  <div class="space-y-6">
    <PageBreadcrumb :page-title="t('features.import.wizard.title')" />

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

    <!-- Step content -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-base font-semibold text-gray-800">{{ stepTitles[currentStep - 1] }}</h3>
      </div>
      <div class="p-6">

        <!-- ===== STEP 1: Archivo + Grupo ===== -->
        <div v-if="currentStep === 1" class="flex flex-col gap-6">
          <div class="flex flex-col gap-3">
            <label class="text-sm font-medium text-gray-700">{{ t('features.import.wizard.csvFile') }}</label>
            <label
              class="flex flex-col items-center justify-center gap-3 w-full rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-colors"
              :class="uploadedFile ? 'border-brand-400 bg-brand-50/20' : ''"
            >
              <input type="file" accept=".csv" class="hidden" @change="handleFileChange" />
              <div v-if="uploadingFile" class="flex flex-col items-center gap-2 text-brand-500">
                <Loader2 class="w-8 h-8 animate-spin" />
                <span class="text-sm font-medium">{{ t('features.import.wizard.processing') }}</span>
              </div>
              <div v-else-if="uploadedFile" class="flex flex-col items-center gap-2">
                <FileText class="w-8 h-8 text-brand-500" />
                <span class="text-sm font-semibold text-gray-800">{{ uploadedFile.name }}</span>
                <span class="text-xs text-gray-500">{{ Math.round(uploadedFile.size / 1024) }} KB — {{ t('features.import.wizard.clickToChange') }}</span>
              </div>
              <div v-else class="flex flex-col items-center gap-2 text-gray-400">
                <Upload class="w-8 h-8" />
                <span class="text-sm font-medium text-gray-600">{{ t('features.import.wizard.clickToSelect') }}</span>
                <span class="text-xs text-gray-400">{{ t('features.import.wizard.maxSize') }}</span>
              </div>
            </label>
          </div>

          <div v-if="headers.length" class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">{{ t('features.import.wizard.detectedColumns') }}</label>
            <div class="flex flex-wrap gap-2">
              <span v-for="col in headers" :key="col"
                class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{{ col }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-2 max-w-sm">
            <label class="text-sm font-medium text-gray-700">
              {{ t('features.import.wizard.targetGroup') }} <span class="text-error-500">*</span>
            </label>
            <input
              v-model="groupName"
              type="text"
              list="import-group-options"
              :placeholder="t('features.import.wizard.groupNamePlaceholder')"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white"
            />
            <datalist id="import-group-options">
              <option v-for="g in groupOptions" :key="g.id" :value="g.name" />
            </datalist>
            <span class="text-xs text-gray-400">{{ t('features.import.wizard.groupNameHint') }}</span>
          </div>
        </div>

        <!-- ===== STEP 2: Persona (nombre + experiencia) ===== -->
        <div v-else-if="currentStep === 2" class="flex flex-col gap-4">
          <p class="text-sm text-gray-500">{{ t('features.import.wizard.personMappingHint') }}</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">{{ t('features.import.wizard.personFields.personName') }} <span class="text-error-500">*</span></label>
              <select v-model="nombreColumn"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white">
                <option :value="null">{{ t('features.import.wizard.csvColumn') }}</option>
                <option v-for="col in headers" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">{{ t('features.import.wizard.personFields.experience') }} <span class="text-error-500">*</span></label>
              <select v-model="experienceColumn"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white">
                <option :value="null">{{ t('features.import.wizard.csvColumn') }}</option>
                <option v-for="col in headers" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <p class="text-xs text-gray-400">{{ t('features.import.wizard.generatedFieldsHint') }}</p>
        </div>

        <!-- ===== STEP 3: Competencias (competencia -> atributos) ===== -->
        <div v-else-if="currentStep === 3" class="flex flex-col gap-4">
          <p class="text-sm text-gray-500">{{ t('features.import.wizard.competenceMappingHint') }}</p>

          <div v-for="(comp, ci) in competenceMappings" :key="ci"
            class="rounded-xl border border-gray-200 p-4 space-y-4">
            <div class="flex items-center gap-3">
              <select v-model="comp.competenceName"
                class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white">
                <option :value="null">{{ t('features.import.wizard.selectCompetence') }}</option>
                <option v-for="c in competenceOptions" :key="c.id" :value="c.competitionName">{{ c.competitionName }}</option>
              </select>
              <button type="button" class="p-1.5 rounded-lg hover:bg-error-50 text-gray-400 hover:text-error-600 transition-colors"
                @click="removeCompetence(ci)">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>

            <!-- Atributos de la competencia -->
            <div class="space-y-3 pl-3 border-l-2 border-gray-100">
              <div v-for="(attr, ai) in comp.attributes" :key="ai" class="space-y-2">
                <div class="flex flex-wrap items-center gap-3">
                  <select v-model="attr.csvColumn"
                    class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white min-w-[160px]">
                    <option :value="null">{{ t('features.import.wizard.csvColumn') }}</option>
                    <option v-for="col in headers" :key="col" :value="col">{{ col }}</option>
                  </select>
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs text-gray-500">{{ t('features.import.wizard.weight') }}</span>
                    <input v-model.number="attr.weight" type="number" min="0" max="1" step="0.05"
                      class="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
                  </div>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" v-model="attr.isNumeric" @change="onNumericToggle(attr)"
                      class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                    <span class="text-sm text-gray-600">{{ t('features.import.wizard.numericColumn') }}</span>
                  </label>
                  <button type="button" class="p-1.5 rounded-lg hover:bg-error-50 text-gray-400 hover:text-error-600 transition-colors ml-auto"
                    @click="removeAttribute(ci, ai)">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>

                <!-- Editor de pesos por valor de texto -->
                <div v-if="!attr.isNumeric" class="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-2">
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.import.wizard.textValueWeights') }}</p>
                  <div v-for="(tv, ti) in attr.textValues" :key="ti" class="flex items-center gap-2">
                    <input v-model="tv.value" type="text" :placeholder="t('features.import.wizard.textValue')"
                      class="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
                    <input v-model.number="tv.weight" type="number" min="0" max="1" step="0.1"
                      class="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
                    <button type="button" class="p-1.5 rounded-lg hover:bg-error-50 text-gray-400 hover:text-error-600 transition-colors"
                      @click="removeTextValue(attr, ti)">
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button type="button" class="inline-flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600"
                    @click="addTextValue(attr)">
                    <Plus class="w-3.5 h-3.5" /> {{ t('features.import.wizard.addValue') }}
                  </button>
                </div>
              </div>

              <button type="button"
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-500 transition-colors"
                @click="addAttribute(ci)">
                <Plus class="w-4 h-4" /> {{ t('features.import.wizard.addAttribute') }}
              </button>
            </div>
          </div>

          <div>
            <button type="button"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-500 transition-colors"
              @click="addCompetence">
              <Plus class="w-4 h-4" /> {{ t('features.import.wizard.addCompetence') }}
            </button>
          </div>
        </div>

        <!-- ===== STEP 4: Configuración ===== -->
        <div v-else-if="currentStep === 4" class="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700">{{ t('features.import.wizard.cutoffPoint') }}</label>
            <input v-model.number="puntoCorte" type="number" min="0" max="1" step="0.05"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            <span class="text-xs text-gray-400">{{ t('features.import.wizard.cutoffHint') }}</span>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700">{{ t('features.import.wizard.maxExpValue') }}</label>
            <input v-model.number="maxExpValue" type="number" min="1" max="60" step="1"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            <span class="text-xs text-gray-400">{{ t('features.import.wizard.maxExpHint') }}</span>
          </div>
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" v-model="updateIfExist"
              class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
            <span class="text-sm text-gray-700">{{ t('features.import.wizard.updateIfExist') }}</span>
          </label>
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" v-model="deleteOldValues"
              class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
            <span class="text-sm text-gray-700">{{ t('features.import.wizard.deleteOldValues') }}</span>
          </label>
        </div>

        <!-- ===== STEP 5: Roles ===== -->
        <div v-else-if="currentStep === 5" class="flex flex-col gap-4">
          <p class="text-sm text-gray-500">{{ t('features.import.wizard.roleMappingHint') }}</p>
          <div class="space-y-3">
            <div v-for="(rm, idx) in roleMappings" :key="idx" class="flex items-center gap-3">
              <select v-model="rm.roleId"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white">
                <option :value="null">{{ t('features.import.wizard.selectRole') }}</option>
                <option v-for="role in roleOptions" :key="role.id" :value="role.id">{{ role.roleName }}</option>
              </select>
              <ChevronRight class="w-4 h-4 text-gray-300 flex-shrink-0" />
              <select v-model="rm.csvColumn"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white">
                <option :value="null">{{ t('features.import.wizard.csvColumn') }}</option>
                <option v-for="col in headers" :key="col" :value="col">{{ col }}</option>
              </select>
              <button type="button" class="p-1.5 rounded-lg hover:bg-error-50 text-gray-400 hover:text-error-600 transition-colors flex-shrink-0"
                @click="removeRole(idx)">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <button type="button"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-500 transition-colors"
              @click="addRole">
              <Plus class="w-4 h-4" /> {{ t('features.import.wizard.addMapping') }}
            </button>
          </div>
        </div>

        <!-- ===== STEP 6: Verificar e importar ===== -->
        <div v-else-if="currentStep === 6" class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-6 text-sm rounded-xl border border-gray-200 p-5">
            <div class="flex flex-col gap-1">
              <span class="text-xs text-gray-400 font-medium uppercase tracking-wide">{{ t('features.import.wizard.file') }}</span>
              <div class="flex items-center gap-2 text-gray-800 font-medium">
                <FileText class="w-4 h-4 text-brand-500" />{{ uploadedFile?.name }}
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs text-gray-400 font-medium uppercase tracking-wide">{{ t('features.import.wizard.group') }}</span>
              <span class="text-gray-800 font-medium">{{ groupName }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs text-gray-400 font-medium uppercase tracking-wide">{{ t('features.import.wizard.personField') }}</span>
              <span class="text-gray-800 font-medium">{{ nombreColumn }} / {{ experienceColumn }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs text-gray-400 font-medium uppercase tracking-wide">{{ t('features.import.wizard.competences') }} / {{ t('features.import.wizard.role') }}</span>
              <span class="text-gray-800 font-medium">{{ competenceMappings.length }} / {{ roleMappings.length }}</span>
            </div>
          </div>

          <!-- Resultado -->
          <div v-if="importResult"
            class="rounded-xl border p-5 space-y-3"
            :class="importResult.errors ? 'bg-warning-50 border-warning-200' : 'bg-success-50 border-success-200'">
            <div class="flex items-center gap-2 font-semibold"
              :class="importResult.errors ? 'text-warning-700' : 'text-success-700'">
              <Check class="w-5 h-5" /> {{ t('features.import.wizard.importDone') }}
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div><span class="text-gray-500">{{ t('features.import.wizard.created') }}:</span> <b>{{ importResult.created }}</b></div>
              <div><span class="text-gray-500">{{ t('features.import.wizard.updated') }}:</span> <b>{{ importResult.updated }}</b></div>
              <div><span class="text-gray-500">{{ t('features.import.wizard.skipped') }}:</span> <b>{{ importResult.skipped }}</b></div>
              <div><span class="text-gray-500">{{ t('features.import.wizard.errors') }}:</span> <b>{{ importResult.errors }}</b></div>
            </div>
            <ul v-if="importResult.errorMessages?.length" class="text-xs text-warning-700 space-y-1 max-h-40 overflow-auto">
              <li v-for="(msg, i) in importResult.errorMessages" :key="i" class="flex items-start gap-1.5">
                <AlertCircle class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{{ msg }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation footer -->
    <div class="flex items-center justify-between pt-2">
      <button type="button"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        :disabled="currentStep === 1" @click="goPrev">
        <ArrowLeft class="w-4 h-4" />{{ t('common.previous') }}
      </button>

      <span class="text-sm text-gray-400">{{ t('features.import.wizard.stepOf', [currentStep, totalSteps]) }}</span>

      <div class="flex items-center gap-2">
        <button v-if="currentStep < totalSteps" type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="!canNext" @click="goNext">
          {{ t('common.next') }}<ArrowRight class="w-4 h-4" />
        </button>
        <button v-else-if="!importResult" type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="importing" @click="handleImport">
          <Loader2 v-if="importing" class="w-4 h-4 animate-spin" />
          <Upload v-else class="w-4 h-4" />
          {{ importing ? t('features.import.wizard.importing') : t('features.import.wizard.import') }}
        </button>
        <button v-else type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          @click="reset">
          {{ t('features.import.wizard.newImport') }}
        </button>
      </div>
    </div>
  </div>
</template>
