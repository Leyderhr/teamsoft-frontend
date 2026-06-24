<script setup>
import { ref, computed, nextTick, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDown, Check, Search, Plus } from 'lucide-vue-next'
import { ChevronDown, Check, Search, X } from 'lucide-vue-next'


const { t } = useI18n()

const props = defineProps({
  modelValue: { default: null },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'common.selectPlaceholder' },
  disabled: { type: Boolean, default: false },
  size: { type: String, default: 'md' }, // 'md' | 'sm'
  searchable: { type: Boolean, default: false },
  searchPlaceholder: { type: String, default: 'common.searchPlaceholder' },
  // Permite crear un valor nuevo escribiéndolo en el buscador (combobox taggable).
  allowCreate: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const triggerRef = ref(null)
const panelRef = ref(null)
const searchRef = ref(null)
const panelStyle = ref({})
const focusedIndex = ref(-1)
const searchQuery = ref('')

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value.trim()) return props.options
  const q = searchQuery.value.trim().toLowerCase()
  return props.options.filter(o => o.label.toLowerCase().includes(q))
})

const selectedLabel = computed(() => {
  const v = props.modelValue
  if (v === '' || v === null || v === undefined) return null
  const found = props.options.find(o => o.value === v)?.label
  if (found != null) return found
  // Con allowCreate, el valor puede ser uno nuevo que no está en las opciones:
  // mostramos el propio valor para no perder lo que el usuario escribió.
  return props.allowCreate ? String(v) : null
})

// Hay un valor escrito que no coincide exactamente con ninguna opción -> se puede crear.
const canCreate = computed(() => {
  if (!props.allowCreate) return false
  const q = searchQuery.value.trim()
  if (!q) return false
  return !props.options.some(o => o.label.toLowerCase() === q.toLowerCase())
})

function createFromQuery() {
  const q = searchQuery.value.trim()
  if (q) select(q)
}

