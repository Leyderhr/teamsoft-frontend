<template>
  <div>
    <PageBreadcrumb
      :page-title="pageTitle"
      :items="[{ label: 'Usuarios', path: '/manage-user-role/users' }]"
    />

    <div class="max-w-2xl">
      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-base font-semibold text-gray-800">{{ pageTitle }}</h2>
        </div>

        <!-- Form -->
        <div class="p-6 space-y-4">
          <!-- Nombre -->
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">
              Nombre <span class="text-error-500">*</span>
            </label>
            <input
              v-model="personName"
              type="text"
              placeholder="Ingrese el nombre"
              :disabled="isEditMode"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <!-- Apellido -->
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">
              Apellido <span class="text-error-500">*</span>
            </label>
            <input
              v-model="surname"
              type="text"
              placeholder="Ingrese el apellido"
              :disabled="isEditMode"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <!-- Cédula -->
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">
              Cédula <span class="text-error-500">*</span>
            </label>
            <input
              v-model="card"
              type="text"
              placeholder="Ingrese la cédula"
              :disabled="isEditMode"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <!-- Correo -->
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">
              Correo <span class="text-error-500">*</span>
            </label>
            <input
              v-model="mail"
              type="email"
              placeholder="Ingrese el correo electrónico"
              :disabled="isEditMode"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <!-- Roles -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Roles <span class="text-error-500">*</span>
            </label>
            <div
              v-if="roleOptions.length"
              class="rounded-lg border border-gray-200 p-3 space-y-2"
            >
              <label
                v-for="role in roleOptions"
                :key="role.id"
                class="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="isEditMode ? 'cursor-not-allowed' : ''"
              >
                <input
                  type="checkbox"
                  :value="role.id"
                  v-model="selectedRoles"
                  :disabled="isEditMode"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20"
                />
                <div>
                  <p class="text-sm font-medium text-gray-700">{{ role.name }}</p>
                  <p v-if="role.description" class="text-xs text-gray-400">{{ role.description }}</p>
                </div>
              </label>
            </div>
            <div v-else class="text-sm text-gray-400 p-3">Cargando roles...</div>
          </div>

          <!-- Habilitado -->
          <label class="flex items-center gap-3 cursor-pointer" :class="isEditMode ? 'cursor-not-allowed' : ''">
            <input
              type="checkbox"
              v-model="enabled"
              :disabled="isEditMode"
              class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20"
            />
            <span class="text-sm font-medium text-gray-700">Usuario habilitado</span>
          </label>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            @click="router.push('/manage-user-role/users')"
            class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            v-if="!isEditMode"
            type="button"
            @click="handleSave"
            :disabled="saving"
            class="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { Save, Loader2 } from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import userService from '@/features/users/services/userService.js'

const props = defineProps({
  mode: { type: String, default: 'create' },
})

const router = useRouter()
const route = useRoute()
const toast = useToast()

// Form state
const personName = ref('')
const surname = ref('')
const card = ref('')
const mail = ref('')
const enabled = ref(true)
const selectedRoles = ref([])
const roleOptions = ref([])
const saving = ref(false)

const isEditMode = computed(() => props.mode === 'edit')
const pageTitle = computed(() => isEditMode.value ? 'Ver Usuario' : 'Nuevo Usuario')

onMounted(async () => {
  // Load roles
  try {
    const data = await userService.getRoles()
    roleOptions.value = data ?? []
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los roles', life: 3000 })
  }

  // Load user data in edit mode
  if (isEditMode.value && route.params.id) {
    try {
      const data = await userService.getById(route.params.id)
      const u = data?.data ?? data
      personName.value = u.personName ?? ''
      surname.value = u.surname ?? ''
      card.value = u.idCard ?? u.card ?? ''
      mail.value = u.mail ?? ''
      enabled.value = u.enabled ?? true
      selectedRoles.value = u.roles?.map(r => r.id) ?? []
    } catch {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el usuario', life: 3000 })
    }
  }
})

async function handleSave() {
  if (!personName.value?.trim()) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'El nombre es requerido', life: 3000 })
    return
  }
  if (!surname.value?.trim()) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'El apellido es requerido', life: 3000 })
    return
  }
  if (!card.value?.trim()) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'La cédula es requerida', life: 3000 })
    return
  }
  if (!mail.value?.trim()) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'El correo es requerido', life: 3000 })
    return
  }
  if (!selectedRoles.value?.length) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'Debe seleccionar al menos un rol', life: 3000 })
    return
  }

  saving.value = true
  try {
    const payload = {
      personName: personName.value.trim(),
      surname: surname.value.trim(),
      card: card.value.trim(),
      mail: mail.value.trim(),
      enabled: enabled.value,
      roleIds: selectedRoles.value,
    }

    if (isEditMode.value) {
      await userService.update(route.params.id, payload)
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado correctamente', life: 3000 })
    } else {
      await userService.create(payload)
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado correctamente', life: 3000 })
    }
    router.push('/manage-user-role/users')
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: e?.response?.data?.message ?? 'Error al guardar el usuario',
      life: 3000,
    })
  } finally {
    saving.value = false
  }
}
</script>
