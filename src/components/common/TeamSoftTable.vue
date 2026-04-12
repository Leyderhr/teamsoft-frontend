<template>
  <div
    class="overflow-hidden rounded-xl border"
    style="background: var(--ts-bg-surface); border-color: var(--ts-border);"
  >
    <!-- Table Container -->
    <div class="max-w-full overflow-x-auto">
      <table class="min-w-full">
        <!-- Table Header -->
        <thead>
          <tr class="border-b" style="border-color: var(--ts-border);">
            <th
              v-for="column in columns"
              :key="column.field"
              class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider"
              :class="column.class"
              style="color: var(--ts-text-secondary);"
            >
              {{ column.header }}
            </th>
          </tr>
        </thead>
        <!-- Table Body -->
        <tbody class="divide-y" style="divide-color: var(--ts-border);">
          <tr
            v-for="(row, index) in paginatedData"
            :key="index"
            class="transition-colors hover:bg-gray-50"
            :class="{ 'bg-gray-50': index % 2 === 1 }"
            @click="$emit('row-click', row)"
            style="cursor: pointer;"
          >
            <td
              v-for="column in columns"
              :key="column.field"
              class="px-5 py-4 text-sm"
              :class="column.class"
              style="color: var(--ts-text-primary);"
            >
              <slot :name="column.field" :row="row" :value="row[column.field]">
                {{ row[column.field] }}
              </slot>
            </td>
          </tr>
          <tr v-if="paginatedData.length === 0">
            <td :colspan="columns.length" class="px-5 py-8 text-center" style="color: var(--ts-text-muted);">
              {{ emptyText }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="showPagination && totalPages > 1"
      class="flex items-center justify-between px-5 py-4 border-t"
      style="border-color: var(--ts-border);"
    >
      <div class="text-sm" style="color: var(--ts-text-secondary);">
        Mostrando {{ startItem }} - {{ endItem }} de {{ totalItems }} resultados
      </div>
      <div class="flex items-center gap-2">
        <!-- Previous -->
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors"
          :class="currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'"
          style="border-color: var(--ts-border); color: var(--ts-text-secondary);"
        >
          Anterior
        </button>
        
        <!-- Page Numbers -->
        <div class="flex items-center gap-1">
          <template v-for="page in visiblePages" :key="page">
            <button
              v-if="page !== '...'"
              @click="goToPage(page)"
              class="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
              :class="currentPage === page ? 'text-white' : 'hover:bg-gray-100'"
              :style="currentPage === page ? { background: 'var(--ts-primary)', color: 'white' } : { color: 'var(--ts-text-secondary)' }"
            >
              {{ page }}
            </button>
            <span v-else class="px-1" style="color: var(--ts-text-muted);">...</span>
          </template>
        </div>

        <!-- Next -->
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors"
          :class="currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'"
          style="border-color: var(--ts-border); color: var(--ts-text-secondary);"
        >
          Siguiente
        </button>
      </div>
    </div>

    <!-- Simple Pagination (per page) -->
    <div
      v-if="showPagination && totalPages > 1"
      class="flex items-center justify-between px-5 py-3 border-t"
      style="border-color: var(--ts-border);"
    >
      <div class="flex items-center gap-2">
        <span class="text-sm" style="color: var(--ts-text-secondary);">Ver</span>
        <select
          v-model="itemsPerPage"
          class="px-2 py-1 rounded-lg border text-sm"
          style="border-color: var(--ts-border); color: var(--ts-text-primary);"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
        <span class="text-sm" style="color: var(--ts-text-secondary);">por página</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, default: () => [] },
  emptyText: { type: String, default: 'No hay datos disponibles' },
  showPagination: { type: Boolean, default: true },
  defaultItemsPerPage: { type: Number, default: 10 }
})

defineEmits(['row-click'])

const currentPage = ref(1)
const itemsPerPage = ref(props.defaultItemsPerPage)

watch(() => props.defaultItemsPerPage, (val) => {
  itemsPerPage.value = val
})

const totalItems = computed(() => props.data.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
const startItem = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1)
const endItem = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalItems.value))

const paginatedData = computed(() => {
  if (!props.showPagination) return props.data
  const start = (currentPage.value - 1) * itemsPerPage.value
  return props.data.slice(start, start + itemsPerPage.value)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total)
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  
  return pages
})

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const goToPage = (page) => {
  if (page !== '...') currentPage.value = page
}

watch(() => props.data, () => {
  currentPage.value = 1
})
</script>