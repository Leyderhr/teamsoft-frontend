<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  maxLength: { type: Number, default: 300 },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  hasError: { type: Boolean, default: false },
  rows: { type: Number, default: 2 },
})

const emit = defineEmits(['update:modelValue'])

const textareaRef = ref(null)

function adjust() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

function onInput(e) {
  const raw = e.target.value
  const val = props.maxLength ? raw.slice(0, props.maxLength) : raw
  if (raw !== val) e.target.value = val
  emit('update:modelValue', val)
  nextTick(adjust)
}

watch(() => props.modelValue, () => nextTick(adjust), { immediate: true })
</script>

<template>
  <div class="w-full">
    <textarea
      ref="textareaRef"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      @input="onInput"
      class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 resize-none overflow-hidden transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
      :class="[
        disabled
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-400'
          : hasError
            ? 'border-error-400 focus:border-error-500 focus:ring-error-500/20'
            : 'border-gray-300 hover:border-gray-400',
      ]"
    ></textarea>
    <div v-if="maxLength" class="flex justify-end mt-0.5">
      <span
        class="text-xs tabular-nums"
        :class="(modelValue?.length ?? 0) >= maxLength ? 'text-error-500' : 'text-gray-400'"
      >
        {{ modelValue?.length ?? 0 }} / {{ maxLength }}
      </span>
    </div>
  </div>
</template>
