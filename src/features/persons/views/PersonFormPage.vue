<template>
  <div>
    <PageBreadcrumb
      :page-title="pageTitle"
      :items="[{ label: 'Personas', path: '/person' }]"
    />

    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-base font-semibold text-gray-800">{{ pageTitle }}</h2>
      </div>

      <!-- Tabs Navigation -->
      <div class="border-b border-gray-200 px-6">
        <nav class="-mb-px flex gap-0 overflow-x-auto no-scrollbar">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
            :class="activeTab === tab.key
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="p-6">

        <!-- Tab: Datos Básicos -->
        <div v-show="activeTab === 'basic'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Nombre <span class="text-error-500">*</span></label>
            <input v-model="personName" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" placeholder="Nombre" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Apellidos <span class="text-error-500">*</span></label>
            <input v-model="surName" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" placeholder="Apellidos" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">CI <span class="text-error-500">*</span></label>
            <input v-model="card" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" placeholder="Carnet de identidad" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Dirección</label>
            <input v-model="address" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" placeholder="Dirección" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Teléfono</label>
            <input v-model="phone" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" placeholder="Teléfono" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Correo</label>
            <input v-model="email" type="email" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" placeholder="Correo electrónico" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Sexo</label>
            <select v-model="sex" class="form-input bg-white">
              <option value="">Seleccione...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Estado</label>
            <select v-model="status" class="form-input bg-white">
              <option value="">Seleccione...</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Fecha de ingreso</label>
            <input v-model="inDate" type="date" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
            <input v-model="birthDate" type="date" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Carga de trabajo</label>
            <input v-model.number="workload" type="number" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" placeholder="0" min="0" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Experiencia (años)</label>
            <input v-model.number="experience" type="number" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" placeholder="0" min="0" />
          </div>

          <!-- Atributos -->
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Provincia</label>
            <select v-model="selectedCounty" class="form-input bg-white">
              <option value="">Seleccione...</option>
              <option v-for="o in countyOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Raza</label>
            <select v-model="selectedRace" class="form-input bg-white">
              <option value="">Seleccione...</option>
              <option v-for="o in raceOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Grupo</label>
            <select v-model="selectedGroup" class="form-input bg-white">
              <option value="">Seleccione...</option>
              <option v-for="o in groupOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Nacionalidad</label>
            <select v-model="selectedNacionality" class="form-input bg-white">
              <option value="">Seleccione...</option>
              <option v-for="o in nacionalityOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Religión</label>
            <select v-model="selectedReligion" class="form-input bg-white">
              <option value="">Seleccione...</option>
              <option v-for="o in religionOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
        </div>

        <!-- Tab: Competencias -->
        <div v-show="activeTab === 'competences'" class="space-y-4">
          <div class="flex gap-3 flex-wrap">
            <div class="flex-1 min-w-48 space-y-1">
              <label class="block text-sm font-medium text-gray-700">Competencia</label>
              <select v-model="selectedCompetence" class="form-input bg-white">
                <option value="">Seleccione...</option>
                <option v-for="o in competenceOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </div>
            <div class="flex-1 min-w-48 space-y-1">
              <label class="block text-sm font-medium text-gray-700">Nivel</label>
              <select v-model="selectedLevel" class="form-input bg-white">
                <option value="">Seleccione...</option>
                <option v-for="o in levelOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </div>
            <div class="flex items-end">
              <button @click="addCompetence" :disabled="!selectedCompetence || !selectedLevel"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 disabled:opacity-40 transition-colors">
                <Plus class="w-4 h-4" /> Agregar
              </button>
            </div>
          </div>
          <MiniTable
            :rows="competenceValues"
            :columns="[{ field: 'competenceName', header: 'Competencia' }, { field: 'levelName', header: 'Nivel' }]"
            v-model:selected="selectedCompetences"
            @remove="removeCompetences"
          />
        </div>

        <!-- Tab: Intereses -->
        <div v-show="activeTab === 'interests'" class="space-y-6">
          <!-- Roles -->
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Intereses en Roles</h3>
            <div class="flex gap-3 flex-wrap mb-3">
              <div class="flex-1 min-w-48 space-y-1">
                <label class="block text-sm font-medium text-gray-700">Rol</label>
                <select v-model="selectedRole" class="form-input bg-white">
                  <option value="">Seleccione...</option>
                  <option v-for="o in roleOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Preferencia</label>
                <label class="flex items-center gap-2 h-10 cursor-pointer">
                  <input type="checkbox" v-model="rolePreference" class="w-4 h-4 rounded border-gray-300 text-brand-500" />
                  <span class="text-sm text-gray-600">Preferido</span>
                </label>
              </div>
              <div class="flex items-end">
                <button @click="addRoleInterest" :disabled="!selectedRole"
                  class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 disabled:opacity-40 transition-colors">
                  <Plus class="w-4 h-4" /> Agregar
                </button>
              </div>
            </div>
            <MiniTable
              :rows="personalInterests"
              :columns="[{ field: 'roleName', header: 'Rol' }, { field: 'preference', header: 'Preferido', type: 'boolean' }]"
              v-model:selected="selectedRoleInterests"
              @remove="removeRoleInterests"
            />
          </div>

          <!-- Proyectos -->
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Intereses en Proyectos</h3>
            <div class="flex gap-3 flex-wrap mb-3">
              <div class="flex-1 min-w-48 space-y-1">
                <label class="block text-sm font-medium text-gray-700">Proyecto</label>
                <select v-model="selectedProject" class="form-input bg-white">
                  <option value="">Seleccione...</option>
                  <option v-for="o in projectOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Preferencia</label>
                <label class="flex items-center gap-2 h-10 cursor-pointer">
                  <input type="checkbox" v-model="projectPreference" class="w-4 h-4 rounded border-gray-300 text-brand-500" />
                  <span class="text-sm text-gray-600">Preferido</span>
                </label>
              </div>
              <div class="flex items-end">
                <button @click="addProjectInterest" :disabled="!selectedProject"
                  class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 disabled:opacity-40 transition-colors">
                  <Plus class="w-4 h-4" /> Agregar
                </button>
              </div>
            </div>
            <MiniTable
              :rows="personalProjectInterests"
              :columns="[{ field: 'projectName', header: 'Proyecto' }, { field: 'preference', header: 'Preferido', type: 'boolean' }]"
              v-model:selected="selectedProjectInterests"
              @remove="removeProjectInterests"
            />
          </div>
        </div>

        <!-- Tab: Test Psicológico -->
        <div v-show="activeTab === 'test'" class="space-y-6">
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Tipo MBTI</h3>
            <div class="w-64 space-y-1">
              <label class="block text-sm font-medium text-gray-700">Tipo</label>
              <select v-model="mbtiType" class="form-input bg-white">
                <option value="">Seleccione...</option>
                <option v-for="o in mbtiOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Roles Belbin</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div v-for="(key, label) in belbinRoleLabels" :key="key" class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">{{ label }}</label>
                <select v-model="belbinRoles[key]" class="form-input bg-white">
                  <option v-for="o in belbinOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Incompatibilidades -->
        <div v-show="activeTab === 'conflicts'" class="space-y-4">
          <div class="flex gap-3 flex-wrap">
            <div class="flex-1 min-w-48 space-y-1">
              <label class="block text-sm font-medium text-gray-700">Índice de conflicto</label>
              <select v-model="selectedConflictIndex" class="form-input bg-white">
                <option value="">Seleccione...</option>
                <option v-for="o in conflictIndexOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </div>
            <div class="flex-1 min-w-48 space-y-1">
              <label class="block text-sm font-medium text-gray-700">Persona</label>
              <select v-model="selectedConflictPerson" class="form-input bg-white">
                <option value="">Seleccione...</option>
                <option v-for="o in personOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </div>
            <div class="flex items-end">
              <button @click="addConflict" :disabled="!selectedConflictIndex || !selectedConflictPerson"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 disabled:opacity-40 transition-colors">
                <Plus class="w-4 h-4" /> Agregar
              </button>
            </div>
          </div>
          <MiniTable
            :rows="personConflicts"
            :columns="[{ field: 'conflictName', header: 'Índice conflicto' }, { field: 'personConflictName', header: 'Persona' }]"
            v-model:selected="selectedConflicts"
            @remove="removeConflicts"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <button
          type="button"
          @click="router.push('/person')"
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
import { ref, computed, onMounted, defineComponent, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { Plus, Save, Loader2, Trash2, CheckCircle2, XCircle } from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import { api } from '@/lib/api'

// Inline mini-table component for sub-collections
const MiniTable = defineComponent({
  name: 'MiniTable',
  props: {
    rows: { type: Array, default: () => [] },
    columns: { type: Array, required: true },
    selected: { type: Array, default: () => [] },
  },
  emits: ['update:selected', 'remove'],
  setup(props, { emit }) {
    function toggleRow(row) {
      const idx = props.selected.indexOf(row)
      const next = [...props.selected]
      if (idx >= 0) next.splice(idx, 1)
      else next.push(row)
      emit('update:selected', next)
    }
    return () => {
      if (!props.rows.length) {
        return h('div', { class: 'text-sm text-gray-400 p-4 text-center bg-gray-50 rounded-lg' }, 'Sin registros')
      }
      return h('div', { class: 'overflow-hidden rounded-lg border border-gray-200' }, [
        h('div', { class: 'flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200' }, [
          h('span', { class: 'text-xs font-medium text-gray-500' }, `${props.rows.length} registro(s)`),
          props.selected.length
            ? h('button', {
                class: 'inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-error-600 hover:bg-error-50 transition-colors',
                onClick: () => emit('remove'),
              }, 'Eliminar seleccionados')
            : null,
        ]),
        h('table', { class: 'min-w-full' }, [
          h('thead', {}, [
            h('tr', { class: 'border-b border-gray-200' }, [
              h('th', { class: 'w-8 px-3 py-2' }),
              ...props.columns.map(col =>
                h('th', { class: 'px-3 py-2 text-left text-xs font-medium text-gray-500' }, col.header)
              ),
            ])
          ]),
          h('tbody', { class: 'divide-y divide-gray-100' }, props.rows.map((row, i) =>
            h('tr', {
              key: i,
              class: 'hover:bg-gray-50 cursor-pointer ' + (props.selected.includes(row) ? 'bg-brand-50' : ''),
              onClick: () => toggleRow(row),
            }, [
              h('td', { class: 'w-8 px-3 py-2' }, [
                h('input', {
                  type: 'checkbox',
                  checked: props.selected.includes(row),
                  class: 'w-3.5 h-3.5 rounded border-gray-300 text-brand-500',
                  onChange: () => toggleRow(row),
                })
              ]),
              ...props.columns.map(col =>
                h('td', { class: 'px-3 py-2 text-sm text-gray-700' },
                  col.type === 'boolean'
                    ? h(row[col.field] ? CheckCircle2 : XCircle, {
                        class: row[col.field] ? 'w-4 h-4 text-success-500' : 'w-4 h-4 text-gray-300'
                      })
                    : String(row[col.field] ?? '—')
                )
              ),
            ])
          ))
        ])
      ])
    }
  }
})

const props = defineProps({
  mode: { type: String, default: 'create' },
})

const router = useRouter()
const route = useRoute()
const toast = useToast()

const activeTab = ref('basic')
const tabs = [
  { key: 'basic', label: 'Datos Básicos' },
  { key: 'competences', label: 'Competencias' },
  { key: 'interests', label: 'Intereses' },
  { key: 'test', label: 'Test Psicológico' },
  { key: 'conflicts', label: 'Incompatibilidades' },
]

// Basic data
const personName = ref('')
const card = ref('')
const surName = ref('')
const address = ref('')
const phone = ref('')
const sex = ref('')
const email = ref('')
const inDate = ref('')
const workload = ref(0)
const experience = ref(0)
const status = ref('')
const birthDate = ref('')

// References
const selectedCounty = ref('')
const selectedRace = ref('')
const selectedGroup = ref('')
const selectedNacionality = ref('')
const selectedReligion = ref('')

// Options
const countyOptions = ref([])
const raceOptions = ref([])
const groupOptions = ref([])
const nacionalityOptions = ref([])
const religionOptions = ref([])

// Competences
const competenceOptions = ref([])
const levelOptions = ref([])
const selectedCompetence = ref('')
const selectedLevel = ref('')
const competenceValues = ref([])
const selectedCompetences = ref([])

// Role interests
const roleOptions = ref([])
const selectedRole = ref('')
const rolePreference = ref(true)
const personalInterests = ref([])
const selectedRoleInterests = ref([])

// Project interests
const projectOptions = ref([])
const selectedProject = ref('')
const projectPreference = ref(true)
const personalProjectInterests = ref([])
const selectedProjectInterests = ref([])

// MBTI
const mbtiType = ref('')
const mbtiOptions = [
  'ESTJ','ENTJ','ESFJ','ENFJ','ESTP','ENTP','ESFP','ENFP',
  'ISTJ','INTJ','ISFJ','INFJ','ISTP','INTP','ISFP','INFP'
].map(v => ({ label: v, value: v }))

// Belbin
const belbinRoles = ref({
  implementador: 'Indiferente',
  coordinador: 'Indiferente',
  cerebro: 'Indiferente',
  investigador: 'Indiferente',
  monitor: 'Indiferente',
  cohesionador: 'Indiferente',
  impulsor: 'Indiferente',
  finalizador: 'Indiferente',
  especialista: 'Indiferente',
})

const belbinRoleLabels = {
  'Implementador': 'implementador',
  'Coordinador': 'coordinador',
  'Cerebro': 'cerebro',
  'Investigador': 'investigador',
  'Monitor': 'monitor',
  'Cohesionador': 'cohesionador',
  'Impulsor': 'impulsor',
  'Finalizador': 'finalizador',
  'Especialista': 'especialista',
}

const belbinOptions = [
  { label: 'Preferido', value: 'Preferido' },
  { label: 'Evitado', value: 'Evitado' },
  { label: 'Indiferente', value: 'Indiferente' },
]

// Conflicts
const conflictIndexOptions = ref([])
const selectedConflictIndex = ref('')
const selectedConflictPerson = ref('')
const personOptions = ref([])
const personConflicts = ref([])
const selectedConflicts = ref([])

const saving = ref(false)
const isEditMode = computed(() => props.mode === 'edit')
const pageTitle = computed(() => isEditMode.value ? 'Editar Persona' : 'Crear Persona')

onMounted(async () => {
  try {
    const [counties, races, groups, nats, rels, competences, levels, roles, projects, conflicts, persons] =
      await Promise.all([
        api.get('county').json(),
        api.get('race').json(),
        api.get('personGroups').json(),
        api.get('nacionality').json(),
        api.get('religion').json(),
        api.get('competence').json(),
        api.get('levels').json(),
        api.get('role').json(),
        api.get('project').json(),
        api.get('conflictIndex').json(),
        api.get('person').json(),
      ])

    countyOptions.value = counties.map(c => ({ label: c.countyName, value: c.id }))
    raceOptions.value = races.map(r => ({ label: r.raceName, value: r.id }))
    groupOptions.value = groups.map(g => ({ label: g.name, value: g.id }))
    nacionalityOptions.value = nats.map(n => ({ label: n.paisNac, value: n.id }))
    religionOptions.value = rels.map(r => ({ label: r.religionName, value: r.id }))
    competenceOptions.value = competences.map(c => ({ label: c.competitionName, value: c.id }))
    levelOptions.value = levels.map(l => ({ label: l.significance, value: l.id }))
    roleOptions.value = roles.map(r => ({ label: r.roleName, value: r.id }))
    projectOptions.value = projects.map(p => ({ label: p.projectName, value: p.id }))
    conflictIndexOptions.value = conflicts.map(c => ({ label: c.description, value: c.id }))
    personOptions.value = persons.map(p => ({ label: `${p.personName} ${p.surName}`, value: p.id }))
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las opciones', life: 3000 })
  }

  if (isEditMode.value && route.params.id) {
    try {
      const res = await api.get(`person/${route.params.id}`).json()
      const p = res?.data ?? res
      personName.value = p.personName ?? ''
      card.value = p.card ?? ''
      surName.value = p.surName ?? ''
      address.value = p.address ?? ''
      phone.value = p.phone ?? ''
      sex.value = p.sex ?? ''
      email.value = p.email ?? ''
      inDate.value = p.inDate ? p.inDate.split('T')[0] : ''
      birthDate.value = p.birthDate ? p.birthDate.split('T')[0] : ''
      workload.value = p.workload ?? 0
      experience.value = p.experience ?? 0
      status.value = p.status ?? ''
      selectedCounty.value = p.county?.id ?? p.county ?? ''
      selectedRace.value = p.race?.id ?? p.race ?? ''
      selectedGroup.value = p.group?.id ?? p.group ?? ''
      selectedNacionality.value = p.nacionality?.id ?? p.nacionality ?? ''
      selectedReligion.value = p.religion?.id ?? p.religion ?? ''

      competenceValues.value = p.competenceValues?.map(cv => ({
        competenceId: cv.competenceId ?? cv.competence?.id,
        competenceName: competenceOptions.value.find(c => c.value === (cv.competenceId ?? cv.competence?.id))?.label ?? '',
        levelsId: cv.levelsId ?? cv.levels?.id,
        levelName: levelOptions.value.find(l => l.value === (cv.levelsId ?? cv.levels?.id))?.label ?? '',
      })) ?? []

      personalInterests.value = p.personalInterests?.map(pi => ({
        roleId: pi.roleId ?? pi.role?.id,
        roleName: roleOptions.value.find(r => r.value === (pi.roleId ?? pi.role?.id))?.label ?? '',
        preference: pi.preference,
      })) ?? []

      personalProjectInterests.value = p.personalProjectInterests?.map(ppi => ({
        projectId: ppi.projectId ?? ppi.project?.id,
        projectName: projectOptions.value.find(pr => pr.value === (ppi.projectId ?? ppi.project?.id))?.label ?? '',
        preference: ppi.preference,
      })) ?? []

      if (p.personTest) {
        mbtiType.value = p.personTest.tipoMB ?? ''
        const belbinMap = {
          implementador: p.personTest.e_S,
          coordinador: p.personTest.i_D,
          cerebro: p.personTest.c_O,
          investigador: p.personTest.i_S,
          monitor: p.personTest.c_E,
          cohesionador: p.personTest.i_R,
          impulsor: p.personTest.m_E,
          finalizador: p.personTest.c_H,
          especialista: p.personTest.i_F,
        }
        const charToOption = { 'P': 'Preferido', 'E': 'Evitado', 'I': 'Indiferente' }
        Object.keys(belbinRoles.value).forEach(k => {
          belbinRoles.value[k] = charToOption[belbinMap[k]] ?? 'Indiferente'
        })
      }

      personConflicts.value = p.personConflicts?.map(pc => ({
        conflictIndexId: pc.conflictIndexId ?? pc.conflictIndex?.id,
        conflictName: conflictIndexOptions.value.find(c => c.value === (pc.conflictIndexId ?? pc.conflictIndex?.id))?.label ?? '',
        personConflictId: pc.personConflictId,
        personConflictName: personOptions.value.find(per => per.value === pc.personConflictId)?.label ?? '',
      })) ?? []
    } catch {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la persona', life: 3000 })
    }
  }
})

function addCompetence() {
  if (!selectedCompetence.value || !selectedLevel.value) return
  if (competenceValues.value.some(cv => cv.competenceId === selectedCompetence.value)) {
    toast.add({ severity: 'warn', summary: 'Duplicado', detail: 'Esta competencia ya fue agregada', life: 3000 })
    return
  }
  competenceValues.value.push({
    competenceId: selectedCompetence.value,
    competenceName: competenceOptions.value.find(c => c.value === selectedCompetence.value)?.label ?? '',
    levelsId: selectedLevel.value,
    levelName: levelOptions.value.find(l => l.value === selectedLevel.value)?.label ?? '',
  })
  selectedCompetence.value = ''
  selectedLevel.value = ''
}

function removeCompetences() {
  competenceValues.value = competenceValues.value.filter(c => !selectedCompetences.value.includes(c))
  selectedCompetences.value = []
}

function addRoleInterest() {
  if (!selectedRole.value) return
  if (personalInterests.value.some(pi => pi.roleId === selectedRole.value)) {
    toast.add({ severity: 'warn', summary: 'Duplicado', detail: 'Este rol ya fue agregado', life: 3000 })
    return
  }
  personalInterests.value.push({
    roleId: selectedRole.value,
    roleName: roleOptions.value.find(r => r.value === selectedRole.value)?.label ?? '',
    preference: rolePreference.value,
  })
  selectedRole.value = ''
  rolePreference.value = true
}

function removeRoleInterests() {
  personalInterests.value = personalInterests.value.filter(r => !selectedRoleInterests.value.includes(r))
  selectedRoleInterests.value = []
}

function addProjectInterest() {
  if (!selectedProject.value) return
  if (personalProjectInterests.value.some(ppi => ppi.projectId === selectedProject.value)) {
    toast.add({ severity: 'warn', summary: 'Duplicado', detail: 'Este proyecto ya fue agregado', life: 3000 })
    return
  }
  personalProjectInterests.value.push({
    projectId: selectedProject.value,
    projectName: projectOptions.value.find(p => p.value === selectedProject.value)?.label ?? '',
    preference: projectPreference.value,
  })
  selectedProject.value = ''
  projectPreference.value = true
}

function removeProjectInterests() {
  personalProjectInterests.value = personalProjectInterests.value.filter(p => !selectedProjectInterests.value.includes(p))
  selectedProjectInterests.value = []
}

function addConflict() {
  if (!selectedConflictIndex.value || !selectedConflictPerson.value) return
  if (personConflicts.value.some(pc => pc.personConflictId === selectedConflictPerson.value)) {
    toast.add({ severity: 'warn', summary: 'Duplicado', detail: 'Esta persona ya fue agregada', life: 3000 })
    return
  }
  personConflicts.value.push({
    conflictIndexId: selectedConflictIndex.value,
    conflictName: conflictIndexOptions.value.find(c => c.value === selectedConflictIndex.value)?.label ?? '',
    personConflictId: selectedConflictPerson.value,
    personConflictName: personOptions.value.find(p => p.value === selectedConflictPerson.value)?.label ?? '',
  })
  selectedConflictIndex.value = ''
  selectedConflictPerson.value = ''
}

function removeConflicts() {
  personConflicts.value = personConflicts.value.filter(c => !selectedConflicts.value.includes(c))
  selectedConflicts.value = []
}

async function handleSave() {
  if (!personName.value.trim() || !card.value.trim() || !surName.value.trim()) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'Complete los campos obligatorios: Nombre, CI y Apellidos', life: 3000 })
    activeTab.value = 'basic'
    return
  }

  saving.value = true
  try {
    const payload = {
      personName: personName.value,
      card: card.value,
      surName: surName.value,
      address: address.value,
      phone: phone.value,
      sex: sex.value || null,
      email: email.value,
      inDate: inDate.value || null,
      workload: workload.value,
      experience: experience.value,
      status: status.value,
      birthDate: birthDate.value || null,
      county: selectedCounty.value || null,
      race: selectedRace.value || null,
      group: selectedGroup.value || null,
      nacionality: selectedNacionality.value || null,
      religion: selectedReligion.value || null,
      personTest: {
        tipoMB: mbtiType.value || '',
        e_S: belbinRoles.value.implementador.charAt(0),
        i_D: belbinRoles.value.coordinador.charAt(0),
        c_O: belbinRoles.value.cerebro.charAt(0),
        i_S: belbinRoles.value.investigador.charAt(0),
        c_E: belbinRoles.value.monitor.charAt(0),
        i_R: belbinRoles.value.cohesionador.charAt(0),
        m_E: belbinRoles.value.impulsor.charAt(0),
        c_H: belbinRoles.value.finalizador.charAt(0),
        i_F: belbinRoles.value.especialista.charAt(0),
      },
    }

    if (isEditMode.value) {
      await api.put(`person/${route.params.id}`, { json: payload }).json()
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Persona actualizada correctamente', life: 3000 })
    } else {
      await api.post('person', { json: payload }).json()
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Persona creada correctamente', life: 3000 })
    }
    router.push('/person')
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

