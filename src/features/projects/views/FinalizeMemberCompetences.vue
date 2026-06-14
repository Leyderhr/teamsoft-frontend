<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import {
  Loader2, Save, ArrowLeft, Award, Cpu, ShieldAlert, Trash2, Plus,
} from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import personService from '@/features/persons/services/personService.js'
import { useLevels, useConflictIndex } from '@/services/nomenclatives/queries'
import { useCompetences } from '@/services/competences/queries'
import { parseApiError } from '@/lib/apiError'

const props = defineProps({
  projectId: { type: [String, Number], required: true },
  personId: { type: [String, Number], required: true },
})

const router = useRouter()
const toast = useToast()

const activeTab = ref('competences')

const loading = ref(false)
const saving  = ref(false)
const personName = ref('')

// Filas editables
const techCompetences = ref([]) // { competenceId, name, levelsId }
const genCompetences  = ref([]) // { competenceId, name, levelsId }
const conflicts       = ref([]) // { personConflictId, name, surName, card, conflictIndexId }

// Formularios de "agregar competencia"
const techNewCompetence = ref(null)
const techNewLevel      = ref(null)
const genNewCompetence  = ref(null)
const genNewLevel       = ref(null)

// ── Nomencladores ──
const { data: levelsData }       = useLevels()
const { data: competencesData }  = useCompetences()
const { data: conflictIndexData } = useConflictIndex()

const levelOptions = computed(() =>
  levelsData.value?.map(l => ({ label: l.significance, value: l.id })) ?? []
)
const conflictIndexOptions = computed(() =>
  conflictIndexData.value?.map(c => ({ label: c.description, value: c.id })) ?? []
)

const availableTechCompetences = computed(() =>
  (competencesData.value ?? [])
    .filter(c => c.technical && !techCompetences.value.some(t => t.competenceId === c.id))
    .map(c => ({ label: c.competitionName, value: c.id }))
)
const availableGenCompetences = computed(() =>
  (competencesData.value ?? [])
    .filter(c => !c.technical && !genCompetences.value.some(g => g.competenceId === c.id))
    .map(c => ({ label: c.competitionName, value: c.id }))
)

// ── Carga de la persona ──
async function loadPerson() {
  loading.value = true
  try {
    const person = await personService.getById(props.personId)
    personName.value = [person.personName, person.surName].filter(Boolean).join(' ')

    const competenceValues = person.competenceValues ?? []
    techCompetences.value = competenceValues
      .filter(cv => cv.competence?.technical)
      .map(cv => ({ competenceId: cv.competence.id, name: cv.competence.competitionName, levelsId: cv.level?.id ?? null }))
    genCompetences.value = competenceValues
      .filter(cv => cv.competence && !cv.competence.technical)
      .map(cv => ({ competenceId: cv.competence.id, name: cv.competence.competitionName, levelsId: cv.level?.id ?? null }))

    conflicts.value = (person.personConflicts ?? []).map(pc => ({
      personConflictId: pc.personConflict?.id,
      name: pc.personConflict?.personName ?? '',
      surName: pc.personConflict?.surName ?? '',
      card: pc.personConflict?.card ?? '',
      conflictIndexId: pc.conflictIndex?.id ?? null,
    }))
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la persona', life: 3000 })
  } finally {
    loading.value = false
  }
}

onMounted(loadPerson)

// ── Acciones de competencias ──
function addCompetence(kind) {
  const compId = kind === 'tech' ? techNewCompetence.value : genNewCompetence.value
  const levelId = kind === 'tech' ? techNewLevel.value : genNewLevel.value
  if (!compId || !levelId) return

  const source = (competencesData.value ?? []).find(c => c.id === compId)
  const row = { competenceId: compId, name: source?.competitionName ?? `Competencia ${compId}`, levelsId: levelId }

  if (kind === 'tech') {
    techCompetences.value.push(row)
    techNewCompetence.value = null
    techNewLevel.value = null
  } else {
    genCompetences.value.push(row)
    genNewCompetence.value = null
    genNewLevel.value = null
  }
}

function removeCompetence(kind, index) {
  if (kind === 'tech') techCompetences.value.splice(index, 1)
  else genCompetences.value.splice(index, 1)
}