async function open() {
  if (props.disabled) return
  const rect = triggerRef.value.getBoundingClientRect()
  const PANEL_MAX_HEIGHT = 260
  const spaceBelow = window.innerHeight - rect.bottom - 8
  const spaceAbove = rect.top - 8

  if (spaceBelow >= Math.min(PANEL_MAX_HEIGHT, 120) || spaceBelow >= spaceAbove) {
    panelStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: '9999',
      maxHeight: `${Math.min(PANEL_MAX_HEIGHT, spaceBelow)}px`,
    }
  } else {
    panelStyle.value = {
      position: 'fixed',
      bottom: `${window.innerHeight - rect.top + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: '9999',
      maxHeight: `${Math.min(PANEL_MAX_HEIGHT, spaceAbove)}px`,
    }
  }
  focusedIndex.value = props.options.findIndex(o => o.value === props.modelValue)
  isOpen.value = true
  document.addEventListener('mousedown', handleOutside)
  document.addEventListener('scroll', handleScroll, { passive: true, capture: true })

  if (props.searchable) {
    await nextTick()
    searchRef.value?.focus()
  }
}

function close() {
  if (!isOpen.value) return
  isOpen.value = false
  focusedIndex.value = -1
  searchQuery.value = ''
  document.removeEventListener('mousedown', handleOutside)
  document.removeEventListener('scroll', handleScroll, { capture: true })
}

function toggle() {
  isOpen.value ? close() : open()
}

function handleOutside(e) {
  if (triggerRef.value?.contains(e.target)) return
  if (panelRef.value?.contains(e.target)) return
  close()
}

function handleScroll(e) {
  if (panelRef.value?.contains(e.target)) return
  close()
}

function select(value) {
  emit('update:modelValue', value)
  close()
}

// Keyboard nav on the trigger button (when not searchable)
function onKeydown(e) {
  if (!isOpen.value) {
    if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
      e.preventDefault()
      open()
    }
    return
  }
  switch (e.key) {
    case 'Escape':
      close()
      break
    case 'ArrowDown':
      e.preventDefault()
      focusedIndex.value = Math.min(focusedIndex.value + 1, filteredOptions.value.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      focusedIndex.value = Math.max(focusedIndex.value - 1, 0)
      break
    case 'Enter':
      e.preventDefault()
      if (focusedIndex.value >= 0) select(filteredOptions.value[focusedIndex.value].value)
      break
  }
}

// Keyboard nav on the search input
function onSearchKeydown(e) {
  switch (e.key) {
    case 'Escape':
      close()
      break
    case 'ArrowDown':
      e.preventDefault()
      focusedIndex.value = Math.min(focusedIndex.value + 1, filteredOptions.value.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      focusedIndex.value = Math.max(focusedIndex.value - 1, 0)
      break
    case 'Enter':
      e.preventDefault()
      if (focusedIndex.value >= 0 && filteredOptions.value[focusedIndex.value]) {
        select(filteredOptions.value[focusedIndex.value].value)
      } else if (canCreate.value) {
        createFromQuery()
      }
      break
  }
}

function clearSelection() {
  emit('update:modelValue', null)
}

onUnmounted(close)
</script>

<template>
  <div class="relative w-full">
    <!-- Trigger -->
    <button
      ref="triggerRef"
      type="button"
      :disabled="disabled"
      @click="toggle"
      @keydown="onKeydown"
      class="w-full flex items-center bg-white text-left rounded-lg border transition-colors"
      :class="[
        size === 'sm' ? 'px-2 py-1.5 text-sm gap-1' : 'px-3 py-2 text-sm gap-2',
        disabled
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
          : isOpen
            ? 'border-brand-500 outline-none ring-2 ring-brand-500/20'
            : 'border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
      ]"
    >
      <span
        class="truncate flex-1"
        :class="selectedLabel ? 'text-gray-700' : 'text-gray-400'"
      >
        {{ selectedLabel ?? t(placeholder) }}
      </span>

      <X
          v-if="clearable && modelValue !== null && modelValue !== '' && modelValue !== undefined && !disabled"
          class="shrink-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          :class="size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'"
          @click.stop="clearSelection"
      />

      <ChevronDown
        class="shrink-0 text-gray-400 transition-transform duration-150"
        :class="[size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4', { 'rotate-180': isOpen }]"
      />
    </button>

    <!-- Dropdown panel -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-100 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-75 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div
          v-if="isOpen"
          ref="panelRef"
          :style="panelStyle"
          class="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col"
        >
          <!-- Search input -->
          <div v-if="searchable" class="px-2 py-2 border-b border-gray-100 shrink-0">
            <div class="relative">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                ref="searchRef"
                v-model="searchQuery"
                type="text"
                :placeholder="t(searchPlaceholder)"
                class="w-full pl-8 pr-3 py-1.5 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                @click.stop
                @keydown="onSearchKeydown"
              />
            </div>
          </div>

          <!-- Options list -->
          <div class="overflow-y-auto py-1">
            <button
              v-for="(opt, i) in filteredOptions"
              :key="i"
              type="button"
              @click="select(opt.value)"
              class="w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors"
              :class="
                opt.value === modelValue
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : i === focusedIndex
                    ? 'bg-gray-100 text-gray-700'
                    : 'text-gray-700 hover:bg-gray-50'
              "
            >
              <span class="truncate flex-1">{{ opt.label }}</span>
              <Check
                v-if="opt.value === modelValue"
                class="w-4 h-4 text-brand-500 shrink-0 ml-2"
              />
            </button>

            <!-- Crear nuevo valor a partir de lo escrito -->
            <button
              v-if="canCreate"
              type="button"
              @click="createFromQuery"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-brand-600 hover:bg-brand-50 transition-colors border-t border-gray-100"
            >
              <Plus class="w-4 h-4 shrink-0" />
              <span class="truncate flex-1">{{ t('common.createOption', [searchQuery.trim()]) }}</span>
            </button>

            <div
              v-if="!filteredOptions.length && !canCreate"
              class="px-3 py-3 text-sm text-gray-400 text-center"
            >
              {{ searchQuery ? t('common.noResults') : t('common.noOptions') }}
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
