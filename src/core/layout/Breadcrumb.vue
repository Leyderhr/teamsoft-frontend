<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Breadcrumb from 'primevue/breadcrumb'

const route = useRoute()
const { t } = useI18n()
const items = ref([])
const home = ref({
  icon: 'pi pi-home',
  to: '/'
})

const updateBreadcrumb = () => {
  const breadcrumbs = []

  route.matched.forEach(match => {
    if (match.meta?.breadcrumb) {
      const crumbs = Array.isArray(match.meta.breadcrumb) ? match.meta.breadcrumb : [match.meta.breadcrumb]
      crumbs.forEach(crumb => {
        if (typeof crumb === 'string') {
          breadcrumbs.push({ label: crumb })
        } else if (crumb.name) {
          breadcrumbs.push({ label: crumb.name, to: crumb.disable ? null : crumb.to })
        }
      })
    }
  })

  items.value = breadcrumbs
}

watch(() => route.path, updateBreadcrumb, { immediate: true })
</script>

<template>
  <nav class="breadcrumb-nav" v-if="items.length > 0">
    <Breadcrumb :home="home" :model="items">
      <template #item="{ item }">
        <router-link
            v-if="item.to"
            :to="item.to"
            class="breadcrumb-link"
        >
          {{ t(item.label) }}
        </router-link>
        <span v-else class="breadcrumb-current">{{ t(item.label) }}</span>
      </template>
    </Breadcrumb>
  </nav>
</template>

<style scoped>
.breadcrumb-nav {
  padding: 0.5rem 1.5rem;
  background: var(--ts-bg-surface);
  border-bottom: 1px solid var(--ts-border-light);
}

.breadcrumb-link {
  color: var(--ts-primary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color var(--ts-transition-fast);
}

.breadcrumb-link:hover {
  color: var(--ts-primary-dark);
}

.breadcrumb-current {
  color: var(--ts-text-secondary);
  font-size: 0.875rem;
}
</style>
