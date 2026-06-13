<script setup>
import { ref, reactive, computed, onMounted, defineComponent, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { Plus, Save, Loader2, Trash2, CheckCircle2, XCircle, ChevronRight, AlertCircle } from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppDatePicker from '@/components/ui/AppDatePicker.vue'
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

// Static options
const sexOptions = [
  { label: 'Masculino', value: 'M' },
  { label: 'Femenino', value: 'F' },
]
const statusOptions = [
  { label: 'Activo', value: 'Activo' },
  { label: 'Inactivo', value: 'Inactivo' },
]
const mbtiValues = [
  'ESTJ','ENTJ','ESFJ','ENFJ','ESTP','ENTP','ESFP','ENFP',
  'ISTJ','INTJ','ISFJ','INFJ','ISTP','INTP','ISFP','INFP',
]
const mbtiOptions = mbtiValues.map(v => ({ label: v, value: v }))
const belbinOptions = [
  { label: 'Preferido', value: 'Preferido' },
  { label: 'Evitado', value: 'Evitado' },
  { label: 'Indiferente', value: 'Indiferente' },
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
const experience = ref(0)
const status = ref('')
const birthDate = ref('')

// References
const selectedCounty = ref('')
const selectedRace = ref('')
const selectedGroup = ref('')
const selectedNacionality = ref('')
const selectedReligion = ref('')

// Dynamic options
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

// Conflicts
const conflictIndexOptions = ref([])
const selectedConflictIndex = ref('')
const selectedConflictPerson = ref('')
const personOptions = ref([])
const personConflicts = ref([])
const selectedConflicts = ref([])

const saving = ref(false)
const errors = reactive({})

const ERROR_ES = {
  'Person name is required': 'El nombre es obligatorio',
  'Only letters and spaces are allowed': 'Solo se permiten letras y espacios',
  'ID card is required': 'El CI es obligatorio',
  'Card must contain at least 8 digits': 'El CI debe tener al menos 8 dígitos',
  'Surname is required': 'Los apellidos son obligatorios',
  'Address is required': 'La dirección es obligatoria',
  'Phone is required': 'El teléfono es obligatorio',
  'Phone must contain at least 8 digits': 'El teléfono debe tener al menos 8 dígitos',
  'Sex is required': 'El sexo es obligatorio',
  "Sex must be 'M' or 'F'": "El sexo debe ser 'M' o 'F'",
  'Email is required': 'El correo es obligatorio',
  'Email should be valid': 'El correo no es válido',
  'In date is required': 'La fecha de ingreso es obligatoria',
  'Experience is required': 'La experiencia es obligatoria',
  'Birth date is required': 'La fecha de nacimiento es obligatoria',
  'Birth date must be in the past': 'La fecha de nacimiento debe ser en el pasado',
  'County ID is required': 'La provincia es obligatoria',
  'Race ID is required': 'La raza es obligatoria',
  'Person group ID is required': 'El grupo es obligatorio',
  'Nacionality ID is required': 'La nacionalidad es obligatoria',
  'Religion ID is required': 'La religión es obligatoria',
  'Person test is required': 'El test psicológico es obligatorio',
}
const te = msg => ERROR_ES[msg] ?? msg
const isEditMode = computed(() => props.mode === 'edit')
const pageTitle = computed(() => isEditMode.value ? 'Editar Persona' : 'Crear Persona')

const activeTabIndex = computed(() => tabs.findIndex(t => t.key === activeTab.value))
const isLastTab = computed(() => activeTabIndex.value === tabs.length - 1)

function goToNextTab() {
  if (!isLastTab.value) activeTab.value = tabs[activeTabIndex.value + 1].key
}

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
      experience.value = p.experience ?? 0
      const rawStatus = p.status
      if (rawStatus === true || rawStatus === 'active' || String(rawStatus).toLowerCase() === 'activo') {
        status.value = 'Activo'
      } else if (rawStatus === false || rawStatus === 'inactive' || String(rawStatus).toLowerCase() === 'inactivo') {
        status.value = 'Inactivo'
      } else {
        status.value = rawStatus ?? ''
      }
      selectedCounty.value = p.county?.id ?? p.county ?? ''
      selectedRace.value = p.race?.id ?? p.race ?? ''
      selectedGroup.value = p.group?.id ?? p.group ?? ''
      selectedNacionality.value = p.nacionality?.id ?? p.nacionality ?? ''
      selectedReligion.value = p.religion?.id ?? p.religion ?? ''

      competenceValues.value = p.competenceValues?.map(cv => {
        const compId = cv.competenceId ?? cv.competence?.id
        const lvlId  = cv.levelsId ?? cv.levelId ?? cv.levels?.id ?? cv.level?.id
        return {
          competenceId: compId,
          competenceName: competenceOptions.value.find(c => c.value === compId)?.label ?? cv.competence?.competitionName ?? '',
          levelsId: lvlId,
          levelName: levelOptions.value.find(l => l.value === lvlId)?.label ?? cv.levels?.significance ?? cv.level?.significance ?? '',
        }
      }) ?? []

      personalInterests.value = p.personalInterests?.map(pi => {
        const roleId = pi.roleId ?? pi.role?.id
        return {
          roleId,
          roleName: roleOptions.value.find(r => r.value === roleId)?.label ?? pi.role?.roleName ?? '',
          preference: pi.preference ?? false,
        }
      }) ?? []

      personalProjectInterests.value = p.personalProjectInterests?.map(ppi => {
        const projectId = ppi.projectId ?? ppi.project?.id
        return {
          projectId,
          projectName: projectOptions.value.find(pr => pr.value === projectId)?.label ?? ppi.project?.projectName ?? '',
          preference: ppi.preference ?? false,
        }
      }) ?? []

      const test = p.personTest ?? p.workerTest
      if (test) {
        mbtiType.value = test.mbtiType ?? test.tipoMB ?? ''
        const belbinMap = {
          implementador: test.i_M,
          coordinador:   test.c_O,
          cerebro:       test.c_E,
          investigador:  test.i_R,
          monitor:       test.m_E,
          cohesionador:  test.c_H,
          impulsor:      test.i_S,
          finalizador:   test.i_F,
          especialista:  test.e_S,
        }
        // handles both single-char ('P','E','I') and full-string ('Preferido','Evitado','Indiferente')
        const charToOption = {
          P: 'Preferido', Preferido: 'Preferido',
          E: 'Evitado',   Evitado: 'Evitado',
          I: 'Indiferente', Indiferente: 'Indiferente',
        }
        Object.keys(belbinRoles.value).forEach(k => {
          belbinRoles.value[k] = charToOption[belbinMap[k]] ?? 'Indiferente'
        })
      }

      const rawConflicts = p.personConflicts ?? p.workerConflicts ?? []
      personConflicts.value = rawConflicts.map(pc => {
        const ciId = pc.conflictIndexId ?? pc.conflictIndex?.id
        const conflictWorker = pc.conflictPerson ?? pc.workersFk ?? pc.workerFk ?? pc.worker
        const pcId = pc.personConflictId ?? pc.conflictPersonId ?? conflictWorker?.id
        const fallbackName = conflictWorker
          ? `${conflictWorker.personName ?? ''} ${conflictWorker.surName ?? ''}`.trim()
          : ''
        return {
          conflictIndexId: ciId,
          conflictName: conflictIndexOptions.value.find(c => c.value === ciId)?.label ?? pc.conflictIndex?.description ?? '',
          personConflictId: pcId,
          personConflictName: personOptions.value.find(per => per.value === pcId)?.label ?? fallbackName,
        }
      })
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
  // Limpiar errores previos
  Object.keys(errors).forEach(k => delete errors[k])

  // Validación client-side de campos obligatorios
  let hasErrors = false
  if (!personName.value.trim()) {
    errors.personName = 'El nombre es obligatorio'
    hasErrors = true
  }
  if (!surName.value.trim()) {
    errors.surName = 'Los apellidos son obligatorios'
    hasErrors = true
  }
  if (!card.value.trim()) {
    errors.card = 'El CI es obligatorio'
    hasErrors = true
  }

  if (hasErrors) {
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
      experience: experience.value,
      status: status.value,
      birthDate: birthDate.value || null,
      county: selectedCounty.value || null,
      race: selectedRace.value || null,
      group: selectedGroup.value || null,
      nacionality: selectedNacionality.value || null,
      religion: selectedReligion.value || null,
      personTest: {
        mbtiType: mbtiType.value || '',
        i_M: belbinRoles.value.implementador.charAt(0),
        c_O: belbinRoles.value.coordinador.charAt(0),
        c_E: belbinRoles.value.cerebro.charAt(0),
        i_R: belbinRoles.value.investigador.charAt(0),
        m_E: belbinRoles.value.monitor.charAt(0),
        c_H: belbinRoles.value.cohesionador.charAt(0),
        i_S: belbinRoles.value.impulsor.charAt(0),
        i_F: belbinRoles.value.finalizador.charAt(0),
        e_S: belbinRoles.value.especialista.charAt(0),
      },
      competenceValues: competenceValues.value.map(cv => ({
        competenceId: cv.competenceId,
        levelsId: cv.levelsId,
      })),
      personalInterests: personalInterests.value.map(pi => ({
        roleId: pi.roleId,
        preference: pi.preference,
      })),
      personalProjectInterests: personalProjectInterests.value.map(ppi => ({
        projectId: ppi.projectId,
        preference: ppi.preference,
      })),
      personConflicts: personConflicts.value.map(pc => ({
        conflictIndexId: pc.conflictIndexId,
        personConflictId: pc.personConflictId,
      })),
    }

    const response = isEditMode.value
      ? await api.put(`person/${route.params.id}`, { json: payload, throwHttpErrors: false })
      : await api.post('person', { json: payload, throwHttpErrors: false })

    if (!response.ok) {
      let detail = 'Error al guardar la persona'
      try {
        const body = await response.json()
        if (body?.fieldErrors && typeof body.fieldErrors === 'object') {
          Object.entries(body.fieldErrors).forEach(([field, msg]) => {
            errors[field] = te(msg)
          })
          detail = 'Corrija los errores marcados en el formulario'
        } else if (body?.message) {
          detail = te(body.message)
          const msg = body.message.toLowerCase()
          if (msg.includes('ci') || msg.includes('carnet') || msg.includes('card') || msg.includes('duplicad') || msg.includes('ya exist')) {
            errors.card = te(body.message)
          } else if (msg.includes('email') || msg.includes('correo')) {
            errors.email = te(body.message)
          } else if (msg.includes('nombre') || msg.includes('name')) {
            errors.personName = te(body.message)
          } else if (msg.includes('apellido') || msg.includes('surname')) {
            errors.surName = te(body.message)
          } else if (msg.includes('tel') || msg.includes('phone')) {
            errors.phone = te(body.message)
          }
        }
        if (errors.personName || errors.surName || errors.card || errors.email || errors.phone || errors.address) {
          activeTab.value = 'basic'
        }
      } catch {}
      toast.add({ severity: 'error', summary: 'Error al guardar', detail, life: 4000 })
      return
    }

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: isEditMode.value ? 'Persona actualizada correctamente' : 'Persona creada correctamente',
      life: 3000
    })
    router.push('/person')
  } catch (e) {
    let detail = 'Error al guardar la persona'
    if (e?.name === 'TypeError') detail = 'Sin conexión con el servidor'
    toast.add({ severity: 'error', summary: 'Error al guardar', detail, life: 4000 })
  } finally {
    saving.value = false
  }
}
</script>

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
            <input
              v-model="personName"
              @input="delete errors.personName"
              type="text"
              :class="['w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-colors',
                errors.personName ? 'border-error-400 focus:ring-error-500/20 focus:border-error-400' : 'border-gray-300 focus:ring-brand-500/20 focus:border-brand-500']"
              placeholder="Nombre"
            />
            <p v-if="errors.personName" class="flex items-center gap-1 text-xs text-error-600">
              <AlertCircle class="w-3 h-3 flex-shrink-0" />{{ errors.personName }}
            </p>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Apellidos <span class="text-error-500">*</span></label>
            <input
              v-model="surName"
              @input="delete errors.surName"
              type="text"
              :class="['w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-colors',
                errors.surName ? 'border-error-400 focus:ring-error-500/20 focus:border-error-400' : 'border-gray-300 focus:ring-brand-500/20 focus:border-brand-500']"
              placeholder="Apellidos"
            />
            <p v-if="errors.surName" class="flex items-center gap-1 text-xs text-error-600">
              <AlertCircle class="w-3 h-3 flex-shrink-0" />{{ errors.surName }}
            </p>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">CI <span class="text-error-500">*</span></label>
            <input
              v-model="card"
              @input="delete errors.card"
              type="text"
              :class="['w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-colors',
                errors.card ? 'border-error-400 focus:ring-error-500/20 focus:border-error-400' : 'border-gray-300 focus:ring-brand-500/20 focus:border-brand-500']"
              placeholder="Carnet de identidad"
            />
            <p v-if="errors.card" class="flex items-center gap-1 text-xs text-error-600">
              <AlertCircle class="w-3 h-3 flex-shrink-0" />{{ errors.card }}
            </p>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Dirección</label>
            <input
              v-model="address"
              @input="delete errors.address"
              type="text"
              :class="['w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-colors',
                errors.address ? 'border-error-400 focus:ring-error-500/20 focus:border-error-400' : 'border-gray-300 focus:ring-brand-500/20 focus:border-brand-500']"
              placeholder="Dirección"
            />
            <p v-if="errors.address" class="flex items-center gap-1 text-xs text-error-600">
              <AlertCircle class="w-3 h-3 flex-shrink-0" />{{ errors.address }}
            </p>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              v-model="phone"
              @input="delete errors.phone"
              type="text"
              :class="['w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-colors',
                errors.phone ? 'border-error-400 focus:ring-error-500/20 focus:border-error-400' : 'border-gray-300 focus:ring-brand-500/20 focus:border-brand-500']"
              placeholder="Teléfono"
            />
            <p v-if="errors.phone" class="flex items-center gap-1 text-xs text-error-600">
              <AlertCircle class="w-3 h-3 flex-shrink-0" />{{ errors.phone }}
            </p>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Correo</label>
            <input
              v-model="email"
              @input="delete errors.email"
              type="email"
              :class="['w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-colors',
                errors.email ? 'border-error-400 focus:ring-error-500/20 focus:border-error-400' : 'border-gray-300 focus:ring-brand-500/20 focus:border-brand-500']"
              placeholder="Correo electrónico"
            />
            <p v-if="errors.email" class="flex items-center gap-1 text-xs text-error-600">
              <AlertCircle class="w-3 h-3 flex-shrink-0" />{{ errors.email }}
            </p>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Sexo</label>
            <AppSelect v-model="sex" :options="sexOptions" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Estado</label>
            <AppSelect v-model="status" :options="statusOptions" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Fecha de ingreso</label>
            <AppDatePicker v-model="inDate" placeholder="dd/mm/aaaa" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
            <AppDatePicker v-model="birthDate" placeholder="dd/mm/aaaa" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Experiencia (años)</label>
            <input v-model.number="experience" type="number" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" placeholder="0" min="0" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Provincia</label>
            <AppSelect v-model="selectedCounty" :options="countyOptions" searchable />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Raza</label>
            <AppSelect v-model="selectedRace" :options="raceOptions" searchable />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Grupo</label>
            <AppSelect v-model="selectedGroup" :options="groupOptions" searchable />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Nacionalidad</label>
            <AppSelect v-model="selectedNacionality" :options="nacionalityOptions" searchable />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">Religión</label>
            <AppSelect v-model="selectedReligion" :options="religionOptions" searchable />
          </div>
        </div>

        <!-- Tab: Competencias -->
        <div v-show="activeTab === 'competences'" class="space-y-4">
          <div class="flex gap-3 flex-wrap">
            <div class="flex-1 min-w-48 space-y-1">
              <label class="block text-sm font-medium text-gray-700">Competencia</label>
              <AppSelect v-model="selectedCompetence" :options="competenceOptions" searchable />
            </div>
            <div class="flex-1 min-w-48 space-y-1">
              <label class="block text-sm font-medium text-gray-700">Nivel</label>
              <AppSelect v-model="selectedLevel" :options="levelOptions" searchable />
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
                <AppSelect v-model="selectedRole" :options="roleOptions" searchable />
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
                <AppSelect v-model="selectedProject" :options="projectOptions" searchable />
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
              <AppSelect v-model="mbtiType" :options="mbtiOptions" />
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Roles Belbin</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div v-for="(key, label) in belbinRoleLabels" :key="key" class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">{{ label }}</label>
                <AppSelect v-model="belbinRoles[key]" :options="belbinOptions" />
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Incompatibilidades -->
        <div v-show="activeTab === 'conflicts'" class="space-y-4">
          <div class="flex gap-3 flex-wrap">
            <div class="flex-1 min-w-48 space-y-1">
              <label class="block text-sm font-medium text-gray-700">Índice de conflicto</label>
              <AppSelect v-model="selectedConflictIndex" :options="conflictIndexOptions" searchable />
            </div>
            <div class="flex-1 min-w-48 space-y-1">
              <label class="block text-sm font-medium text-gray-700">Persona</label>
              <AppSelect v-model="selectedConflictPerson" :options="personOptions" searchable search-placeholder="Buscar persona..." />
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
        <!-- En modo crear: avanza tabs hasta el último, luego guarda -->
        <button
          v-if="!isEditMode && !isLastTab"
          type="button"
          @click="goToNextTab"
          class="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors flex items-center gap-2"
        >
          Siguiente
          <ChevronRight class="w-4 h-4" />
        </button>
        <button
          v-else
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
