<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useI18n } from "vue-i18n"
import { AlertCircle, Save, Loader2, Plus, Pencil, Trash2, X } from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppAutoGrow from '@/components/ui/AppAutoGrow.vue'
import competenceService from '@/features/competences/services/competenceService.js'
import levelsService from '@/features/nomenclatives/services/levelsService.js'
import { parseApiError } from "@/lib/apiError"

const { t } = useI18n()

const props = defineProps({
  mode: { type: String, default: 'create' },
  itemId: { type: String, default: null },
})

const router = useRouter()
const route = useRoute()
const toast = useToast()

const form = reactive({ competitionName: '', description: '', technical: false })
const errors = reactive({})
const saving = ref(false)
const loadingData = ref(false)

const allLevels = ref([])

const levelOptions = computed(() =>
  allLevels.value.map(l => ({ label: `${l.levels} - ${l.significance}`, value: l.id }))
)

// Available levels: exclude those already used (except the one currently being edited)
const availableLevelOptions = computed(() => {
  const usedIds = new Set(
    behaviors.value.filter((_, i) => i !== editingIdx.value).map(b => b.levelId)
  )
  return allLevels.value
    .filter(l => !usedIds.has(l.id))
    .map(l => ({ label: `${l.levels} - ${l.significance}`, value: l.id }))
})

// Observable behaviors
const behaviors = ref([])  // { levelId, levelNumber, significance, description }
const selectedLevelId = ref(null)
const behaviorDesc = ref('')
const editingIdx = ref(-1)
const selectedBehaviorIdx = ref(-1)

const isEditing = computed(() => editingIdx.value >= 0)

const formTitle = computed(() =>
  props.mode === 'create'
    ? `${t('common.create')} ${t('features.competences.formTitle')}`
    : `${t('common.edit')} ${t('features.competences.formTitle')}`
)

function getLevelById(id) {
  return allLevels.value.find(l => l.id === id)
}

function onAddOrUpdate() {
  if (!selectedLevelId.value || !behaviorDesc.value.trim()) return
  const level = getLevelById(selectedLevelId.value)
  if (!level) return

  if (isEditing.value) {
    behaviors.value[editingIdx.value] = {
      levelId: level.id,
      levelNumber: level.levels,
      significance: level.significance,
      description: behaviorDesc.value.trim(),
    }
    cancelEdit()
  } else {
    const exists = behaviors.value.some(b => b.levelId === level.id)
    if (exists) {
      toast.add({ severity: 'warn', summary: t('features.competences.aviso'), detail: t('features.competences.duplicateBehavior'), life: 3000 })
      return
    }
    behaviors.value.push({
      levelId: level.id,
      levelNumber: level.levels,
      significance: level.significance,
      description: behaviorDesc.value.trim(),
    })
    selectedLevelId.value = null
    behaviorDesc.value = ''
  }
}

function onSelectBehaviorRow(idx) {
  if (selectedBehaviorIdx.value === idx && isEditing.value) {
    cancelEdit()
    return
  }
  selectedBehaviorIdx.value = idx
  const b = behaviors.value[idx]
  selectedLevelId.value = b.levelId
  behaviorDesc.value = b.description
  editingIdx.value = idx
}

function onDeleteBehavior() {
  if (selectedBehaviorIdx.value < 0) return
  behaviors.value.splice(selectedBehaviorIdx.value, 1)
  cancelEdit()
}

function cancelEdit() {
  editingIdx.value = -1
  selectedLevelId.value = null
  behaviorDesc.value = ''
  selectedBehaviorIdx.value = -1
}

onMounted(async () => {
  loadingData.value = true
  try {
    const res = await levelsService.getAll()
    allLevels.value = res?.data ?? res
  } catch {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('features.competences.levelsLoadError'), life: 3000 })
  }

  if (props.mode === 'edit' && route.params.id) {
    try {
      const res = await competenceService.getById(route.params.id)
      const data = res?.data ?? res
      form.competitionName = data.competitionName ?? ''
      form.description = data.description ?? ''
      form.technical = data.technical ?? false

      if (data.dimensionList?.length) {
        behaviors.value = data.dimensionList.map(d => ({
          levelId: d.levelsFk?.id,
          levelNumber: d.levelsFk?.levels,
          significance: d.levelsFk?.significance,
          description: d.name,
        }))
      }
    } catch {
      toast.add({ severity: 'error', summary: t('common.error'), detail: t('features.competences.loadError'), life: 3000 })
    }
  }
  loadingData.value = false
})

