<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { Check, ArrowLeft, ArrowRight } from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import TeamUpStep1Configure from '@/features/projects/components/TeamUpStep1Configure.vue'
import TeamUpStep2FixMember from '@/features/projects/components/TeamUpStep2FixMember.vue'
import TeamUpStep3FormTeam from '@/features/projects/components/TeamUpStep3FormTeam.vue'
import { useProjects } from '@/services/projects/queries'
import { usePersonGroups } from '@/services/nomenclatives/queries'
import { useTeamFormationStore } from '@/stores/teamFormation'

const toast  = useToast()
const store  = useTeamFormationStore()

// Wizard navigation
const currentStep  = ref(1)
const stepLabels   = ['Configurar', 'Fijar Miembro', 'Formar Equipo']

// Shared queries (still owned by parent; passed as props to Step1)
const { data: projectsData, isLoading: loadingProjects } = useProjects()
const { data: groupsData,   isLoading: loadingGroups   } = usePersonGroups()

const availableProjects = computed(() =>
  projectsData.value?.filter(p => !p.close).map(p => ({ label: p.projectName, value: p.id })) || []
)
const availableGroups = computed(() =>
  groupsData.value?.map(g => ({ label: g.name, value: g.id })) || []
)

// Step 1 validation display (UI state only — not in store)
const showValidation = ref(false)
const step1Valid     = computed(() =>
  store.step1.selectedProjectIds.length > 0 && store.step1.selectedGroupIds.length > 0
)
const projectError = computed(() => showValidation.value && store.step1.selectedProjectIds.length === 0)
const groupError   = computed(() => showValidation.value && store.step1.selectedGroupIds.length === 0)

watch(
  () => [store.step1.selectedProjectIds.length, store.step1.selectedGroupIds.length],
  () => {
    if (step1Valid.value) showValidation.value = false
  }
)

// Navigation
const nextStep = () => {
  if (currentStep.value === 1) {
    showValidation.value = true
    if (!step1Valid.value) {
      toast.add({ severity: 'warn', summary: 'Campos requeridos',
        detail: 'Seleccione al menos un proyecto y un grupo de búsqueda', life: 3000 })
      return
    }
  }
  if (currentStep.value < 3) currentStep.value++
}
const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}
</script>

<template>
  <div class="space-y-6">
    <PageBreadcrumb page-title="Formar Equipo" />

    <!-- Stepper -->
    <div class="flex items-center gap-1 overflow-x-auto pb-1">
      <template v-for="(label, idx) in stepLabels" :key="idx">
        <div
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all"
          :class="currentStep === idx + 1
            ? 'bg-brand-500 text-white font-semibold'
            : currentStep > idx + 1
              ? 'bg-brand-50 text-brand-600 font-medium cursor-pointer'
              : 'bg-gray-100 text-gray-500 border border-gray-200'"
          @click="currentStep > idx + 1 && (currentStep = idx + 1)"
        >
          <span
            class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            :class="currentStep === idx + 1 ? 'bg-white/20' : currentStep > idx + 1 ? 'bg-brand-100 text-brand-600' : 'bg-gray-200 text-gray-500'"
          >
            <Check v-if="currentStep > idx + 1" class="w-3 h-3" />
            <span v-else>{{ idx + 1 }}</span>
          </span>
          {{ label }}
        </div>
        <div v-if="idx < stepLabels.length - 1" class="h-px w-4 bg-gray-200 shrink-0" />
      </template>
    </div>

    <!-- Paso 1 -->
    <TeamUpStep1Configure
      v-show="currentStep === 1"
      :available-projects="availableProjects"
      :available-groups="availableGroups"
      :loading-projects="loadingProjects"
      :loading-groups="loadingGroups"
      :show-validation="showValidation"
      :project-error="projectError"
      :group-error="groupError"
    />

    <!-- Paso 2 -->
    <TeamUpStep2FixMember
      v-show="currentStep === 2"
      :available-projects="availableProjects"
    />

    <!-- Paso 3 -->
    <TeamUpStep3FormTeam
      v-show="currentStep === 3"
      :available-projects="availableProjects"
    />

    <!-- Navegación -->
    <div class="flex justify-end gap-3">
      <button
        v-if="currentStep > 1"
        @click="prevStep"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        Anterior
      </button>
      <button
        v-if="currentStep < 3"
        @click="nextStep"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
      >
        Siguiente
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>

  </div>
</template>
