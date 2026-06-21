<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { KeyRound } from 'lucide-vue-next'
import GenericListView from '@/shared/components/GenericListView.vue'
import { userConfig } from '@/features/users/config/user.config.js'
import { useUsers } from '@/services/users/queries'
import { useResetPassword } from '@/services/users/mutations'

const { t } = useI18n()
const toast = useToast()
const confirm = useConfirm()
const selectedItem = ref(null)

const { data: items, isLoading: loading, refetch: loadData } = useUsers()
const resetPasswordMutation = useResetPassword()

const handleResetPassword = () => {
  if (!selectedItem.value) {
    toast.add({
      severity: 'warn',
      summary: t('common.warning'),
      detail: t('features.users.resetPassword.selectUser'),
      life: 3000
    })
    return
  }

  confirm.require({
    message: t('features.users.resetPassword.confirmMessage', [selectedItem.value.username]),
    header: t('common.confirm.header'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('features.users.resetPassword.accept'),
    rejectLabel: t('common.cancel'),
    accept: async () => {
      try {
        const result = await resetPasswordMutation.mutateAsync(selectedItem.value.id)
        toast.add({
          severity: 'success',
          summary: t('common.success'),
          detail: result?.message || t('features.users.resetPassword.success'),
          life: 3000
        })
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: t('common.error'),
          detail: error?.response?.data?.message || error?.message || t('features.users.resetPassword.error'),
          life: 3000
        })
      }
    }
  })
}
</script>

<template>
  <div>
    <GenericListView
        :items="items"
        :columns="userConfig.columns"
        :fields="userConfig.fields"
        :service="userConfig.service"
        :config="userConfig"
        :selected-item="selectedItem"
        :title="userConfig.listTitle"
        :loading="loading"
        :show-import-button="userConfig.showImportButton"
        :on-create-click="loadData"
        @update:selectedItem="selectedItem = $event"
    >
      <template #extraButtons>
        <button
          @click="handleResetPassword"
          :disabled="!selectedItem"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium transition-colors"
          :class="selectedItem
            ? 'text-blue-600 hover:bg-blue-50 hover:border-blue-200'
            : 'text-gray-300 cursor-not-allowed bg-gray-50'"
        >
          <KeyRound class="w-4 h-4" />
          {{ t('features.users.resetPassword.button') }}
        </button>
      </template>
    </GenericListView>
  </div>
</template>

<style scoped>
.titulo {
  font-size: 2.5rem;
  margin: 20px 0;
  font-family: Arial, "Arial CE", "Lucida Grande CE", lucida, "Helvetica CE", sans-serif;
}
</style>
