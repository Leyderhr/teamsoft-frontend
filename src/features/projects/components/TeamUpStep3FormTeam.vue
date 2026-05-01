<script setup>
import { Users, Cog, Loader2, RefreshCw, Save, Briefcase } from 'lucide-vue-next'

defineProps({
  proposal: { type: Object, default: null },
  generating: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
})

defineEmits(['generate', 'save'])
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h3 class="text-base font-semibold text-gray-800">Generar Propuesta de Equipo</h3>
    </div>
    <div class="p-6">

      <!-- Sin propuesta -->
      <div v-if="!proposal && !generating" class="flex flex-col items-center gap-5 py-12">
        <div class="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center">
          <Users class="w-8 h-8 text-brand-500" />
        </div>
        <p class="text-sm text-gray-500 text-center max-w-md">
          Todo está configurado. Haz clic en <strong>Generar</strong> para que el algoritmo calcule la mejor propuesta de equipos.
        </p>
        <button
          @click="$emit('generate')"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          <Cog class="w-4 h-4" />
          Generar Propuesta
        </button>
      </div>

      <!-- Cargando -->
      <div v-if="generating" class="flex flex-col items-center gap-4 py-12">
        <Loader2 class="w-10 h-10 text-brand-500 animate-spin" />
        <p class="text-sm text-gray-500">Ejecutando algoritmo, por favor espere...</p>
      </div>

      <!-- Resultados -->
      <div v-if="proposal && !generating" class="flex flex-col gap-5">
        <div class="flex items-center gap-3 px-5 py-3 rounded-xl bg-brand-50 border-l-4 border-brand-500">
          <span class="text-sm text-gray-600">Evaluación global:</span>
          <span class="text-sm font-semibold text-brand-700">{{ proposal.formattedEval }}</span>
        </div>
        <div class="flex flex-col gap-3">
          <details
            v-for="(item, pIdx) in (proposal.projectsProposal || [])"
            :key="pIdx"
            class="overflow-hidden rounded-xl border border-gray-200"
            open
          >
            <summary class="flex items-center gap-3 px-5 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors list-none">
              <Briefcase class="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span class="text-sm font-semibold text-gray-800 flex-1">
                {{ item.project?.projectName || 'Proyecto ' + (pIdx + 1) }}
              </span>
              <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-600">
                {{ (item.assignedRoles?.length || 0) }} roles
              </span>
            </summary>
            <div class="p-4 flex flex-col gap-4">
              <div v-for="(roleItem, rIdx) in (item.assignedRoles || [])" :key="rIdx" class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-gray-700">{{ roleItem.role?.roleName }}</span>
                  <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                    {{ (roleItem.persons?.length || 0) }} persona(s)
                  </span>
                </div>
                <div class="overflow-hidden rounded-lg border border-gray-200">
                  <table class="min-w-full">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellidos</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">C.I.</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr v-for="(person, i) in (roleItem.persons || [])" :key="i" class="hover:bg-gray-50">
                        <td class="px-4 py-2.5 text-sm text-gray-700">{{ person.personName }}</td>
                        <td class="px-4 py-2.5 text-sm text-gray-700">{{ person.surName }}</td>
                        <td class="px-4 py-2.5 text-sm text-gray-700">{{ person.card }}</td>
                      </tr>
                      <tr v-if="!roleItem.persons?.length">
                        <td colspan="3" class="px-4 py-4 text-center text-sm text-gray-400">Sin personas asignadas</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </details>
        </div>
        <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            @click="$emit('generate')"
            :disabled="generating"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw class="w-4 h-4" />
            Regenerar
          </button>
          <button
            @click="$emit('save')"
            :disabled="saving"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            Guardar Equipos
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
