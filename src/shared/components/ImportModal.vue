<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { X, Upload, AlertCircle } from 'lucide-vue-next'

const { t } = useI18n()

const props = defineProps({
  visible: { type: Boolean, required: true },
  title: { type: String, required: true },
  importFn: { type: Function, required: true },
})

const emit = defineEmits(['update:visible', 'success'])

// Estado interno: 'idle' | 'loading' | 'result' | 'error'
const state = ref('idle')
const selectedFile = ref(null)
const updateIfExist = ref(false)
const fileError = ref('')
const importResult = ref(null)
const errorMessage = ref('')
const isDragOver = ref(false)
const overlayRef = ref(null)
const fileInput = ref(null)

function resetState() {
  state.value = 'idle'
  selectedFile.value = null
  updateIfExist.value = false
  fileError.value = ''
  importResult.value = null
  errorMessage.value = ''
  isDragOver.value = false
}

// Resetear al abrir y dar foco al overlay para capturar Escape
watch(() => props.visible, (val) => {
  if (val) {
    resetState()
    setTimeout(() => overlayRef.value?.focus(), 50)
  }
})

function closeModal() {
  if (state.value === 'loading') return
  resetState()
  emit('update:visible', false)
}

function validateAndSetFile(file) {
  if (!file) return
  const allowedMimes = ['text/csv', 'text/plain', 'application/csv', 'application/vnd.ms-excel']
  const validExtension = file.name.toLowerCase().endsWith('.csv')
  const validMime = allowedMimes.includes(file.type) || file.type === ''
  if (!validExtension || !validMime) {
    fileError.value = t('common.import.invalidFileType')
    selectedFile.value = null
    return
  }
  fileError.value = ''
  selectedFile.value = file
}

function onFileInputChange(event) {
  validateAndSetFile(event.target.files[0])
}

function onDrop(event) {
  isDragOver.value = false
  const file = event.dataTransfer?.files[0]
  validateAndSetFile(file)
}

async function handleImport() {
  if (!selectedFile.value || state.value === 'loading') return
  state.value = 'loading'
  try {
    const result = await props.importFn(selectedFile.value, updateIfExist.value)
    importResult.value = result
    state.value = 'result'
    emit('success', result)
  } catch (err) {
    errorMessage.value = err?.message || t('common.import.genericError')
    state.value = 'error'
  }
}

function retryImport() {
  state.value = 'idle'
  errorMessage.value = ''
  isDragOver.value = false
}

function onKeydown(event) {
  if (event.key === 'Escape') closeModal()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="overlayRef"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm outline-none"
      @keydown="onKeydown"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-2xl shadow-theme-xl p-6 w-full max-w-md mx-4">

        <!-- Header -->
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
          <button
            :aria-label="t('common.close')"
            @click="closeModal"
            class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Estado: idle -->
        <div v-if="state === 'idle'">
          <!-- Zona drag & drop -->
          <div
            class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4"
            :class="isDragOver
              ? 'border-brand-500 bg-brand-50'
              : 'border-gray-300 hover:border-brand-500 hover:bg-brand-50'"
            @click="fileInput.click()"
            @dragover.prevent="isDragOver = true"
            @dragleave="isDragOver = false"
            @drop.prevent="onDrop"
          >
            <Upload class="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p class="text-sm text-gray-600">
              {{ t('common.import.dragPrompt') }}
              <span class="text-brand-500 font-medium">{{ t('common.import.clickToSelect') }}</span>
            </p>
            <input
              ref="fileInput"
              type="file"
              accept=".csv"
              class="hidden"
              @change="onFileInputChange"
            />
          </div>

          <!-- Archivo seleccionado -->
          <p v-if="selectedFile" class="text-sm text-gray-700 mb-2">
            {{ t('common.import.fileLabel') }} <span class="font-medium">{{ selectedFile.name }}</span>
          </p>

          <!-- Error de validación -->
          <p v-if="fileError" class="text-sm text-error-600 mb-2">{{ fileError }}</p>

          <!-- Checkbox updateIfExist -->
          <label class="flex items-center gap-2 mb-5 cursor-pointer">
            <input
              v-model="updateIfExist"
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            <span class="text-sm text-gray-700">{{ t('common.import.updateExisting') }}</span>
          </label>

          <!-- Botones footer -->
          <div class="flex justify-end gap-3">
            <button
              @click="closeModal"
              class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              @click="handleImport"
              :disabled="!selectedFile"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="selectedFile
                ? 'bg-brand-500 text-white hover:bg-brand-600'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'"
            >
              {{ t('common.import.importButton') }}
            </button>
          </div>
        </div>

        <!-- Estado: loading -->
        <div v-else-if="state === 'loading'" class="py-8 flex flex-col items-center gap-3">
          <svg class="animate-spin w-10 h-10 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          <p class="text-sm text-gray-600">{{ t('common.import.importing') }}</p>
        </div>

        <!-- Estado: result -->
        <div v-else-if="state === 'result'">
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="rounded-xl p-3 bg-success-50 text-center">
              <p class="text-2xl font-bold text-success-700">{{ importResult.created }}</p>
              <p class="text-xs text-success-600 font-medium mt-0.5">{{ t('common.import.created') }}</p>
            </div>
            <div class="rounded-xl p-3 bg-brand-50 text-center">
              <p class="text-2xl font-bold text-brand-700">{{ importResult.updated }}</p>
              <p class="text-xs text-brand-600 font-medium mt-0.5">{{ t('common.import.updated') }}</p>
            </div>
            <div class="rounded-xl p-3 bg-gray-50 text-center">
              <p class="text-2xl font-bold text-gray-700">{{ importResult.skipped }}</p>
              <p class="text-xs text-gray-500 font-medium mt-0.5">{{ t('common.import.skipped') }}</p>
            </div>
            <div class="rounded-xl p-3 bg-error-50 text-center">
              <p class="text-2xl font-bold text-error-700">{{ importResult.errors }}</p>
              <p class="text-xs text-error-600 font-medium mt-0.5">{{ t('common.import.errors') }}</p>
            </div>
          </div>

          <!-- Lista de errores -->
          <div
            v-if="importResult.errorMessages?.length"
            class="max-h-32 overflow-y-auto rounded-lg border border-error-200 bg-error-50 p-3 mb-4"
          >
            <p
              v-for="(msg, i) in importResult.errorMessages"
              :key="i"
              class="text-xs text-error-600"
            >
              {{ msg }}
            </p>
          </div>

          <div class="flex justify-end">
            <button
              @click="closeModal"
              class="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              {{ t('common.close') }}
            </button>
          </div>
        </div>

        <!-- Estado: error -->
        <div v-else-if="state === 'error'" class="py-6 flex flex-col items-center gap-4 text-center">
          <AlertCircle class="w-10 h-10 text-error-500" />
          <p class="text-sm text-gray-700">{{ errorMessage }}</p>
          <div class="flex gap-3">
            <button
              @click="closeModal"
              class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              @click="retryImport"
              class="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              {{ t('common.retry') }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>
