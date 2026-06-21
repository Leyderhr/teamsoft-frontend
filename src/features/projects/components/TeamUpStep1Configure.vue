<script setup>
import { useI18n } from 'vue-i18n'
import { Loader2 } from 'lucide-vue-next'
import AppMultiSelect from '@/components/ui/AppMultiSelect.vue'
import { useTeamFormationStore } from '@/stores/teamFormation'

const { t } = useI18n()
const store = useTeamFormationStore()

defineProps({
  availableProjects: { type: Array,   default: () => [] },
  availableGroups:   { type: Array,   default: () => [] },
  loadingProjects:   { type: Boolean, default: false },
  loadingGroups:     { type: Boolean, default: false },
  showValidation:    { type: Boolean, default: false },
  projectError:      { type: Boolean, default: false },
  groupError:        { type: Boolean, default: false },
})
</script>

<template>
  <div class="space-y-5">

    <!-- Selección de Proyectos y Grupos -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-base font-semibold text-gray-800">{{ t('features.teamUp.step1.sectionTitle') }}</h3>
        <p class="text-sm text-gray-400 mt-0.5">{{ t('features.teamUp.step1.sectionSubtitle') }}</p>
      </div>
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- Proyectos -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">
            {{ t('features.teamUp.step1.projectsLabel') }} <span class="text-error-500">*</span>
          </label>
          <div v-if="loadingProjects" class="flex items-center gap-2 text-sm text-gray-400 py-2">
            <Loader2 class="w-4 h-4 animate-spin" /> {{ t('features.teamUp.step1.loadingProjects') }}
          </div>
          <div v-else :class="projectError ? 'ring-2 ring-error-500/30 rounded-lg' : ''">
            <AppMultiSelect
              :model-value="store.step1.selectedProjectIds"
              @update:model-value="store.updateStep1({ selectedProjectIds: $event })"
              :options="availableProjects"
              :placeholder="t('features.teamUp.step1.selectProjects')"
              :searchable="true"
              :searchPlaceholder="t('features.teamUp.step1.searchProject')"
            />
          </div>
          <p v-if="projectError" class="text-xs text-error-500">{{ t('features.teamUp.step1.projectRequired') }}</p>
          <p v-else class="text-xs text-gray-400">{{ store.step1.selectedProjectIds.length }} {{ t('features.teamUp.step1.selectedCount') }}</p>
        </div>

        <!-- Grupos -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">
            {{ t('features.teamUp.step1.groupsLabel') }} <span class="text-error-500">*</span>
          </label>
          <div v-if="loadingGroups" class="flex items-center gap-2 text-sm text-gray-400 py-2">
            <Loader2 class="w-4 h-4 animate-spin" /> {{ t('features.teamUp.step1.loadingGroups') }}
          </div>
          <div v-else :class="groupError ? 'ring-2 ring-error-500/30 rounded-lg' : ''">
            <AppMultiSelect
              :model-value="store.step1.selectedGroupIds"
              @update:model-value="store.updateStep1({ selectedGroupIds: $event })"
              :options="availableGroups"
              :placeholder="t('features.teamUp.step1.selectGroups')"
              :searchable="true"
              :searchPlaceholder="t('features.teamUp.step1.searchGroup')"
            />
          </div>
          <p v-if="groupError" class="text-xs text-error-500">{{ t('features.teamUp.step1.groupRequired') }}</p>
          <p v-else class="text-xs text-gray-400">{{ store.step1.selectedGroupIds.length }} {{ t('features.teamUp.step1.selectedCount') }}</p>
        </div>

      </div>
    </div>

    <!-- Configuración de Roles y Restricciones -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-base font-semibold text-gray-800">{{ t('features.teamUp.step1.rolesConfigTitle') }}</h3>
        <p class="text-sm text-gray-400 mt-0.5">{{ t('features.teamUp.step1.rolesConfigSubtitle') }}</p>
      </div>
      <div class="p-6 space-y-4">

        <!-- Fila superior: 2 columnas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- Col izquierda: Cantidad máx de roles -->
          <div class="space-y-2.5">
            <p class="text-sm font-medium text-gray-700">{{ t('features.teamUp.step1.rolesPerPerson') }}</p>

            <div class="flex items-center gap-3 flex-wrap">
              <input type="checkbox" id="confRoleLimited"
                :checked="store.step1.confRole" @change="store.updateStep1({ confRole: true })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <label for="confRoleLimited" class="text-sm text-gray-700 cursor-pointer select-none">
                {{ t('features.teamUp.step1.maxRoles') }}
              </label>
              <template v-if="store.step1.confRole">
                <input
                  type="number" min="1" max="20"
                  :value="store.step1.maximunRoles"
                  @input="store.updateStep1({ maximunRoles: Number($event.target.value) })"
                  class="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
                <span class="text-xs text-gray-400">{{ t('features.teamUp.step1.rolesMaxSuffix') }}</span>
              </template>
            </div>

            <div class="flex items-center gap-3">
              <input type="checkbox" id="confRoleAll"
                :checked="!store.step1.confRole" @change="store.updateStep1({ confRole: false })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <label for="confRoleAll" class="text-sm text-gray-700 cursor-pointer select-none">
                {{ t('features.teamUp.step1.asManyAsPossible') }}
              </label>
            </div>
          </div>

          <!-- Col derecha: Restricciones de asignación -->
          <div class="space-y-2.5">
            <p class="text-sm font-medium text-gray-700">{{ t('features.teamUp.step1.assignmentRestrictions') }}</p>

            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox"
                :checked="store.step1.onlyOneProject"
                @change="store.updateStep1({ onlyOneProject: $event.target.checked })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm text-gray-700 select-none">{{ t('features.teamUp.step1.onlyOneProject') }}</span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox"
                :checked="store.step1.confAllGroup"
                @change="store.updateStep1({ confAllGroup: $event.target.checked })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm text-gray-700 select-none">{{ t('features.teamUp.step1.assignAllGroup') }}</span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox"
                :checked="store.step1.bossNeedToBeAssignedToAnotherRoles"
                @change="store.updateStep1({ bossNeedToBeAssignedToAnotherRoles: $event.target.checked })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm text-gray-700 select-none">{{ t('features.teamUp.step1.bossMultipleRoles') }}</span>
            </label>
          </div>

        </div>

        <div class="h-px bg-gray-100" />

        <!-- Fila inferior: Cantidad mínima de roles -->
        <div class="flex items-center gap-3">
          <input type="checkbox" id="isMinimunRoles"
            :checked="store.step1.minimunRoles"
            @change="store.updateStep1({ minimunRoles: $event.target.checked })"
            class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
          <label for="isMinimunRoles" class="text-sm font-medium text-gray-700 cursor-pointer select-none">
            {{ t('features.teamUp.step1.enableMinRoles') }}
          </label>
          <input
            type="number" min="1" max="20"
            :value="store.step1.minimumRole"
            @input="store.updateStep1({ minimumRole: Number($event.target.value) })"
            class="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            :class="store.step1.minimunRoles ? 'visible' : 'invisible'"
          />
          <span class="text-xs text-gray-400" :class="store.step1.minimunRoles ? 'visible' : 'invisible'">
            {{ t('features.teamUp.step1.rolesMinSuffix') }}
          </span>
        </div>

      </div>
    </div>

    <!-- Método de Formación de Equipos -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-base font-semibold text-gray-800">{{ t('features.teamUp.step1.methodTitle') }}</h3>
        <p class="text-sm text-gray-400 mt-0.5">{{ t('features.teamUp.step1.methodSubtitle') }}</p>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- Asignar primero a los jefes -->
          <div class="rounded-xl border-2 transition-colors overflow-hidden"
            :class="store.step1.assignBossFirst ? 'border-brand-400' : 'border-gray-200 hover:border-gray-300'">
            <label class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
              :class="store.step1.assignBossFirst ? 'bg-brand-50' : 'bg-white hover:bg-gray-50'">
              <input type="radio"
                :checked="store.step1.assignBossFirst === true" @change="store.updateStep1({ assignBossFirst: true })"
                class="w-4 h-4 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm font-medium text-gray-800 select-none">
                {{ t('features.teamUp.step1.assignBossFirst') }}
              </span>
            </label>
            <div class="px-11 pb-3 pt-2 border-t space-y-2 transition-colors"
              :class="store.step1.assignBossFirst ? 'bg-brand-50/60 border-brand-100' : 'bg-gray-50 border-gray-100'">
              <label class="flex items-center gap-3 cursor-pointer" :class="!store.step1.assignBossFirst && 'opacity-40 pointer-events-none'">
                <input type="radio"
                  :checked="store.step1.formSimultaneous === false" @change="store.updateStep1({ formSimultaneous: false })"
                  :disabled="!store.step1.assignBossFirst"
                  class="w-4 h-4 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm text-gray-700 select-none">{{ t('features.teamUp.step1.formOneByOne') }}</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer" :class="!store.step1.assignBossFirst && 'opacity-40 pointer-events-none'">
                <input type="radio"
                  :checked="store.step1.formSimultaneous === true" @change="store.updateStep1({ formSimultaneous: true })"
                  :disabled="!store.step1.assignBossFirst"
                  class="w-4 h-4 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm text-gray-700 select-none">{{ t('features.teamUp.step1.formSimultaneous') }}</span>
              </label>
            </div>
          </div>

          <!-- No asignar primero a los jefes -->
          <div class="rounded-xl border-2 transition-colors overflow-hidden"
            :class="!store.step1.assignBossFirst ? 'border-brand-400' : 'border-gray-200 hover:border-gray-300'">
            <label class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
              :class="!store.step1.assignBossFirst ? 'bg-brand-50' : 'bg-white hover:bg-gray-50'">
              <input type="radio"
                :checked="store.step1.assignBossFirst === false" @change="store.updateStep1({ assignBossFirst: false })"
                class="w-4 h-4 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm font-medium text-gray-800 select-none">
                {{ t('features.teamUp.step1.dontAssignBossFirst') }}
              </span>
            </label>
            <div class="px-11 pb-3 pt-2 border-t space-y-2 transition-colors"
              :class="!store.step1.assignBossFirst ? 'bg-brand-50/60 border-brand-100' : 'bg-gray-50 border-gray-100'">
              <label class="flex items-center gap-3 cursor-pointer" :class="store.step1.assignBossFirst && 'opacity-40 pointer-events-none'">
                <input type="radio"
                  :checked="store.step1.formSimultaneous === false" @change="store.updateStep1({ formSimultaneous: false })"
                  :disabled="store.step1.assignBossFirst"
                  class="w-4 h-4 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm text-gray-700 select-none">{{ t('features.teamUp.step1.formOneByOne') }}</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer" :class="store.step1.assignBossFirst && 'opacity-40 pointer-events-none'">
                <input type="radio"
                  :checked="store.step1.formSimultaneous === true" @change="store.updateStep1({ formSimultaneous: true })"
                  :disabled="store.step1.assignBossFirst"
                  class="w-4 h-4 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm text-gray-700 select-none">{{ t('features.teamUp.step1.formSimultaneous') }}</span>
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>
