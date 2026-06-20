<template>
  <div v-if="!rows.length" class="text-sm text-gray-400 p-4 text-center bg-gray-50 rounded-lg">
    Sin registros
  </div>
  <div v-else class="overflow-hidden rounded-lg border border-gray-200">
    <div class="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
      <span class="text-xs font-medium text-gray-500">{{ rows.length }} registro(s)</span>
      <button 
        v-if="selected.length" 
        type="button"
        @click="$emit('remove')"
        class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-error-600 hover:bg-error-50 transition-colors"
      >
        {{ selected.length > 1 ? 'Eliminar seleccionados' : 'Eliminar seleccionado' }}
      </button>
    </div>
    <table class="min-w-full">
      <thead>
        <tr class="border-b border-gray-200">
          <th class="w-8 px-3 py-2"></th>
          <th v-for="col in columns" :key="col.field" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {{ col.header }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr 
          v-for="(row, i) in rows" 
          :key="i"
          class="hover:bg-gray-50 cursor-pointer transition-colors"
          :class="selected.includes(row) ? 'bg-brand-50' : ''"
          @click="onRowClick(row)"
        >
          <td class="w-8 px-3 py-2" @click.stop="toggleRow(row)">
            <div
              class="w-4 h-4 mx-auto rounded-full border-2 transition-colors flex-shrink-0 cursor-pointer"
              :class="selected.includes(row)
                ? 'border-brand-500 bg-brand-500'
                : 'border-gray-300'"
            ></div>
          </td>
          <td v-for="col in columns" :key="col.field" class="px-3 py-2 text-sm text-gray-700">
            <template v-if="col.type === 'boolean'">
              <CheckCircle2 v-if="row[col.field]" class="w-4 h-4 text-success-500" />
              <XCircle v-else class="w-4 h-4 text-gray-300" />
            </template>
            <template v-else>
              {{ row[col.field] ?? '—' }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { CheckCircle2, XCircle } from 'lucide-vue-next'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  columns: { type: Array, required: true },
  selected: { type: Array, default: () => [] },
  selectionMode: { type: String, default: 'multiple' }
})

const emit = defineEmits(['update:selected', 'remove', 'row-click'])

function toggleRow(row) {
  if (props.selectionMode === 'single') {
    // Modo Simple
    if (props.selected.includes(row)) {
      emit('update:selected', [])
    } else {
      emit('update:selected', [row])
    }
  } else {
    // Modo Múltiple
    const idx = props.selected.indexOf(row)
    const next = [...props.selected]
    if (idx >= 0) next.splice(idx, 1)
    else next.push(row)
    emit('update:selected', next)
  }
}

function onRowClick(row) {
  toggleRow(row)
  emit('row-click', row) 
}
</script>