// ── Guardar (PATCH) ──
async function handleSave() {
  const allCompetences = [...techCompetences.value, ...genCompetences.value]
  if (allCompetences.some(c => c.levelsId == null)) {
    toast.add({ severity: 'warn', summary: 'Falta nivel', detail: 'Todas las competencias deben tener un nivel asignado', life: 4000 })
    return
  }
  if (conflicts.value.some(c => c.conflictIndexId == null)) {
    toast.add({ severity: 'warn', summary: 'Falta nivel de conflicto', detail: 'Todas las incompatibilidades deben tener un nivel de conflicto', life: 4000 })
    return
  }

  const payload = {
    competenceValues: allCompetences.map(c => ({ competenceId: c.competenceId, levelsId: c.levelsId })),
    personConflicts: conflicts.value.map(c => ({ personConflictId: c.personConflictId, conflictIndexId: c.conflictIndexId })),
  }

  saving.value = true
  try {
    await personService.patchCompetencesConflicts(props.personId, payload)
    toast.add({ severity: 'success', summary: 'Guardado', detail: 'Competencias e incompatibilidades actualizadas', life: 4000 })
    router.push({ name: 'FinalizeTeamMembers', params: { projectId: props.projectId } })
  } catch (e) {
    const detail = await parseApiError(e, 'No se pudieron guardar los cambios')
    toast.add({ severity: 'error', summary: 'Error al guardar', detail, life: 6000 })
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push({ name: 'FinalizeTeamMembers', params: { projectId: props.projectId } })
}

const tabs = [
  { id: 'competences', label: 'Competencias', icon: Award },
  { id: 'compatibility', label: 'Nivel de compatibilidad', icon: ShieldAlert },
]
</script>

<template>
  <div class="space-y-6">
    <PageBreadcrumb
      :page-title="personName || 'Editar competencias'"
      :items="[
        { label: 'Finalizar Equipo', path: '/manage-projects/finalize-team' },
        { label: 'Evaluar Miembros', path: `/manage-projects/finalize-team/${projectId}/members` },
      ]"
    />

    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <!-- Header + tabs -->
      <div class="px-6 pt-4 border-b border-gray-200">
        <div class="flex items-center justify-between gap-4 flex-wrap mb-3">
          <h2 class="text-base font-semibold text-gray-800">{{ personName || 'Miembro' }}</h2>
          <button
            type="button"
            @click="goBack"
            class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft class="w-4 h-4" />
            Volver
          </button>
        </div>
        <nav class="flex gap-6 -mb-px">
          <button
            v-for="t in tabs"
            :key="t.id"
            type="button"
            @click="activeTab = t.id"
            class="inline-flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer"
            :class="activeTab === t.id
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
          >
            <component :is="t.icon" class="w-4 h-4" />
            {{ t.label }}
          </button>
        </nav>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="py-16 flex items-center justify-center gap-2 text-sm text-gray-400">
        <Loader2 class="w-5 h-5 animate-spin" />
        Cargando datos del miembro...
      </div>

      <template v-else>
        <!-- ════════ TAB COMPETENCIAS ════════ -->
        <div v-show="activeTab === 'competences'" class="p-6 space-y-6">

          <!-- Sección Técnicas -->
          <section class="space-y-3">
            <div class="flex items-center gap-2">
              <Cpu class="w-4 h-4 text-brand-500" />
              <h3 class="text-sm font-semibold text-gray-700">Competencias Técnicas</h3>
            </div>

            <!-- Agregar -->
            <div class="flex flex-col sm:flex-row sm:items-end gap-3 rounded-xl bg-gray-50 border border-gray-100 p-4">
              <div class="flex-1 min-w-[200px] space-y-1.5">
                <label class="text-xs font-medium text-gray-600">Competencia</label>
                <AppSelect v-model="techNewCompetence" :options="availableTechCompetences" placeholder="Seleccionar competencia..." :searchable="true" />
              </div>
              <div class="w-full sm:w-56 space-y-1.5">
                <label class="text-xs font-medium text-gray-600">Nivel</label>
                <AppSelect v-model="techNewLevel" :options="levelOptions" placeholder="Seleccionar nivel..." />
              </div>
              <button
                type="button"
                @click="addCompetence('tech')"
                :disabled="!techNewCompetence || !techNewLevel"
                class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus class="w-4 h-4" />
                Agregar
              </button>
            </div>

            <!-- Tabla -->
            <div class="overflow-hidden rounded-xl border border-gray-200">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                    <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-56">Nivel</th>
                    <th class="px-2 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="(c, idx) in techCompetences" :key="c.competenceId" class="hover:bg-gray-50/60">
                    <td class="px-4 py-2 text-gray-700">{{ c.name }}</td>
                    <td class="px-4 py-2">
                      <AppSelect v-model="c.levelsId" :options="levelOptions" size="sm" placeholder="Nivel..." />
                    </td>
                    <td class="px-2 py-2 text-right">
                      <button type="button" @click="removeCompetence('tech', idx)"
                        class="p-1 rounded text-gray-300 hover:text-error-500 hover:bg-error-50 transition-colors">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!techCompetences.length">
                    <td colspan="3" class="px-4 py-6 text-center text-sm text-gray-400">Sin competencias técnicas</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div class="h-px bg-gray-100" />

          <!-- Sección Genéricas -->
          <section class="space-y-3">
            <div class="flex items-center gap-2">
              <Award class="w-4 h-4 text-brand-500" />
              <h3 class="text-sm font-semibold text-gray-700">Competencias Genéricas</h3>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-end gap-3 rounded-xl bg-gray-50 border border-gray-100 p-4">
              <div class="flex-1 min-w-[200px] space-y-1.5">
                <label class="text-xs font-medium text-gray-600">Competencia</label>
                <AppSelect v-model="genNewCompetence" :options="availableGenCompetences" placeholder="Seleccionar competencia..." :searchable="true" />
              </div>
              <div class="w-full sm:w-56 space-y-1.5">
                <label class="text-xs font-medium text-gray-600">Nivel</label>
                <AppSelect v-model="genNewLevel" :options="levelOptions" placeholder="Seleccionar nivel..." />
              </div>
              <button
                type="button"
                @click="addCompetence('gen')"
                :disabled="!genNewCompetence || !genNewLevel"
                class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus class="w-4 h-4" />
                Agregar
              </button>
            </div>

            <div class="overflow-hidden rounded-xl border border-gray-200">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                    <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-56">Nivel</th>
                    <th class="px-2 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="(c, idx) in genCompetences" :key="c.competenceId" class="hover:bg-gray-50/60">
                    <td class="px-4 py-2 text-gray-700">{{ c.name }}</td>
                    <td class="px-4 py-2">
                      <AppSelect v-model="c.levelsId" :options="levelOptions" size="sm" placeholder="Nivel..." />
                    </td>
                    <td class="px-2 py-2 text-right">
                      <button type="button" @click="removeCompetence('gen', idx)"
                        class="p-1 rounded text-gray-300 hover:text-error-500 hover:bg-error-50 transition-colors">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!genCompetences.length">
                    <td colspan="3" class="px-4 py-6 text-center text-sm text-gray-400">Sin competencias genéricas</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <!-- ════════ TAB NIVEL DE COMPATIBILIDAD ════════ -->
        <div v-show="activeTab === 'compatibility'" class="p-6">
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                  <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Apellidos</th>
                  <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">DNI</th>
                  <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-64">Nivel de conflicto</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="c in conflicts" :key="c.personConflictId" class="hover:bg-gray-50/60">
                  <td class="px-4 py-2 text-gray-700">{{ c.name }}</td>
                  <td class="px-4 py-2 text-gray-600">{{ c.surName }}</td>
                  <td class="px-4 py-2 text-gray-500">{{ c.card }}</td>
                  <td class="px-4 py-2">
                    <AppSelect v-model="c.conflictIndexId" :options="conflictIndexOptions" size="sm" placeholder="Nivel de conflicto..." />
                  </td>
                </tr>
                <tr v-if="!conflicts.length">
                  <td colspan="4" class="px-4 py-8 text-center text-sm text-gray-400">
                    Esta persona no tiene incompatibilidades registradas
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="goBack"
            class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="saving"
            @click="handleSave"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            Salvar
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
