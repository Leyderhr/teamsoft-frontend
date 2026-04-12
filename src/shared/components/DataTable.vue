<template>
  <div>
    <!-- Table Card -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-xs">

      <!-- Toolbar -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200 gap-3 flex-wrap">
        <!-- Action Buttons -->
        <div v-if="showActions" class="flex items-center gap-2 flex-wrap">
          <button
            @click="$emit('create')"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
          >
            <Plus class="w-4 h-4" />
            Crear
          </button>
          <button
            @click="handleEdit"
            :disabled="!selectedRow"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium transition-colors"
            :class="selectedRow
              ? 'text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              : 'text-gray-300 cursor-not-allowed bg-gray-50'"
          >
            <Pencil class="w-4 h-4" />
            Editar
          </button>
          <button
            @click="handleDeleteRequest"
            :disabled="!selectedRow"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium transition-colors"
            :class="selectedRow
              ? 'text-error-600 hover:bg-error-50 hover:border-error-200'
              : 'text-gray-300 cursor-not-allowed bg-gray-50'"
          >
            <Trash2 class="w-4 h-4" />
            Eliminar
          </button>
          <button
            v-if="showImportButton"
            @click="$emit('import')"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Upload class="w-4 h-4" />
            Importar
          </button>
        </div>
        <!-- Spacer when no actions shown -->
        <div v-else></div>

        <!-- Search -->
        <div v-if="searchable" class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            v-model="searchQuery"
            @input="currentPage = 1"
            type="text"
            placeholder="Buscar..."
            class="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors w-56"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="max-w-full overflow-x-auto custom-scrollbar">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50">
              <!-- Selection column -->
              <th class="w-12 px-4 py-3"></th>
              <th
                v-for="col in columns"
                :key="col.field"
                class="px-5 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap select-none"
                style="font-size: 11px;"
                :class="col.sortable !== false ? 'cursor-pointer hover:text-gray-700' : ''"
                @click="col.sortable !== false && toggleSort(col.field)"
              >
                <div class="flex items-center gap-1">
                  {{ col.header }}
                  <ChevronUp
                    v-if="sortField === col.field && sortOrder === 1"
                    class="w-3.5 h-3.5 text-brand-500"
                  />
                  <ChevronDown
                    v-else-if="sortField === col.field && sortOrder === -1"
                    class="w-3.5 h-3.5 text-brand-500"
                  />
                  <ChevronsUpDown
                    v-else-if="col.sortable !== false"
                    class="w-3.5 h-3.5 text-gray-300"
                  />
                </div>
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <!-- Loading skeleton -->
            <template v-if="loading">
              <tr v-for="n in 5" :key="'skeleton-' + n">
                <td class="px-4 py-3 w-12">
                  <div class="animate-pulse w-4 h-4 bg-gray-200 rounded-full"></div>
                </td>
                <td
                  v-for="col in columns"
                  :key="col.field"
                  class="px-5 py-3"
                >
                  <div class="animate-pulse h-4 bg-gray-200 rounded" :style="{ width: Math.random() * 40 + 40 + '%' }"></div>
                </td>
              </tr>
            </template>

            <!-- Empty state -->
            <tr v-else-if="!paginatedItems.length">
              <td :colspan="columns.length + 1" class="px-5 py-14 text-center">
                <div class="flex flex-col items-center gap-2">
                  <Inbox class="w-12 h-12 text-gray-200" />
                  <p class="text-sm text-gray-400 font-medium">Sin resultados</p>
                  <p v-if="searchQuery" class="text-xs text-gray-400">
                    Intenta con otros términos de búsqueda
                  </p>
                </div>
              </td>
            </tr>

            <!-- Data rows -->
            <template v-else>
              <tr
                v-for="(item, idx) in paginatedItems"
                :key="idx"
                @click="selectRow(item)"
                class="cursor-pointer transition-colors"
                :class="selectedRow === item ? 'bg-brand-50' : 'hover:bg-gray-50'"
              >
                <!-- Radio selector -->
                <td class="w-12 px-4 py-3">
                  <div
                    class="w-4 h-4 rounded-full border-2 transition-colors flex-shrink-0"
                    :class="selectedRow === item
                      ? 'border-brand-500 bg-brand-500'
                      : 'border-gray-300'"
                  ></div>
                </td>

                <td
                  v-for="col in columns"
                  :key="col.field"
                  class="px-5 py-3 whitespace-nowrap"
                  style="font-size: 14px; color: #344054;"
                >
                  <!-- Boolean type -->
                  <template v-if="col.type === 'boolean'">
                    <CheckCircle2
                      v-if="getNestedValue(item, col.field)"
                      class="w-4 h-4 text-success-500"
                    />
                    <XCircle
                      v-else
                      class="w-4 h-4 text-gray-300"
                    />
                  </template>

                  <!-- Badge type -->
                  <span
                    v-else-if="col.type === 'badge'"
                    class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="getBadgeClass(getNestedValue(item, col.field))"
                  >
                    {{ getNestedValue(item, col.field) }}
                  </span>

                  <!-- Default text -->
                  <span v-else>{{ getNestedValue(item, col.field) ?? '—' }}</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="!loading && totalRecordsFiltered > 0"
        class="flex items-center justify-between px-5 py-4 border-t border-gray-200 flex-wrap gap-3"
      >
        <!-- Info -->
        <p class="text-sm text-gray-500">
          Mostrando
          <span class="font-medium text-gray-700">{{ paginationStart }}–{{ paginationEnd }}</span>
          de
          <span class="font-medium text-gray-700">{{ totalRecordsFiltered }}</span>
          registros
        </p>

        <!-- Controls -->
        <div class="flex items-center gap-3">
          <!-- Rows per page -->
          <select
            v-model="rowsPerPage"
            @change="currentPage = 1"
            class="rounded-lg border border-gray-200 text-sm py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-gray-700"
          >
            <option v-for="n in rowsPerPageOptions" :key="n" :value="n">{{ n }} / pág</option>
          </select>

          <!-- Page buttons -->
          <div class="flex items-center gap-1">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="pag-btn hover:bg-gray-50"
              :class="currentPage === 1 ? 'opacity-40 cursor-not-allowed' : ''"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>

            <template v-for="p in visiblePages" :key="p">
              <span v-if="p === '...'" class="px-1.5 text-gray-400 text-sm select-none">…</span>
              <button
                v-else
                @click="currentPage = p"
                class="pag-btn"
                :class="p === currentPage
                  ? 'bg-brand-500 text-white border-brand-500 hover:bg-brand-600'
                  : 'hover:bg-gray-50'"
              >
                {{ p }}
              </button>
            </template>

            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages || totalPages === 0"
              class="pag-btn hover:bg-gray-50"
              :class="currentPage === totalPages || totalPages === 0 ? 'opacity-40 cursor-not-allowed' : ''"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Dialog -->
    <div
      v-if="confirmVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="confirmVisible = false"
    >
      <div class="bg-white rounded-2xl shadow-theme-xl p-6 max-w-sm w-full mx-4">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-error-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle class="w-5 h-5 text-error-600" />
          </div>
          <h3 class="text-base font-semibold text-gray-800">Confirmar eliminación</h3>
        </div>
        <p class="text-sm text-gray-500 mb-6">
          ¿Está seguro de eliminar este registro? Esta acción no se puede deshacer.
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="confirmVisible = false"
            class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 rounded-lg bg-error-600 text-white text-sm font-medium hover:bg-error-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Plus, Pencil, Trash2, Upload, Search,
  ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Inbox, AlertTriangle,
} from 'lucide-vue-next'

