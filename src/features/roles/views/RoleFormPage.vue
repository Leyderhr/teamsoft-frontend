<template>
  <GenericFormPage
    :mode="mode"
    :fields="roleConfig.fields"
    :service="roleConfig.service"
    :title="roleConfig.title"
    list-route="/manage-roles/role"
  />
</template>

<script setup>
import GenericFormPage from '@/shared/components/GenericFormPage.vue'
import { roleConfig } from '@/features/roles/config/role.config.js'

defineProps({
  mode: { type: String, default: 'create' },
  itemId: { type: String, default: null },
})
</script>
