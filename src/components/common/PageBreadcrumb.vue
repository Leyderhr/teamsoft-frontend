<template>
  <div class="mb-6">
    <h1 class="text-2xl font-bold" style="color: var(--ts-text-primary);">
      {{ pageTitle }}
    </h1>
    <nav v-if="breadcrumbs.length > 1" class="flex items-center gap-2 mt-2 text-sm">
      <template v-for="(crumb, index) in breadcrumbs" :key="index">
        <router-link
          v-if="!crumb.disable && crumb.path"
          :to="crumb.path"
          class="transition-colors hover:text-primary"
          style="color: var(--ts-text-secondary);"
        >
          {{ t(crumb.name) }}
        </router-link>
        <span
          v-else
          class="font-medium"
          :style="{ color: index === breadcrumbs.length - 1 ? 'var(--ts-text-primary)' : 'var(--ts-text-secondary)' }"
        >
          {{ t(crumb.name) }}
        </span>
        <ChevronRight v-if="index < breadcrumbs.length - 1" class="w-4 h-4" style="color: var(--ts-text-muted);" />
      </template>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  pageTitle: { type: String, default: '' }
})

const route = useRoute()
const { t } = useI18n()

const breadcrumbs = computed(() => {
  const crumbList = []
  
  crumbList.push({ name: 'menu.home', path: '/', disable: false })
  
  if (route.meta?.breadcrumb) {
    route.meta.breadcrumb.forEach(item => {
      crumbList.push({ name: item.name, path: item.path, disable: item.disable })
    })
  }
  
  if (props.pageTitle && (!route.meta?.breadcrumb || route.meta.breadcrumb[0]?.name !== props.pageTitle)) {
    crumbList.push({ name: props.pageTitle, disable: true })
  }
  
  return crumbList
})
</script>