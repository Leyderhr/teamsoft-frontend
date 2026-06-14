<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import {
  Loader2, Lock, ArrowLeft, Award, Cpu, ShieldAlert, Trash2, Plus, Crown,
} from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import personService from '@/features/persons/services/personService.js'
import projectService from '@/features/projects/services/projectService.js'
import { useLevels, useConflictIndex, useRoleEvaluation } from '@/services/nomenclatives/queries'
import { useCompetences } from '@/services/competences/queries'
import { parseApiError } from '@/lib/apiError'

const props = defineProps({
  projectId: { type: [String, Number], required: true },
})

const router = useRouter()
const toast = useToast()

const activeTab = ref('competences')
const loading = ref(false)
const closing = ref(false)

// Jefe del equipo
const boss = ref(null) // { personId, personName, surName, roleId, roleName }
const bossName = computed(() => boss.value ? `${boss.value.personName} ${boss.value.surName}`.trim() : '')

// Evaluaciones
const bossEvaluationId    = ref(null)
const projectEvaluationId = ref(null)

// Competencias / incompatibilidades del jefe
const techCompetences = ref([]) // { competenceId, name, levelsId }
const genCompetences  = ref([])
const conflicts       = ref([]) // { personConflictId, name, surName, card, conflictIndexId }
const personsList     = ref([]) // miembros no jefe del equipo

const techNewCompetence = ref(null)
const techNewLevel      = ref(null)
const genNewCompetence  = ref(null)
const genNewLevel       = ref(null)
const newConflictPerson = ref(null)
const newConflictIndex  = ref(null)

// ── Nomencladores ──
const { data: levelsData }        = useLevels()
const { data: competencesData }   = useCompetences()
const { data: conflictIndexData } = useConflictIndex()
const { data: roleEvalData }      = useRoleEvaluation()

