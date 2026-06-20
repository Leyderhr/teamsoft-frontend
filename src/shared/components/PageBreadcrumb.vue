<template>
  <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
    <h2 class="text-xl font-semibold text-gray-800">{{ pageTitle }}</h2>
    <nav aria-label="Breadcrumb">
      <ol class="flex items-center gap-1.5 flex-wrap">
        <li>
          <router-link
            to="/"
            class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-500 transition-colors"
          >
            <svg class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
              <path
                d="M1.5 6L8 1.5L14.5 6V14H10V10H6V14H1.5V6Z"
                fill="currentColor"
                fill-opacity="0.15"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linejoin="round"
              />
            </svg>
            {{ t('menu.home') }}
          </router-link>
        </li>

        <template v-for="(item, i) in items" :key="i">
          <li class="flex items-center gap-1.5">
            <ChevronRight class="w-3 h-3 text-gray-400 flex-shrink-0" />
            <router-link
              v-if="item.path"
              :to="item.path"
              class="text-sm text-gray-500 hover:text-brand-500 transition-colors"
            >
              {{ item.label }}
            </router-link>
            <span v-else class="text-sm text-gray-700">{{ item.label }}</span>
          </li>
        </template>

        <li class="flex items-center gap-1.5">
          <ChevronRight class="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span class="text-sm font-medium text-gray-700">{{ pageTitle }}</span>
        </li>
      </ol>
    </nav>
  </div>
</template>

<script setup>
import { ChevronRight } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  pageTitle: { type: String, required: true },
  items: { type: Array, default: () => [] },
})
</script>
