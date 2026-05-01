<script setup>
import { Loader2 } from 'lucide-vue-next'
import AppMultiSelect from '@/components/ui/AppMultiSelect.vue'

defineProps({
  config: { type: Object, required: true },
  availableProjects: { type: Array, default: () => [] },
  availableGroups: { type: Array, default: () => [] },
  loadingProjects: { type: Boolean, default: false },
  loadingGroups: { type: Boolean, default: false },
  showValidation: { type: Boolean, default: false },
  projectError: { type: Boolean, default: false },
  groupError: { type: Boolean, default: false },
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
              :model-value="config.selectedProjectIds"
              @update:model-value="config.selectedProjectIds = $event"
              :options="availableProjects"
              placeholder="Seleccionar proyectos..."
              :searchable="true"
              searchPlaceholder="Buscar proyecto..."
            />
          </div>
          <p v-if="projectError" class="text-xs text-error-500">Seleccione al menos un proyecto</p>
          <p v-else class="text-xs text-gray-400">{{ config.selectedProjectIds.length }} seleccionado(s)</p>
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
              :model-value="config.selectedGroupIds"
              @update:model-value="config.selectedGroupIds = $event"
              :options="availableGroups"
              placeholder="Seleccionar grupos..."
              :searchable="true"
              searchPlaceholder="Buscar grupo..."
            />
          </div>
          <p v-if="groupError" class="text-xs text-error-500">Seleccione al menos un grupo</p>
          <p v-else class="text-xs text-gray-400">{{ config.selectedGroupIds.length }} seleccionado(s)</p>
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
                :checked="config.confRole" @change="config.confRole = true"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <label for="confRoleLimited" class="text-sm text-gray-700 cursor-pointer select-none">
                Cantidad máxima de roles
              </label>
              <template v-if="config.confRole">
                <input
                  type="number" min="1" max="20"
                  :value="config.maximumRoles"
                  @input="config.maximumRoles = Number($event.target.value)"
                  class="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
                <span class="text-xs text-gray-400">roles máx.</span>
              </template>
            </div>

            <div class="flex items-center gap-3">
              <input type="checkbox" id="confRoleAll"
                :checked="!config.confRole" @change="config.confRole = false"
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
                :checked="config.onlyOneProject"
                @change="config.onlyOneProject = $event.target.checked"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm text-gray-700 select-none">Cada persona se asigna a un solo proyecto</span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox"
                :checked="config.confAllGroup"
                @change="config.confAllGroup = $event.target.checked"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm text-gray-700 select-none">Asignar a todo el personal del grupo seleccionado</span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox"
                :checked="config.bossNeedToBeAssignedToAnotherRoles"
                @change="config.bossNeedToBeAssignedToAnotherRoles = $event.target.checked"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm text-gray-700 select-none">El líder con más de un rol</span>
            </label>
          </div>

        </div>

        <div class="h-px bg-gray-100" />

        <!-- Fila inferior: Cantidad mínima de roles -->
        <div class="flex items-center gap-3">
          <input type="checkbox" id="isMinimunRoles"
            :checked="config.isMinimunRoles"
            @change="config.isMinimunRoles = $event.target.checked"
            class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
          <label for="isMinimunRoles" class="text-sm font-medium text-gray-700 cursor-pointer select-none">
            Habilitar cantidad mínima de roles
          </label>
          <input
            type="number" min="1" max="20"
            :value="config.minimumRole"
            @input="config.minimumRole = Number($event.target.value)"
            class="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            :class="config.isMinimunRoles ? 'visible' : 'invisible'"
          />
          <span class="text-xs text-gray-400" :class="config.isMinimunRoles ? 'visible' : 'invisible'">
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
            :class="config.assignBossFirst ? 'border-brand-400' : 'border-gray-200 hover:border-gray-300'">
            <label class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
              :class="config.assignBossFirst ? 'bg-brand-50' : 'bg-white hover:bg-gray-50'">
              <input type="radio"
                :checked="config.assignBossFirst === true" @change="config.assignBossFirst = true"
                class="w-4 h-4 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm font-medium text-gray-800 select-none">
                Asignar primero a todos los jefes de proyecto
              </span>
            </label>
            <div class="px-11 pb-3 pt-2 border-t space-y-2 transition-colors"
              :class="config.assignBossFirst ? 'bg-brand-50/60 border-brand-100' : 'bg-gray-50 border-gray-100'">
              <label class="flex items-center gap-3 cursor-pointer" :class="!config.assignBossFirst && 'opacity-40 pointer-events-none'">
                <input type="radio"
                  :checked="config.formSimultaneous === false" @change="config.formSimultaneous = false"
                  :disabled="!config.assignBossFirst"
                  class="w-4 h-4 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm text-gray-700 select-none">Formar equipos de uno en uno</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer" :class="!config.assignBossFirst && 'opacity-40 pointer-events-none'">
                <input type="radio"
                  :checked="config.formSimultaneous === true" @change="config.formSimultaneous = true"
                  :disabled="!config.assignBossFirst"
                  class="w-4 h-4 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm text-gray-700 select-none">Formar los equipos de forma simultánea</span>
              </label>
            </div>
          </div>

          <!-- No asignar primero a los jefes -->
          <div class="rounded-xl border-2 transition-colors overflow-hidden"
            :class="!config.assignBossFirst ? 'border-brand-400' : 'border-gray-200 hover:border-gray-300'">
            <label class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
              :class="!config.assignBossFirst ? 'bg-brand-50' : 'bg-white hover:bg-gray-50'">
              <input type="radio"
                :checked="config.assignBossFirst === false" @change="config.assignBossFirst = false"
                class="w-4 h-4 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm font-medium text-gray-800 select-none">
                No asignar primero a los jefes de proyecto
              </span>
            </label>
            <div class="px-11 pb-3 pt-2 border-t space-y-2 transition-colors"
              :class="!config.assignBossFirst ? 'bg-brand-50/60 border-brand-100' : 'bg-gray-50 border-gray-100'">
              <label class="flex items-center gap-3 cursor-pointer" :class="config.assignBossFirst && 'opacity-40 pointer-events-none'">
                <input type="radio"
                  :checked="config.formSimultaneous === false" @change="config.formSimultaneous = false"
                  :disabled="config.assignBossFirst"
                  class="w-4 h-4 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm text-gray-700 select-none">Formar los equipos de uno en uno</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer" :class="config.assignBossFirst && 'opacity-40 pointer-events-none'">
                <input type="radio"
                  :checked="config.formSimultaneous === true" @change="config.formSimultaneous = true"
                  :disabled="config.assignBossFirst"
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