const levelOptions = computed(() =>
  levelsData.value?.map(l => ({ label: l.significance, value: l.id })) ?? []
)
const conflictIndexOptions = computed(() =>
  conflictIndexData.value?.map(c => ({ label: c.description, value: c.id })) ?? []
)
const roleEvaluationOptions = computed(() =>
  roleEvalData.value?.map(r => ({ label: r.significance, value: r.id })) ?? []
)
const conflictPersonOptions = computed(() =>
  personsList.value
    .filter(p => p.id !== boss.value?.personId && !conflicts.value.some(c => c.personConflictId === p.id))
    .map(p => ({ label: `${p.personName} ${p.surName}`, value: p.id }))
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

// ── Carga ──
async function loadBossAndData() {
  loading.value = true
  try {
    const bossRole = await projectService.getBossAssignedRole(props.projectId)
    const bossPerson = bossRole?.persons?.[0]
    if (!bossPerson) {
      toast.add({ severity: 'warn', summary: 'Sin jefe', detail: 'El equipo no tiene un jefe asignado', life: 4000 })
      return
    }
    boss.value = {
      personId: bossPerson.id,
      personName: bossPerson.personName,
      surName: bossPerson.surName,
      roleId: bossRole.role?.id,
      roleName: bossRole.role?.roleName,
    }

    const person = await personService.getById(bossPerson.id)
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
  } catch (e) {
    const detail = await parseApiError(e, 'No se pudo cargar el jefe del equipo')
    toast.add({ severity: 'error', summary: 'Error', detail, life: 5000 })
  } finally {
    loading.value = false
  }
}

async function loadTeamMembers() {
  try {
    const data = await projectService.getNonBossAssignedRoles(props.projectId)
    const byId = new Map()
    for (const assignedRole of data ?? []) {
      for (const person of assignedRole.persons ?? []) {
        if (!byId.has(person.id)) byId.set(person.id, person)
      }
    }
    personsList.value = [...byId.values()]
  } catch {
    // sin miembros -> no se podrán agregar incompatibilidades
  }
}

onMounted(() => {
  loadBossAndData()
  loadTeamMembers()
})

// ── Competencias ──
function addCompetence(kind) {
  const compId = kind === 'tech' ? techNewCompetence.value : genNewCompetence.value
  const levelId = kind === 'tech' ? techNewLevel.value : genNewLevel.value
  if (!compId || !levelId) return
  const source = (competencesData.value ?? []).find(c => c.id === compId)
  const row = { competenceId: compId, name: source?.competitionName ?? `Competencia ${compId}`, levelsId: levelId }
  if (kind === 'tech') {
    techCompetences.value.push(row); techNewCompetence.value = null; techNewLevel.value = null
  } else {
    genCompetences.value.push(row); genNewCompetence.value = null; genNewLevel.value = null
  }
}
function removeCompetence(kind, index) {
  if (kind === 'tech') techCompetences.value.splice(index, 1)
  else genCompetences.value.splice(index, 1)
}

// ── Incompatibilidades ──
function addConflict() {
  if (!newConflictPerson.value || !newConflictIndex.value) return
  if (conflicts.value.some(c => c.personConflictId === newConflictPerson.value)) {
    toast.add({ severity: 'warn', summary: 'Duplicado', detail: 'Esa persona ya está en la lista', life: 3000 })
    return
  }
  const person = personsList.value.find(p => p.id === newConflictPerson.value)
  conflicts.value.push({
    personConflictId: newConflictPerson.value,
    name: person?.personName ?? '',
    surName: person?.surName ?? '',
    card: person?.card ?? '',
    conflictIndexId: newConflictIndex.value,
  })
  newConflictPerson.value = null
  newConflictIndex.value = null
}
function removeConflict(index) {
  conflicts.value.splice(index, 1)
}

// ── Cerrar equipo ──
async function handleClose() {
  if (!boss.value) return
  if (bossEvaluationId.value == null) {
    toast.add({ severity: 'warn', summary: 'Falta evaluación', detail: 'Selecciona la evaluación del jefe', life: 3000 }); return
  }
  if (projectEvaluationId.value == null) {
    toast.add({ severity: 'warn', summary: 'Falta evaluación', detail: 'Selecciona la evaluación del proyecto', life: 3000 }); return
  }
  const allCompetences = [...techCompetences.value, ...genCompetences.value]
  if (allCompetences.some(c => c.levelsId == null)) {
    toast.add({ severity: 'warn', summary: 'Falta nivel', detail: 'Todas las competencias deben tener un nivel asignado', life: 4000 }); return
  }
  if (conflicts.value.some(c => c.conflictIndexId == null)) {
    toast.add({ severity: 'warn', summary: 'Falta nivel de conflicto', detail: 'Todas las incompatibilidades deben tener un nivel', life: 4000 }); return
  }

  closing.value = true
  try {
    // 1) Guardar competencias e incompatibilidades del jefe
    await personService.patchCompetencesConflicts(boss.value.personId, {
      competenceValues: allCompetences.map(c => ({ competenceId: c.competenceId, levelsId: c.levelsId })),
      personConflicts: conflicts.value.map(c => ({ personConflictId: c.personConflictId, conflictIndexId: c.conflictIndexId })),
    })

    // 2) Cerrar el equipo con la evaluación del jefe y del proyecto
    await projectService.closeTeam(props.projectId, {
      roleEvaluation: projectEvaluationId.value,
      bossEvaluation: {
        person: boss.value.personId,
        role: boss.value.roleId,
        roleEvaluation: bossEvaluationId.value,
      },
    })

    toast.add({ severity: 'success', summary: 'Equipo cerrado', detail: 'El equipo se cerró correctamente', life: 4000 })
    router.push({ name: 'CloseTeam' })
  } catch (e) {
    const detail = await parseApiError(e, 'No se pudo cerrar el equipo')
    toast.add({ severity: 'error', summary: 'Error al cerrar', detail, life: 6000 })
  } finally {
    closing.value = false
  }
}

function goBack() {
  router.push({ name: 'CloseTeam' })
}

const tabs = [
  { id: 'competences', label: 'Competencias', icon: Award },
  { id: 'compatibility', label: 'Nivel de compatibilidad', icon: ShieldAlert },
]
</script>

<template>
  <div class="space-y-6">
    <PageBreadcrumb
      page-title="Cerrar Equipo"
      :items="[{ label: 'Cerrar Equipo', path: '/manage-projects/close-team' }]"
    />

    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-2">
          <Crown class="w-5 h-5 text-amber-500" />
          <h2 class="text-base font-semibold text-gray-800">Jefe de equipo: {{ bossName || '—' }}</h2>
        </div>
        <button
          type="button"
          @click="goBack"
          class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
          Volver
        </button>
      </div>

      <div v-if="loading" class="py-16 flex items-center justify-center gap-2 text-sm text-gray-400">
        <Loader2 class="w-5 h-5 animate-spin" />
        Cargando datos del jefe...
      </div>

      <template v-else>
        <!-- Evaluaciones -->
        <div class="px-6 py-5 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-600">Evaluación del jefe ({{ boss?.roleName || 'Jefe' }})</label>
            <AppSelect v-model="bossEvaluationId" :options="roleEvaluationOptions" placeholder="Seleccionar evaluación..." />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-600">Evaluación del proyecto</label>
            <AppSelect v-model="projectEvaluationId" :options="roleEvaluationOptions" placeholder="Seleccionar evaluación..." />
          </div>
        </div>

        <!-- Tabs -->
        <div class="px-6 pt-4 border-b border-gray-200">
          <nav class="flex gap-6 -mb-px">
            <button
              v-for="t in tabs"
              :key="t.id"
              type="button"
              @click="activeTab = t.id"
              class="inline-flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer"
              :class="activeTab === t.id ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
              <component :is="t.icon" class="w-4 h-4" />
              {{ t.label }}
            </button>
          </nav>
        </div>

        <!-- TAB COMPETENCIAS -->
        <div v-show="activeTab === 'competences'" class="p-6 space-y-6">
          <!-- Técnicas -->
          <section class="space-y-3">
            <div class="flex items-center gap-2">
              <Cpu class="w-4 h-4 text-brand-500" />
              <h3 class="text-sm font-semibold text-gray-700">Competencias Técnicas</h3>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-end gap-3 rounded-xl bg-gray-50 border border-gray-100 p-4">
              <div class="flex-1 min-w-[200px] space-y-1.5">
                <label class="text-xs font-medium text-gray-600">Competencia</label>
                <AppSelect v-model="techNewCompetence" :options="availableTechCompetences" placeholder="Seleccionar competencia..." :searchable="true" />
              </div>
              <div class="w-full sm:w-56 space-y-1.5">
                <label class="text-xs font-medium text-gray-600">Nivel</label>
                <AppSelect v-model="techNewLevel" :options="levelOptions" placeholder="Seleccionar nivel..." />
              </div>
              <button type="button" @click="addCompetence('tech')" :disabled="!techNewCompetence || !techNewLevel"
                class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Plus class="w-4 h-4" /> Agregar
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
                  <tr v-for="(c, idx) in techCompetences" :key="c.competenceId" class="hover:bg-gray-50/60">
                    <td class="px-4 py-2 text-gray-700">{{ c.name }}</td>
                    <td class="px-4 py-2"><AppSelect v-model="c.levelsId" :options="levelOptions" size="sm" placeholder="Nivel..." /></td>
                    <td class="px-2 py-2 text-right">
                      <button type="button" @click="removeCompetence('tech', idx)" class="p-1 rounded text-gray-300 hover:text-error-500 hover:bg-error-50 transition-colors">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!techCompetences.length"><td colspan="3" class="px-4 py-6 text-center text-sm text-gray-400">Sin competencias técnicas</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <div class="h-px bg-gray-100" />

          <!-- Genéricas -->
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
              <button type="button" @click="addCompetence('gen')" :disabled="!genNewCompetence || !genNewLevel"
                class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Plus class="w-4 h-4" /> Agregar
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
                    <td class="px-4 py-2"><AppSelect v-model="c.levelsId" :options="levelOptions" size="sm" placeholder="Nivel..." /></td>
                    <td class="px-2 py-2 text-right">
                      <button type="button" @click="removeCompetence('gen', idx)" class="p-1 rounded text-gray-300 hover:text-error-500 hover:bg-error-50 transition-colors">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!genCompetences.length"><td colspan="3" class="px-4 py-6 text-center text-sm text-gray-400">Sin competencias genéricas</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <!-- TAB COMPATIBILIDAD -->
        <div v-show="activeTab === 'compatibility'" class="p-6 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-end gap-3 rounded-xl bg-gray-50 border border-gray-100 p-4">
            <div class="flex-1 min-w-[200px] space-y-1.5">
              <label class="text-xs font-medium text-gray-600">Persona (miembro del equipo)</label>
              <AppSelect v-model="newConflictPerson" :options="conflictPersonOptions" placeholder="Seleccionar persona..." :searchable="true" search-placeholder="Buscar persona..." />
            </div>
            <div class="w-full sm:w-64 space-y-1.5">
              <label class="text-xs font-medium text-gray-600">Nivel de conflicto</label>
              <AppSelect v-model="newConflictIndex" :options="conflictIndexOptions" placeholder="Nivel de conflicto..." />
            </div>
            <button type="button" @click="addConflict" :disabled="!newConflictPerson || !newConflictIndex"
              class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <Plus class="w-4 h-4" /> Agregar
            </button>
          </div>
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                  <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Apellidos</th>
                  <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">DNI</th>
                  <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-64">Nivel de conflicto</th>
                  <th class="px-2 py-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(c, idx) in conflicts" :key="c.personConflictId" class="hover:bg-gray-50/60">
                  <td class="px-4 py-2 text-gray-700">{{ c.name }}</td>
                  <td class="px-4 py-2 text-gray-600">{{ c.surName }}</td>
                  <td class="px-4 py-2 text-gray-500">{{ c.card }}</td>
                  <td class="px-4 py-2"><AppSelect v-model="c.conflictIndexId" :options="conflictIndexOptions" size="sm" placeholder="Nivel de conflicto..." /></td>
                  <td class="px-2 py-2 text-right">
                    <button type="button" @click="removeConflict(idx)" class="p-1 rounded text-gray-300 hover:text-error-500 hover:bg-error-50 transition-colors">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                <tr v-if="!conflicts.length">
                  <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-400">El jefe no tiene incompatibilidades registradas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button type="button" @click="goBack"
            class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="button" :disabled="closing" @click="handleClose"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-error-500 text-white text-sm font-medium hover:bg-error-600 disabled:opacity-50 transition-colors">
            <Loader2 v-if="closing" class="w-4 h-4 animate-spin" />
            <Lock v-else class="w-4 h-4" />
            Cerrar equipo
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
