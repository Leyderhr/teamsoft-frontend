<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const { t, tm, rt } = useI18n()

const props = defineProps({
  modelValue: { type: String, default: '' }, // YYYY-MM-DD o ''
  placeholder: { type: String, default: 'common.datePlaceholder' },
  minDate: { type: String, default: '' }, // YYYY-MM-DD
  maxDate: { type: String, default: '' }, // YYYY-MM-DD
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

// ---- Estado del panel ----
const isOpen = ref(false)
const containerRef = ref(null)
const panelRef = ref(null)
const panelStyle = ref({})

// Mes que se visualiza en el panel (año y mes separados)
const viewYear = ref(new Date().getFullYear())
const viewMonth = ref(new Date().getMonth()) // 0–11

// ---- Helpers de fecha ----
const weekDays = computed(() => tm('common.calendar.weekDays').map(rt))
const months = computed(() => tm('common.calendar.months').map(rt))

function parseLocalDate(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toYMD(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplay(str) {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  return `${d}/${m}/${y}`
}

// ---- Días del panel ----
const calendarDays = computed(() => {
  const year = viewYear.value
  const month = viewMonth.value
  const firstDay = new Date(year, month, 1).getDay() // 0=dom
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const days = []

  // días del mes anterior
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrev - i)
    days.push({ date: d, current: false })
  }
  // días del mes actual
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: new Date(year, month, i), current: true })
  }
  // completar hasta 42 celdas (6 filas)
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), current: false })
  }
  return days
})

const todayYMD = toYMD(new Date())
const selectedDate = computed(() => props.modelValue || '')

function isSelected(date) {
  return toYMD(date) === selectedDate.value
}

function isToday(date) {
  return toYMD(date) === todayYMD
}

function isDisabled(date) {
  const ymd = toYMD(date)
  if (props.minDate && ymd < props.minDate) return true
  if (props.maxDate && ymd > props.maxDate) return true
  return false
}

// ---- Navegación ----
function prevMonth() {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- }
  else viewMonth.value--
}

function nextMonth() {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ }
  else viewMonth.value++
}

function onYearInput(e) {
  const y = parseInt(e.target.value, 10)
  if (!isNaN(y) && y > 1900 && y < 2200) viewYear.value = y
}

// ---- Selección ----
function selectDay(item) {
  if (!item.current || isDisabled(item.date)) return
  emit('update:modelValue', toYMD(item.date))
  isOpen.value = false
}

// ---- Abrir/cerrar panel ----
function openPanel() {
  if (props.disabled) return

  // Sincronizar vista con el valor actual
  if (props.modelValue) {
    const d = parseLocalDate(props.modelValue)
    if (d) { viewYear.value = d.getFullYear(); viewMonth.value = d.getMonth() }
  }

  isOpen.value = true

  // Posicionar el panel después del next tick
  requestAnimationFrame(() => {
    if (!containerRef.value || !panelRef.value) return
    const rect = containerRef.value.getBoundingClientRect()
    const panelH = panelRef.value.offsetHeight || 320
    const spaceBelow = window.innerHeight - rect.bottom
    const top = spaceBelow >= panelH + 8
      ? rect.bottom + window.scrollY + 4
      : rect.top  + window.scrollY - panelH - 4

    panelStyle.value = {
      position: 'absolute',
      top: `${top}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${Math.max(rect.width, 280)}px`,
      zIndex: 9999,
    }
  })
}

// ---- Click fuera ----
function handleOutsideClick(e) {
  if (!isOpen.value) return
  if (containerRef.value?.contains(e.target)) return
  if (panelRef.value?.contains(e.target)) return
  isOpen.value = false
}

onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick))

// Limpiar valor
function clear(e) {
  e.stopPropagation()
  emit('update:modelValue', '')
}

// ---- Clases de celda ----
function dayOuterClass(item) {
  return [
    'relative flex items-center justify-center h-9',
    !item.current ? 'opacity-30' : '',
  ].filter(Boolean).join(' ')
}

function dayInnerClass(item) {
  const sel = item.current && isSelected(item.date)
  const tod = item.current && isToday(item.date) && !sel
  const dis = !item.current || isDisabled(item.date)
  return [
    'relative z-10 flex items-center justify-center text-sm font-medium rounded-full w-9 h-9 transition-colors',
    dis  ? 'text-gray-300 cursor-not-allowed'
         : sel ? 'bg-brand-500 text-white cursor-pointer'
         : tod ? 'ring-2 ring-brand-500 text-gray-900 hover:bg-gray-100 cursor-pointer'
         : item.current ? 'text-gray-900 hover:bg-gray-100 cursor-pointer'
         : 'text-gray-400',
  ].filter(Boolean).join(' ')
}
</script>

<template>
  <div ref="containerRef" class="relative w-full">
    <!-- Input trigger -->
    <div
      class="flex items-center w-full rounded-lg border px-3 py-2 text-sm transition-colors cursor-pointer select-none"
      :class="[
        disabled
          ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
          : isOpen
            ? 'border-brand-500 ring-2 ring-brand-500/20 text-gray-700'
            : 'border-gray-300 text-gray-700 hover:border-gray-400',
      ]"
      @click="openPanel"
    >
      <span class="flex-1 truncate" :class="!modelValue ? 'text-gray-400' : ''">
        {{ modelValue ? formatDisplay(modelValue) : t(placeholder) }}
      </span>
      <button
        v-if="modelValue && !disabled"
        type="button"
        class="mr-1 text-gray-400 hover:text-gray-600 transition-colors leading-none"
        @click="clear"
        tabindex="-1"
      >&times;</button>
      <Calendar class="w-4 h-4 text-gray-400 flex-shrink-0" />
    </div>

    <!-- Panel flotante via Teleport -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="panelRef"
        :style="panelStyle"
        class="bg-white rounded-xl border border-gray-200 shadow-xl p-4"
      >
        <!-- Navegación mes/año -->
        <div class="flex items-center justify-between mb-4">
          <button
            type="button"
            class="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            @click="prevMonth"
          >
            <ChevronLeft class="w-5 h-5 text-brand-500" />
          </button>

          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-gray-900">{{ months[viewMonth] }}</span>
            <input
              type="number"
              :value="viewYear"
              @change="onYearInput"
              @click.stop
              class="w-16 text-center text-sm font-semibold text-gray-900 bg-transparent border-0 outline-none focus:ring-1 focus:ring-brand-500/30 rounded px-1"
              min="1900"
              max="2200"
            />
          </div>

          <button
            type="button"
            class="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            @click="nextMonth"
          >
            <ChevronRight class="w-5 h-5 text-brand-500" />
          </button>
        </div>

        <!-- Cabecera días de la semana -->
        <div class="grid grid-cols-7 mb-2">
          <div
            v-for="d in weekDays"
            :key="d"
            class="text-center text-xs font-medium text-gray-500 py-1"
          >
            {{ d }}
          </div>
        </div>

        <!-- Grilla de días -->
        <div class="grid grid-cols-7">
          <div
            v-for="(item, i) in calendarDays"
            :key="i"
            :class="dayOuterClass(item)"
          >
            <button
              type="button"
              :disabled="!item.current || isDisabled(item.date)"
              :class="dayInnerClass(item)"
              @click="selectDay(item)"
            >
              {{ item.date.getDate() }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
