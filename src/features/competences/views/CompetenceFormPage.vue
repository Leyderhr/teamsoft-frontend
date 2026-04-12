<template>
  <GenericFormPage
    :mode="mode"
    :fields="competenceConfig.fields"
    :service="competenceConfig.service"
    :title="competenceConfig.title"
    list-route="/manage-competences/competence"
  />
</template>

<script setup>
import GenericFormPage from '@/shared/components/GenericFormPage.vue'
import { competenceConfig } from '@/features/competences/config/competence.config.js'

defineProps({
  mode: { type: String, default: 'create' },
  itemId: { type: String, default: null },
})
</script>
