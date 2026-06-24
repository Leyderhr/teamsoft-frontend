<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import { Plus, Save, Loader2, ChevronRight, AlertCircle } from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppDatePicker from '@/components/ui/AppDatePicker.vue'
import MiniTable from '@/components/common/MiniTable.vue'
import { api } from '@/lib/api'
import { parseApiError } from '@/lib/apiError'

const props = defineProps({
  mode: { type: String, default: 'create' },
})

const router = useRouter()
const route = useRoute()
const toast = useToast()
const { t } = useI18n()

const activeTab = ref('basic')
const tabs = computed(() => [
  { key: 'basic', label: t('features.persons.tabs.basic') },
  { key: 'competences', label: t('features.persons.tabs.competences') },
  { key: 'interests', label: t('features.persons.tabs.interests') },
  { key: 'test', label: t('features.persons.tabs.test') },
  { key: 'conflicts', label: t('features.persons.tabs.conflicts') },
])

// Static options
const sexOptions = computed(() => [
  { label: t('features.persons.sexOptions.preferNotToSay'), value: '' },
  { label: t('features.persons.sexOptions.male'), value: 'M' },
  { label: t('features.persons.sexOptions.female'), value: 'F' },
])
const mbtiValues = [
  'ESTJ','ENTJ','ESFJ','ENFJ','ESTP','ENTP','ESFP','ENFP',
  'ISTJ','INTJ','ISFJ','INFJ','ISTP','INTP','ISFP','INFP',
]
const mbtiOptions = mbtiValues.map(v => ({ label: v, value: v }))
const belbinOptions = computed(() => [
  { label: t('features.persons.belbinOptions.preferred'), value: 'Preferido' },
  { label: t('features.persons.belbinOptions.avoided'), value: 'Evitado' },
  { label: t('features.persons.belbinOptions.indifferent'), value: 'Indiferente' },
])

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
const enabled = ref(true) // estado: true = ACTIVE, false = INACTIVE
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
  implementador: 'features.persons.belbinRoles.implementer',
  coordinador: 'features.persons.belbinRoles.coordinator',
  cerebro: 'features.persons.belbinRoles.plant',
  investigador: 'features.persons.belbinRoles.resourceInvestigator',
  monitor: 'features.persons.belbinRoles.monitor',
  cohesionador: 'features.persons.belbinRoles.teamworker',
  impulsor: 'features.persons.belbinRoles.shaper',
  finalizador: 'features.persons.belbinRoles.finisher',
  especialista: 'features.persons.belbinRoles.specialist',
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

const isEditMode = computed(() => props.mode === 'edit')
const pageTitle = computed(() => isEditMode.value ? t('features.persons.editTitle') : t('features.persons.createTitle'))

const activeTabIndex = computed(() => tabs.value.findIndex(tab => tab.key === activeTab.value))
const isLastTab = computed(() => activeTabIndex.value === tabs.value.length - 1)

function goToNextTab() {
  if (!isLastTab.value) activeTab.value = tabs.value[activeTabIndex.value + 1].key
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
    raceOptions.value = [{ label: t('features.persons.sexOptions.preferNotToSay'), value: '' }, ...races.map(r => ({ label: r.raceName, value: r.id }))]
    groupOptions.value = groups.map(g => ({ label: g.name, value: g.id }))
    nacionalityOptions.value = nats.map(n => ({ label: n.paisNac, value: n.id }))
    religionOptions.value = [{ label: t('features.persons.sexOptions.preferNotToSay'), value: '' }, ...rels.map(r => ({ label: r.religionName, value: r.id }))]
    competenceOptions.value = competences.map(c => ({ label: c.competitionName, value: c.id }))
    levelOptions.value = levels.map(l => ({ label: l.significance, value: l.id }))
    roleOptions.value = roles.map(r => ({ label: r.roleName, value: r.id }))
    projectOptions.value = projects.map(p => ({ label: p.projectName, value: p.id }))
    conflictIndexOptions.value = conflicts.map(c => ({ label: c.description, value: c.id }))
    personOptions.value = persons.map(p => ({ label: `${p.personName} ${p.surName}`, value: p.id }))
  } catch {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('features.persons.optionsLoadError'), life: 3000 })
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
      // El estado llega como 'ACTIVE'/'INACTIVE' (o variantes); el toggle queda activo salvo que sea inactivo
      enabled.value = !(p.status === false || String(p.status ?? '').toUpperCase().includes('INACT'))
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
        // El backend devuelve la persona incompatible en `personConflict`
        const conflictWorker = pc.personConflict ?? pc.conflictPerson ?? pc.workersFk ?? pc.workerFk ?? pc.worker
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
      toast.add({ severity: 'error', summary: t('common.error'), detail: t('features.persons.loadError'), life: 3000 })
    }
  }
})