async function handleSave() {
  Object.keys(errors).forEach(k => delete errors[k])
  let valid = true

  if (!form.competitionName.trim()) {
    errors.competitionName = t('features.competences.nameRequired')
    valid = false
  }
  if (!form.description.trim()) {
    errors.description = t('features.competences.descRequired')
    valid = false
  }
  if (!valid) return

  const payload = {
    competitionName: form.competitionName,
    description: form.description,
    technical: form.technical,
    dimensionList: behaviors.value.map(b => ({
      name: b.description,
      levelsID: b.levelId,
    })),
  }

  saving.value = true
  try {
    if (props.mode === 'create') {
      await competenceService.create(payload)
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('features.competences.created'), life: 3000 })
    } else {
      await competenceService.update(route.params.id, payload)
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('features.competences.updated'), life: 3000 })
    }
    router.push('/manage-competences/competence')
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: await parseApiError(e, t('common.saveError')),
      life: 3000,
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <PageBreadcrumb
      :page-title="formTitle"
      :items="[{ label: t('features.competences.formTitle'), path: '/manage-competences/competence' }]"
    />

    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <!-- Card header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-base font-semibold text-gray-800">{{ formTitle }}</h2>
      </div>

      <!-- Loading state -->
      <div v-if="loadingData" class="flex items-center justify-center py-20">
        <Loader2 class="w-6 h-6 animate-spin text-brand-500" />
      </div>

      <template v-else>
        <!-- Section: Basic data -->
        <div class="px-6 pt-6 pb-5">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            {{ t('features.competences.basicData') }}
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Name -->
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">
                {{ t('features.competences.competitionNameLabel') }} <span class="text-error-500 ml-0.5">*</span>
              </label>
              <input
                v-model="form.competitionName"
                type="text"
                :placeholder="t('features.competences.competitionNameLabel')"
                class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                :class="errors.competitionName ? 'border-error-400' : 'border-gray-300 hover:border-gray-400'"
              />
              <p v-if="errors.competitionName" class="text-xs text-error-600 flex items-center gap-1">
                <AlertCircle class="w-3 h-3 flex-shrink-0" />
                {{ errors.competitionName }}
              </p>
            </div>

            <!-- Technical (aligned checkbox) -->
            <div class="flex items-end pb-1">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="form.technical"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20"
                />
                <span class="text-sm font-medium text-gray-700">{{ t('features.competences.technicalLabel') }}</span>
              </label>
            </div>

            <!-- Description – full width -->
            <div class="space-y-1 sm:col-span-2 lg:col-span-3">
              <label class="block text-sm font-medium text-gray-700">
                {{ t('features.competences.descriptionLabel') }} <span class="text-error-500 ml-0.5">*</span>
              </label>
              <AppAutoGrow
                v-model="form.description"
                :placeholder="t('features.competences.descriptionLabel')"
                :max-length="300"
                :has-error="!!errors.description"
              />
              <p v-if="errors.description" class="text-xs text-error-600 flex items-center gap-1">
                <AlertCircle class="w-3 h-3 flex-shrink-0" />
                {{ errors.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="mx-6 border-t border-gray-100"></div>

        <!-- Section: Observable behaviors -->
        <div class="px-6 pt-6 pb-6">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            {{ t('features.competences.observableBehaviors') }}
          </p>

          <!-- Entry mini-form -->
          <div class="grid grid-cols-1 sm:grid-cols-[minmax(180px,1fr)_2fr] gap-3 mb-2">
            <!-- Level -->
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">{{ t('features.competences.levelLabel') }}</label>
              <AppSelect
                v-model="selectedLevelId"
                :options="availableLevelOptions"
                :placeholder="t('features.competences.selectLevel')"
                :searchable="true"
              />
            </div>

            <!-- Behavior description -->
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">
                {{ t('features.competences.behaviorDescLabel') }}
                <span class="text-xs font-normal text-gray-400 ml-1">{{ t('features.competences.behaviorDescHint') }}</span>
              </label>
              <AppAutoGrow
                v-model="behaviorDesc"
                :placeholder="t('features.competences.behaviorDescLabel')"
                :max-length="300"
                :rows="1"
              />
            </div>
          </div>

          <!-- Form action buttons -->
          <div class="flex items-center gap-2 mb-5">
            <button
              type="button"
              @click="onAddOrUpdate"
              :disabled="!selectedLevelId || !behaviorDesc.trim()"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              :class="(!selectedLevelId || !behaviorDesc.trim())
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isEditing
                  ? 'bg-brand-500 text-white hover:bg-brand-600'
                  : 'bg-brand-500 text-white hover:bg-brand-600'"
            >
              <Pencil v-if="isEditing" class="w-4 h-4" />
              <Plus v-else class="w-4 h-4" />
              {{ isEditing ? t('common.update') : t('common.add') }}
            </button>
            <button
              v-if="isEditing"
              type="button"
              @click="cancelEdit"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <X class="w-4 h-4" />
              {{ t('common.cancel') }}
            </button>
          </div>

          <!-- Behaviors table -->
          <div class="rounded-xl border border-gray-200 overflow-hidden">
            <!-- Table toolbar -->
            <div class="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <span class="text-xs font-medium text-gray-500">
                {{ behaviors.length }} {{ t('features.competences.observableBehaviors').toLowerCase() }}
              </span>
              <button
                v-if="selectedBehaviorIdx >= 0"
                type="button"
                @click="onDeleteBehavior"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-error-200 text-xs font-medium text-error-600 hover:bg-error-50 transition-colors cursor-pointer"
              >
                <Trash2 class="w-3.5 h-3.5" />
                {{ t('common.delete') }}
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full">
                <thead>
                  <tr class="border-b border-gray-200 bg-white">
                    <th class="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      {{ t('features.competences.levelHeader') }}
                    </th>
                    <th class="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      {{ t('features.competences.significanceHeader') }}
                    </th>
                    <th class="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ t('features.competences.descriptionHeader') }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-if="!behaviors.length">
                    <td colspan="3" class="px-4 py-10 text-center text-sm text-gray-400">
                      {{ t('features.competences.noBehaviors') }}
                    </td>
                  </tr>
                  <tr
                    v-for="(b, idx) in behaviors"
                    :key="idx"
                    @click="onSelectBehaviorRow(idx)"
                    class="cursor-pointer transition-colors"
                    :class="selectedBehaviorIdx === idx ? 'bg-brand-50' : 'hover:bg-gray-50'"
                  >
                    <td class="px-4 py-3 text-sm font-medium text-gray-700">{{ b.levelNumber }}</td>
                    <td class="px-4 py-3 text-sm text-gray-700">{{ b.significance }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 whitespace-pre-wrap">{{ b.description }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            @click="router.back()"
            class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="button"
            @click="handleSave"
            :disabled="saving"
            class="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            {{ saving ? t('common.saving') : t('common.save') }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