const props = defineProps({
  columns: { type: Array, required: true },
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  searchable: { type: Boolean, default: true },
  showActions: { type: Boolean, default: true },
  showImportButton: { type: Boolean, default: false },
  rowsPerPageOptions: { type: Array, default: () => [10, 20, 30, 50] },
  defaultRows: { type: Number, default: 10 },
})

const emit = defineEmits(['create', 'edit', 'delete', 'import', 'row-select'])

// State
const searchQuery = ref('')
const currentPage = ref(1)
const rowsPerPage = ref(props.defaultRows)
const selectedRow = ref(null)
const sortField = ref(null)
const sortOrder = ref(1)
const confirmVisible = ref(false)

// Reset page when items change
watch(() => props.items, () => { currentPage.value = 1 })

// Helpers
function getNestedValue(obj, field) {
  if (!field) return undefined
  return field.split('.').reduce((o, k) => o?.[k], obj)
}

function getBadgeClass(value) {
  if (!value) return 'bg-gray-100 text-gray-600'
  const v = String(value).toLowerCase()
  if (['active', 'activo', 'activa', 'abierto', 'open'].includes(v))
    return 'bg-success-50 text-success-700'
  if (['pending', 'pendiente'].includes(v))
    return 'bg-warning-50 text-warning-700'
  if (['closed', 'cerrado', 'inactive', 'inactivo', 'cancelado', 'cancelled'].includes(v))
    return 'bg-error-50 text-error-700'
  return 'bg-gray-100 text-gray-700'
}

// Sorting
function toggleSort(field) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 1 ? -1 : 1
  } else {
    sortField.value = field
    sortOrder.value = 1
  }
  currentPage.value = 1
}

// Computed filtered + sorted + paginated
const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return props.items
  const q = searchQuery.value.toLowerCase().trim()
  return props.items.filter(item =>
    props.columns.some(col => {
      const val = getNestedValue(item, col.field)
      return val != null && String(val).toLowerCase().includes(q)
    })
  )
})

const sortedItems = computed(() => {
  if (!sortField.value) return filteredItems.value
  return [...filteredItems.value].sort((a, b) => {
    const va = getNestedValue(a, sortField.value) ?? ''
    const vb = getNestedValue(b, sortField.value) ?? ''
    const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true, sensitivity: 'base' })
    return cmp * sortOrder.value
  })
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  return sortedItems.value.slice(start, start + rowsPerPage.value)
})

const totalRecordsFiltered = computed(() => filteredItems.value.length)
const totalPages = computed(() => Math.ceil(totalRecordsFiltered.value / rowsPerPage.value) || 1)

const paginationStart = computed(() =>
  totalRecordsFiltered.value === 0 ? 0 : (currentPage.value - 1) * rowsPerPage.value + 1
)
const paginationEnd = computed(() =>
  Math.min(currentPage.value * rowsPerPage.value, totalRecordsFiltered.value)
)

const visiblePages = computed(() => {
  const pages = []
  const tp = totalPages.value
  const cp = currentPage.value

  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cp > 3) pages.push('...')
    const start = Math.max(2, cp - 1)
    const end = Math.min(tp - 1, cp + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (cp < tp - 2) pages.push('...')
    pages.push(tp)
  }
  return pages
})

// Actions
function selectRow(item) {
  selectedRow.value = selectedRow.value === item ? null : item
  emit('row-select', selectedRow.value)
}

function handleEdit() {
  if (!selectedRow.value) return
  emit('edit', selectedRow.value)
}

function handleDeleteRequest() {
  if (!selectedRow.value) return
  confirmVisible.value = true
}

function confirmDelete() {
  confirmVisible.value = false
  emit('delete', selectedRow.value)
  selectedRow.value = null
}
</script>
