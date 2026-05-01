<script setup>
import { ref, computed, nextTick, onUnmounted } from 'vue'
import { ChevronDown, Check, Search, X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Seleccione...' },
  disabled: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
  searchable: { type: Boolean, default: false },
  searchPlaceholder: { type: String, default: 'Buscar...' },
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

const isSelected = (value) => props.modelValue.includes(value)

const triggerLabel = computed(() => {
  const count = props.modelValue.length
  if (count === 0) return null
  if (count === 1) {
    return props.options.find(o => o.value === props.modelValue[0])?.label ?? null
  }
  return `${count} seleccionado(s)`
})

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
  focusedIndex.value = -1
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
  const current = [...props.modelValue]
  const idx = current.indexOf(value)
  if (idx === -1) current.push(value)
  else current.splice(idx, 1)
  emit('update:modelValue', current)
}

function clearAll(e) {
  e.stopPropagation()
  emit('update:modelValue', [])
}

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
      if (focusedIndex.value >= 0) select(filteredOptions.value[focusedIndex.value].value)
      break
  }
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
      <span class="truncate flex-1" :class="triggerLabel ? 'text-gray-700' : 'text-gray-400'">
        {{ triggerLabel ?? placeholder }}
      </span>
      <button
        v-if="modelValue.length > 0 && !disabled"
        type="button"
        @click="clearAll"
        class="shrink-0 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
      >
        <X :class="size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'" />
      </button>
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
                :placeholder="searchPlaceholder"
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
              class="w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors cursor-pointer"
              :class="
                isSelected(opt.value)
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : i === focusedIndex
                    ? 'bg-gray-100 text-gray-700'
                    : 'text-gray-700 hover:bg-gray-50'
              "
            >
              <span class="truncate flex-1">{{ opt.label }}</span>
              <Check
                v-if="isSelected(opt.value)"
                class="w-4 h-4 text-brand-500 shrink-0 ml-2"
              />
            </button>

            <div
              v-if="!filteredOptions.length"
              class="px-3 py-3 text-sm text-gray-400 text-center"
            >
              {{ searchQuery ? 'Sin resultados' : 'Sin opciones' }}
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
