<script setup>
import { Loader2 } from 'lucide-vue-next'
import AppMultiSelect from '@/components/ui/AppMultiSelect.vue'
import { useTeamFormationStore } from '@/stores/teamFormation'

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
        <h3 class="text-base font-semibold text-gray-800">Selección de Proyectos y Grupos</h3>
        <p class="text-sm text-gray-400 mt-0.5">Define los proyectos a conformar y el grupo de candidatos</p>
      </div>
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- Proyectos -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">
            Proyectos a formar equipo <span class="text-error-500">*</span>
          </label>
          <div v-if="loadingProjects" class="flex items-center gap-2 text-sm text-gray-400 py-2">
            <Loader2 class="w-4 h-4 animate-spin" /> Cargando proyectos...
          </div>
          <div v-else :class="projectError ? 'ring-2 ring-error-500/30 rounded-lg' : ''">
            <AppMultiSelect
              :model-value="store.step1.selectedProjectIds"
              @update:model-value="store.updateStep1({ selectedProjectIds: $event })"
              :options="availableProjects"
              placeholder="Seleccionar proyectos..."
              :searchable="true"
              searchPlaceholder="Buscar proyecto..."
            />
          </div>
          <p v-if="projectError" class="text-xs text-error-500">Seleccione al menos un proyecto</p>
          <p v-else class="text-xs text-gray-400">{{ store.step1.selectedProjectIds.length }} seleccionado(s)</p>
        </div>

        <!-- Grupos -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">
            Grupos de búsqueda <span class="text-error-500">*</span>
          </label>
          <div v-if="loadingGroups" class="flex items-center gap-2 text-sm text-gray-400 py-2">
            <Loader2 class="w-4 h-4 animate-spin" /> Cargando grupos...
          </div>
          <div v-else :class="groupError ? 'ring-2 ring-error-500/30 rounded-lg' : ''">
            <AppMultiSelect
              :model-value="store.step1.selectedGroupIds"
              @update:model-value="store.updateStep1({ selectedGroupIds: $event })"
              :options="availableGroups"
              placeholder="Seleccionar grupos..."
              :searchable="true"
              searchPlaceholder="Buscar grupo..."
            />
          </div>
          <p v-if="groupError" class="text-xs text-error-500">Seleccione al menos un grupo</p>
          <p v-else class="text-xs text-gray-400">{{ store.step1.selectedGroupIds.length }} seleccionado(s)</p>
        </div>

      </div>
    </div>

    <!-- Configuración de Roles y Restricciones -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-base font-semibold text-gray-800">Configuración de Roles y Restricciones</h3>
        <p class="text-sm text-gray-400 mt-0.5">Define cuántos roles puede ocupar cada persona y restricciones de asignación</p>
      </div>
      <div class="p-6 space-y-4">

        <!-- Fila superior: 2 columnas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- Col izquierda: Cantidad máx de roles -->
          <div class="space-y-2.5">
            <p class="text-sm font-medium text-gray-700">Cantidad de roles por persona</p>

            <div class="flex items-center gap-3 flex-wrap">
              <input type="checkbox" id="confRoleLimited"
                :checked="store.step1.confRole" @change="store.updateStep1({ confRole: true })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <label for="confRoleLimited" class="text-sm text-gray-700 cursor-pointer select-none">
                Cantidad máxima de roles
              </label>
              <template v-if="store.step1.confRole">
                <input
                  type="number" min="1" max="20"
                  :value="store.step1.maximunRoles"
                  @input="store.updateStep1({ maximunRoles: Number($event.target.value) })"
                  class="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
                <span class="text-xs text-gray-400">roles máx.</span>
              </template>
            </div>

            <div class="flex items-center gap-3">
              <input type="checkbox" id="confRoleAll"
                :checked="!store.step1.confRole" @change="store.updateStep1({ confRole: false })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <label for="confRoleAll" class="text-sm text-gray-700 cursor-pointer select-none">
                Los que sean posibles
              </label>
            </div>
          </div>

          <!-- Col derecha: Restricciones de asignación -->
          <div class="space-y-2.5">
            <p class="text-sm font-medium text-gray-700">Restricciones de asignación</p>

            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox"
                :checked="store.step1.onlyOneProject"
                @change="store.updateStep1({ onlyOneProject: $event.target.checked })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm text-gray-700 select-none">Cada persona se asigna a un solo proyecto</span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox"
                :checked="store.step1.confAllGroup"
                @change="store.updateStep1({ confAllGroup: $event.target.checked })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm text-gray-700 select-none">Asignar a todo el personal del grupo seleccionado</span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox"
                :checked="store.step1.bossNeedToBeAssignedToAnotherRoles"
                @change="store.updateStep1({ bossNeedToBeAssignedToAnotherRoles: $event.target.checked })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm text-gray-700 select-none">El líder con más de un rol</span>
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
            Habilitar cantidad mínima de roles
          </label>
          <input
            type="number" min="1" max="20"
            :value="store.step1.minimumRole"
            @input="store.updateStep1({ minimumRole: Number($event.target.value) })"
            class="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            :class="store.step1.minimunRoles ? 'visible' : 'invisible'"
          />
          <span class="text-xs text-gray-400" :class="store.step1.minimunRoles ? 'visible' : 'invisible'">
            roles mín.
          </span>
        </div>

      </div>
    </div>

    <!-- Método de Formación de Equipos -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-base font-semibold text-gray-800">Método de Formación de Equipos</h3>
        <p class="text-sm text-gray-400 mt-0.5">Define el orden y estrategia con que el algoritmo construye los equipos</p>
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
                Asignar primero a todos los jefes de proyecto
              </span>
            </label>
            <div class="px-11 pb-3 pt-2 border-t space-y-2 transition-colors"
              :class="store.step1.assignBossFirst ? 'bg-brand-50/60 border-brand-100' : 'bg-gray-50 border-gray-100'">
              <label class="flex items-center gap-3 cursor-pointer" :class="!store.step1.assignBossFirst && 'opacity-40 pointer-events-none'">
                <input type="radio"
                  :checked="store.step1.formSimultaneous === false" @change="store.updateStep1({ formSimultaneous: false })"
                  :disabled="!store.step1.assignBossFirst"
                  class="w-4 h-4 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm text-gray-700 select-none">Formar equipos de uno en uno</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer" :class="!store.step1.assignBossFirst && 'opacity-40 pointer-events-none'">
                <input type="radio"
                  :checked="store.step1.formSimultaneous === true" @change="store.updateStep1({ formSimultaneous: true })"
                  :disabled="!store.step1.assignBossFirst"
                  class="w-4 h-4 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm text-gray-700 select-none">Formar los equipos de forma simultánea</span>
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
                No asignar primero a los jefes de proyecto
              </span>
            </label>
            <div class="px-11 pb-3 pt-2 border-t space-y-2 transition-colors"
              :class="!store.step1.assignBossFirst ? 'bg-brand-50/60 border-brand-100' : 'bg-gray-50 border-gray-100'">
              <label class="flex items-center gap-3 cursor-pointer" :class="store.step1.assignBossFirst && 'opacity-40 pointer-events-none'">
                <input type="radio"
                  :checked="store.step1.formSimultaneous === false" @change="store.updateStep1({ formSimultaneous: false })"
                  :disabled="store.step1.assignBossFirst"
                  class="w-4 h-4 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm text-gray-700 select-none">Formar los equipos de uno en uno</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer" :class="store.step1.assignBossFirst && 'opacity-40 pointer-events-none'">
                <input type="radio"
                  :checked="store.step1.formSimultaneous === true" @change="store.updateStep1({ formSimultaneous: true })"
                  :disabled="store.step1.assignBossFirst"
                  class="w-4 h-4 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm text-gray-700 select-none">Formar los equipos de forma simultánea</span>
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>