function addCompetence() {
  if (!selectedCompetence.value || !selectedLevel.value) return
  if (competenceValues.value.some(cv => cv.competenceId === selectedCompetence.value)) {
    toast.add({ severity: 'warn', summary: t('features.persons.duplicateSummary'), detail: t('features.persons.duplicateCompetence'), life: 3000 })
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
    toast.add({ severity: 'warn', summary: t('features.persons.duplicateSummary'), detail: t('features.persons.duplicateRole'), life: 3000 })
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
    toast.add({ severity: 'warn', summary: t('features.persons.duplicateSummary'), detail: t('features.persons.duplicateProject'), life: 3000 })
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
    toast.add({ severity: 'warn', summary: t('features.persons.duplicateSummary'), detail: t('features.persons.duplicateConflict'), life: 3000 })
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
    errors.personName = t('features.persons.fieldErrors')
    hasErrors = true
  }
  if (!surName.value.trim()) {
    errors.surName = t('features.persons.fieldErrors')
    hasErrors = true
  }
  if (!card.value.trim()) {
    errors.card = t('features.persons.fieldErrors')
    hasErrors = true
  }
  if (!address.value.trim()) {
    errors.address = t('features.persons.fieldErrors')
    hasErrors = true
  }
  if (!phone.value.trim()) {
    errors.phone = t('features.persons.fieldErrors')
    hasErrors = true
  }
  if (!email.value.trim()) {
    errors.email = t('features.persons.fieldErrors')
    hasErrors = true
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    errors.email = t('features.persons.fieldErrors')
    hasErrors = true
  }
  if (!inDate.value.trim()) {
    errors.inDate = t('features.persons.fieldErrors')
    hasErrors = true
  }
  if (experience.value === '' || experience.value === null || experience.value === undefined || Number.isNaN(experience.value)) {
    errors.experience = t('features.persons.fieldErrors')
    hasErrors = true
  }
  if (!birthDate.value.trim()) {
    errors.birthDate = t('features.persons.fieldErrors')
    hasErrors = true
  }
  if (!selectedGroup.value) {
    errors.group = t('features.persons.fieldErrors')
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
      status: enabled.value ? 'ACTIVE' : 'INACTIVE',
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
      let detail = t('common.saveError')
      try {
        const body = await response.json()
        if (body?.fieldErrors && typeof body.fieldErrors === 'object') {
          Object.entries(body.fieldErrors).forEach(([field, msg]) => {
            errors[field] = msg
          })
          detail = t('features.persons.fieldErrors')
        } else if (body?.message) {
          detail = body.message
          const msg = body.message.toLowerCase()
          if (msg.includes('ci') || msg.includes('carnet') || msg.includes('card') || msg.includes('duplicad') || msg.includes('ya exist')) {
            errors.card = body.message
          } else if (msg.includes('email') || msg.includes('correo')) {
            errors.email = body.message
          } else if (msg.includes('nombre') || msg.includes('name')) {
            errors.personName = body.message
          } else if (msg.includes('apellido') || msg.includes('surname')) {
            errors.surName = body.message
          } else if (msg.includes('tel') || msg.includes('phone')) {
            errors.phone = body.message
          }
        }
        if (errors.personName || errors.surName || errors.card || errors.email || errors.phone || errors.address) {
          activeTab.value = 'basic'
        }
      } catch {}
      toast.add({ severity: 'error', summary: t('features.persons.fieldErrorsSummary'), detail, life: 4000 })
      return
    }

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: isEditMode.value ? t('features.persons.updated') : t('features.persons.created'),
      life: 3000
    })
    router.push('/person')
  } catch (e) {
    const detail = e?.name === 'TypeError'
      ? t('features.persons.connectionError')
      : await parseApiError(e, t('common.saveError'))
    toast.add({ severity: 'error', summary: t('features.persons.fieldErrorsSummary'), detail, life: 4000 })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <PageBreadcrumb
      :page-title="pageTitle"
      :items="[{ label: t('features.persons.title'), path: '/person' }]"
    />

    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
        <h2 class="text-base font-semibold text-gray-800">{{ pageTitle }}</h2>
        <div class="flex items-center gap-3 flex-shrink-0">
          <span class="text-sm font-medium" :class="enabled ? 'text-success-600' : 'text-gray-400'">
            {{ enabled ? t('features.persons.status.active') : t('features.persons.status.inactive') }}
          </span>
          <button
            type="button"
            role="switch"
            :aria-checked="enabled"
            @click="enabled = !enabled"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            :class="enabled ? 'bg-success-500' : 'bg-gray-300'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200"
              :class="enabled ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
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
            <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.fields.name') }} <span class="text-error-500">*</span></label>
            <input
              v-model="personName"
              @input="delete errors.personName"
              type="text"
              :class="['w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-colors',
                errors.personName ? 'border-error-400 focus:ring-error-500/20 focus:border-error-400' : 'border-gray-300 focus:ring-brand-500/20 focus:border-brand-500']"
              :placeholder="t('features.persons.fields.name')"
            />
            <p v-if="errors.personName" class="flex items-center gap-1 text-xs text-error-600">
              <AlertCircle class="w-3 h-3 flex-shrink-0" />{{ errors.personName }}
            </p>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.fields.surname') }} <span class="text-error-500">*</span></label>
            <input
              v-model="surName"
              @input="delete errors.surName"
              type="text"
              :class="['w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-colors',
                errors.surName ? 'border-error-400 focus:ring-error-500/20 focus:border-error-400' : 'border-gray-300 focus:ring-brand-500/20 focus:border-brand-500']"
              :placeholder="t('features.persons.fields.surname')"
            />
            <p v-if="errors.surName" class="flex items-center gap-1 text-xs text-error-600">
              <AlertCircle class="w-3 h-3 flex-shrink-0" />{{ errors.surName }}
            </p>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.fields.card') }} <span class="text-error-500">*</span></label>
            <input
              v-model="card"
              @input="delete errors.card"
              type="text"
              :class="['w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-colors',
                errors.card ? 'border-error-400 focus:ring-error-500/20 focus:border-error-400' : 'border-gray-300 focus:ring-brand-500/20 focus:border-brand-500']"
              :placeholder="t('features.persons.fields.card')"
            />
            <p v-if="errors.card" class="flex items-center gap-1 text-xs text-error-600">
              <AlertCircle class="w-3 h-3 flex-shrink-0" />{{ errors.card }}
            </p>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.fields.address') }} <span class="text-error-500">*</span></label>
            <input
              v-model="address"
              @input="delete errors.address"
              type="text"
              :class="['w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-colors',
                errors.address ? 'border-error-400 focus:ring-error-500/20 focus:border-error-400' : 'border-gray-300 focus:ring-brand-500/20 focus:border-brand-500']"
              :placeholder="t('features.persons.fields.address')"
            />
            <p v-if="errors.address" class="flex items-center gap-1 text-xs text-error-600">
              <AlertCircle class="w-3 h-3 flex-shrink-0" />{{ errors.address }}
            </p>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.fields.phone') }} <span class="text-error-500">*</span></label>
            <input
              v-model="phone"
              @input="delete errors.phone"
              type="text"
              :class="['w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-colors',
                errors.phone ? 'border-error-400 focus:ring-error-500/20 focus:border-error-400' : 'border-gray-300 focus:ring-brand-500/20 focus:border-brand-500']"
              :placeholder="t('features.persons.fields.phone')"
            />
            <p v-if="errors.phone" class="flex items-center gap-1 text-xs text-error-600">
              <AlertCircle class="w-3 h-3 flex-shrink-0" />{{ errors.phone }}
            </p>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.fields.email') }} <span class="text-error-500">*</span></label>
            <input
              v-model="email"
              @input="delete errors.email"
              type="email"
              :class="['w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-colors',
                errors.email ? 'border-error-400 focus:ring-error-500/20 focus:border-error-400' : 'border-gray-300 focus:ring-brand-500/20 focus:border-brand-500']"
              :placeholder="t('features.persons.fields.email')"
            />
            <p v-if="errors.email" class="flex items-center gap-1 text-xs text-error-600">
              <AlertCircle class="w-3 h-3 flex-shrink-0" />{{ errors.email }}
            </p>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.fields.sex') }}</label>
            <AppSelect v-model="sex" :options="sexOptions" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.fields.inDate') }} <span class="text-error-500">*</span></label>
            <AppDatePicker v-model="inDate" placeholder="dd/mm/aaaa" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.fields.birthDate') }}</label>
            <AppDatePicker v-model="birthDate" placeholder="dd/mm/aaaa" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.fields.experience') }} <span class="text-error-500">*</span></label>
            <input v-model.number="experience" type="number" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" placeholder="0" min="0" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.fields.county') }}</label>
            <AppSelect v-model="selectedCounty" :options="countyOptions" searchable />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.fields.race') }}</label>
            <AppSelect v-model="selectedRace" :options="raceOptions" searchable />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.fields.group') }} <span class="text-error-500">*</span></label>
            <AppSelect v-model="selectedGroup" :options="groupOptions" searchable @update:model-value="delete errors.group" />
            <p v-if="errors.group" class="flex items-center gap-1 text-xs text-error-600">
              <AlertCircle class="w-3 h-3 flex-shrink-0" />{{ errors.group }}
            </p>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.fields.nacionality') }}</label>
            <AppSelect v-model="selectedNacionality" :options="nacionalityOptions" searchable />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.fields.religion') }}</label>
            <AppSelect v-model="selectedReligion" :options="religionOptions" searchable />
          </div>
        </div>

        <!-- Tab: Competencias -->
        <div v-show="activeTab === 'competences'" class="space-y-4">
          <div class="flex gap-3 flex-wrap">
            <div class="flex-1 min-w-48 space-y-1">
              <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.tabs.competences') }}</label>
              <AppSelect v-model="selectedCompetence" :options="competenceOptions" searchable />
            </div>
            <div class="flex-1 min-w-48 space-y-1">
              <label class="block text-sm font-medium text-gray-700">{{ t('features.competences.levelLabel') }}</label>
              <AppSelect v-model="selectedLevel" :options="levelOptions" searchable />
            </div>
            <div class="flex items-end">
              <button @click="addCompetence" :disabled="!selectedCompetence || !selectedLevel"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 disabled:opacity-40 transition-colors">
                <Plus class="w-4 h-4" /> {{ t('common.add') }}
              </button>
            </div>
          </div>
          <MiniTable
            :rows="competenceValues"
            :columns="[{ field: 'competenceName', header: t('features.persons.tabs.competences') }, { field: 'levelName', header: t('features.competences.levelLabel') }]"
            v-model:selected="selectedCompetences"
            @remove="removeCompetences"
          />
        </div>

        <!-- Tab: Intereses -->
        <div v-show="activeTab === 'interests'" class="space-y-6">
          <!-- Roles -->
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-3">{{ t('features.persons.interests.rolesSection') }}</h3>
            <div class="flex gap-3 flex-wrap mb-3">
              <div class="flex-1 min-w-48 space-y-1">
                <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.interests.roleLabel') }}</label>
                <AppSelect v-model="selectedRole" :options="roleOptions" searchable />
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.interests.preferenceLabel') }}</label>
                <label class="flex items-center gap-2 h-10 cursor-pointer">
                  <input type="checkbox" v-model="rolePreference" class="w-4 h-4 rounded border-gray-300 text-brand-500" />
                  <span class="text-sm text-gray-600">{{ t('features.persons.belbinOptions.preferred') }}</span>
                </label>
              </div>
              <div class="flex items-end">
                <button @click="addRoleInterest" :disabled="!selectedRole"
                  class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 disabled:opacity-40 transition-colors">
                  <Plus class="w-4 h-4" /> {{ t('common.add') }}
                </button>
              </div>
            </div>
            <MiniTable
              :rows="personalInterests"
              :columns="[{ field: 'roleName', header: t('features.persons.interests.roleLabel') }, { field: 'preference', header: t('features.persons.belbinOptions.preferred'), type: 'boolean' }]"
              v-model:selected="selectedRoleInterests"
              @remove="removeRoleInterests"
            />
          </div>

          <!-- Proyectos -->
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-3">{{ t('features.persons.interests.projectsSection') }}</h3>
            <div class="flex gap-3 flex-wrap mb-3">
              <div class="flex-1 min-w-48 space-y-1">
                <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.interests.projectLabel') }}</label>
                <AppSelect v-model="selectedProject" :options="projectOptions" searchable />
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.interests.preferenceLabel') }}</label>
                <label class="flex items-center gap-2 h-10 cursor-pointer">
                  <input type="checkbox" v-model="projectPreference" class="w-4 h-4 rounded border-gray-300 text-brand-500" />
                  <span class="text-sm text-gray-600">{{ t('features.persons.belbinOptions.preferred') }}</span>
                </label>
              </div>
              <div class="flex items-end">
                <button @click="addProjectInterest" :disabled="!selectedProject"
                  class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 disabled:opacity-40 transition-colors">
                  <Plus class="w-4 h-4" /> {{ t('common.add') }}
                </button>
              </div>
            </div>
            <MiniTable
              :rows="personalProjectInterests"
              :columns="[{ field: 'projectName', header: t('features.persons.interests.projectLabel') }, { field: 'preference', header: t('features.persons.belbinOptions.preferred'), type: 'boolean' }]"
              v-model:selected="selectedProjectInterests"
              @remove="removeProjectInterests"
            />
          </div>
        </div>

        <!-- Tab: Test Psicológico -->
        <div v-show="activeTab === 'test'" class="space-y-6">
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-3">{{ t('features.persons.test.mbtiSection') }}</h3>
            <div class="w-64 space-y-1">
              <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.test.typeLabel') }}</label>
              <AppSelect v-model="mbtiType" :options="mbtiOptions" />
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-3">{{ t('features.persons.test.belbinSection') }}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div v-for="(labelKey, roleKey) in belbinRoleLabels" :key="roleKey" class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">{{ t(labelKey) }}</label>
                <AppSelect v-model="belbinRoles[roleKey]" :options="belbinOptions" />
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Incompatibilidades -->
        <div v-show="activeTab === 'conflicts'" class="space-y-4">
          <div class="flex gap-3 flex-wrap">
            <div class="flex-1 min-w-48 space-y-1">
              <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.conflicts.indexLabel') }}</label>
              <AppSelect v-model="selectedConflictIndex" :options="conflictIndexOptions" searchable />
            </div>
            <div class="flex-1 min-w-48 space-y-1">
              <label class="block text-sm font-medium text-gray-700">{{ t('features.persons.conflicts.personLabel') }}</label>
              <AppSelect v-model="selectedConflictPerson" :options="personOptions" searchable :search-placeholder="t('common.search')" />
            </div>
            <div class="flex items-end">
              <button @click="addConflict" :disabled="!selectedConflictIndex || !selectedConflictPerson"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 disabled:opacity-40 transition-colors">
                <Plus class="w-4 h-4" /> {{ t('common.add') }}
              </button>
            </div>
          </div>
          <MiniTable
            :rows="personConflicts"
            :columns="[{ field: 'conflictName', header: t('features.persons.conflicts.indexLabel') }, { field: 'personConflictName', header: t('features.persons.conflicts.personLabel') }]"
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
          {{ t('common.cancel') }}
        </button>
        <!-- En modo crear: avanza tabs hasta el último, luego guarda -->
        <button
          v-if="!isEditMode && !isLastTab"
          type="button"
          @click="goToNextTab"
          class="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors flex items-center gap-2"
        >
          {{ t('common.next') }}
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
          {{ saving ? t('common.saving') : t('common.save') }}
        </button>
      </div>
    </div>
  </div>
</template>
