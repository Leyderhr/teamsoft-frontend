<template>
  <div
    class="overflow-hidden rounded-2xl border"
    style="background: var(--ts-bg-surface); border-color: var(--ts-border);"
  >
    <div
      v-if="title"
      class="border-b px-5 py-4"
      style="border-color: var(--ts-border);"
    >
      <h3 class="text-lg font-semibold" style="color: var(--ts-text-primary);">
        {{ title }}
      </h3>
      <p v-if="description" class="mt-1 text-sm" style="color: var(--ts-text-secondary);">
        {{ description }}
      </p>
    </div>
    <div class="px-5 py-4">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' }
})
</script>