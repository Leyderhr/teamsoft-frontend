<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import {
  Save, Loader2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  UserCog,
} from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import userService from '@/features/users/services/userService.js'
import userRoleService from '@/features/users/services/userRoleService.js'

const props = defineProps({
  mode: { type: String, default: 'create' },
})

const router = useRouter()
const route  = useRoute()
const toast  = useToast()

// ── Campos básicos ──────────────────────────────────────────────
const personName = ref('')
const surname    = ref('')
const card       = ref('')
const mail       = ref('')
const enabled    = ref(true)
const saving     = ref(false)

// ── Validación visual ───────────────────────────────────────────
const errors = ref({
  personName: false,
  surname: false,
  card: false,
  mail: false,
  roles: false
})

// ── Roles ───────────────────────────────────────────────────────
const roleOptions    = ref([])   // todos los roles del sistema
const selectedRoles  = ref([])   // IDs de roles asignados
const leftSelected   = ref([])   // selección en columna izquierda
const rightSelected  = ref([])   // selección en columna derecha

const notAssignedRoles = computed(() =>
    roleOptions.value.filter(r => !selectedRoles.value.includes(r.id))
)
const assignedRolesList = computed(() =>
    roleOptions.value.filter(r => selectedRoles.value.includes(r.id))
)

// ── Computed ────────────────────────────────────────────────────
const isEditMode = computed(() => props.mode === 'edit')
const pageTitle  = computed(() => isEditMode.value ? 'Editar Usuario' : 'Nuevo Usuario')

// ── Carga inicial ───────────────────────────────────────────────
onMounted(async () => {
  // Cargar roles disponibles desde el backend
  try {
    const rolesData = await userRoleService.getAllRoles()
    roleOptions.value = rolesData
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los roles', life: 3000 })
  }

  // Si estamos en modo edición, cargar datos del usuario
  if (isEditMode.value && route.params.id) {
    try {
      const data = await userService.getById(route.params.id)
      const u = data?.data ?? data

      personName.value   = u.personName ?? ''
      surname.value      = u.surname    ?? ''
      card.value         = u.idCard ?? u.card ?? ''
      mail.value         = u.mail       ?? ''
      enabled.value      = u.enabled    ?? true

      // Extraer los IDs de los roles asignados al usuario
      if (u.roles && Array.isArray(u.roles)) {
        selectedRoles.value = u.roles.map(role => role.id)
      }
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el usuario', life: 3000 })
    }
  }
})

// ── Flechas de asignación de roles ──────────────────────────────
function moveOneRight() {
  const valid = leftSelected.value.filter(id => notAssignedRoles.value.find(r => r.id === id))
  if (valid.length) selectedRoles.value = Array.from(new Set([...selectedRoles.value, ...valid]))
  leftSelected.value = []
}
function moveAllRight() {
  selectedRoles.value = Array.from(new Set([...selectedRoles.value, ...notAssignedRoles.value.map(r => r.id)]))
  leftSelected.value  = []
}
function moveOneLeft() {
  const valid = rightSelected.value.filter(id => assignedRolesList.value.find(r => r.id === id))
  if (valid.length) selectedRoles.value = selectedRoles.value.filter(id => !valid.includes(id))
  rightSelected.value = []
}
function moveAllLeft() {
  selectedRoles.value = []
  rightSelected.value = []
}

// ── Guardar ─────────────────────────────────────────────────────
async function handleSave() {
  // Resetear errores
  errors.value = {
    personName: false,
    surname: false,
    card: false,
    mail: false,
    roles: false
  }

  let hasErrors = false

  if (!personName.value?.trim()) {
    errors.value.personName = true
    hasErrors = true
  }
  if (!surname.value?.trim()) {
    errors.value.surname = true
    hasErrors = true
  }
  if (!card.value?.trim()) {
    errors.value.card = true
    hasErrors = true
  }
  if (!mail.value?.trim()) {
    errors.value.mail = true
    hasErrors = true
  }
  if (!selectedRoles.value?.length) {
    errors.value.roles = true
    hasErrors = true
  }

  if (hasErrors) {
    toast.add({ 
      severity: 'warn', 
      summary: 'Validación', 
      detail: 'Por favor complete todos los campos requeridos', 
      life: 4000 
    })
    return
  }

  saving.value = true
  try {
    const payload = {
      personName: personName.value.trim(),
      surname:    surname.value.trim(),
      card:       card.value.trim(),
      mail:       mail.value.trim(),
      enabled:    enabled.value,
      roleIds:    selectedRoles.value,
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

<template>
  <div class="space-y-6">
    <PageBreadcrumb
        :page-title="pageTitle"
        :items="[{ label: 'Usuarios', path: '/manage-user-role/users' }]"
    />

    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">

      <!-- ── Header ─────────────────────────────────────────────── -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
            <UserCog class="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-800">
              {{ isEditMode ? 'Datos del Usuario' : 'Información del Nuevo Usuario' }}
            </h2>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ isEditMode ? 'Modifica los campos y guarda los cambios' : 'Completa los campos para crear el usuario' }}
            </p>
          </div>
        </div>

        <!-- Toggle habilitado/deshabilitado -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <span class="text-sm font-medium" :class="enabled ? 'text-success-600' : 'text-gray-400'">
            {{ enabled ? 'Habilitado' : 'Deshabilitado' }}
          </span>
          <button
              type="button"
              role="switch"
              :aria-checked="enabled"
              @click="enabled = !enabled"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              :class="enabled ? 'bg-success-500' : 'bg-gray-300'"
          >
            <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200"
                :class="enabled ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>

      <div class="p-6 space-y-8">

        <!-- ── Sección 1: Datos personales (grid 2×2) ─────────────── -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Datos personales</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Nombre -->
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">
                Nombre <span class="text-error-500">*</span>
              </label>
              <input
                  v-model="personName"
                  type="text"
                  placeholder="Ingrese el nombre"
                  :class="[
                    'w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-colors',
                    errors.personName 
                      ? 'border-error-500 focus:ring-error-500/20 focus:border-error-500' 
                      : 'border-gray-300 focus:ring-brand-500/20 focus:border-brand-500'
                  ]"
              />
              <p v-if="errors.personName" class="text-xs text-error-500 mt-1">El nombre es requerido</p>
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
                  :class="[
                    'w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-colors',
                    errors.surname 
                      ? 'border-error-500 focus:ring-error-500/20 focus:border-error-500' 
                      : 'border-gray-300 focus:ring-brand-500/20 focus:border-brand-500'
                  ]"
              />
              <p v-if="errors.surname" class="text-xs text-error-500 mt-1">El apellido es requerido</p>
            </div>
            <!-- Cédula / Carnet de Identidad -->
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">
                Cédula / Carnet de Identidad <span class="text-error-500">*</span>
              </label>
              <input
                  v-model="card"
                  type="text"
                  placeholder="Ingrese la cédula"
                  :class="[
                    'w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-colors',
                    errors.card 
                      ? 'border-error-500 focus:ring-error-500/20 focus:border-error-500' 
                      : 'border-gray-300 focus:ring-brand-500/20 focus:border-brand-500'
                  ]"
              />
              <p v-if="errors.card" class="text-xs text-error-500 mt-1">La cédula es requerida</p>
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
                  :class="[
                    'w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-colors',
                    errors.mail 
                      ? 'border-error-500 focus:ring-error-500/20 focus:border-error-500' 
                      : 'border-gray-300 focus:ring-brand-500/20 focus:border-brand-500'
                  ]"
              />
              <p v-if="errors.mail" class="text-xs text-error-500 mt-1">El correo es requerido</p>
            </div>
          </div>
        </div>

        <!-- ── Sección 2: Asignación de roles ─────────────────────── -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Asignación de roles</h3>
            <span v-if="errors.roles" class="text-xs text-error-500 font-medium">
              Debe seleccionar al menos un rol
            </span>
          </div>

          <div class="grid grid-cols-[1fr_auto_1fr] gap-4 items-stretch">

            <!-- Columna izquierda: disponibles -->
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Roles disponibles</span>
                <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {{ notAssignedRoles.length }}
                </span>
              </div>
              <div class="flex-1 min-h-[160px] max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50">
                <div
                    v-for="role in notAssignedRoles"
                    :key="role.id"
                    class="flex items-center gap-2.5 px-3 py-2 hover:bg-white transition-colors cursor-pointer"
                    :class="leftSelected.includes(role.id) ? 'bg-brand-50 border-l-2 border-brand-400' : ''"
                    @click="leftSelected.includes(role.id)
                    ? leftSelected = leftSelected.filter(id => id !== role.id)
                    : leftSelected.push(role.id)"
                >
                  <input
                      type="checkbox"
                      :value="role.id"
                      v-model="leftSelected"
                      class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 pointer-events-none flex-shrink-0"
                  />
                  <span class="text-sm text-gray-700 truncate">{{ role.name }}</span>
                </div>
                <div v-if="!notAssignedRoles.length" class="flex items-center justify-center h-full py-8 text-xs text-gray-400">
                  Sin roles disponibles
                </div>
              </div>
            </div>

            <!-- Columna central: flechas -->
            <div class="flex flex-col items-center justify-center gap-2 px-1 self-center">
              <!-- Mover selección → derecha -->
              <button
                  type="button"
                  title="Agregar seleccionados"
                  :disabled="!leftSelected.length"
                  @click="moveOneRight"
                  class="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-brand-400 hover:text-brand-500 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight class="w-4 h-4" />
              </button>
              <!-- Mover todos → derecha -->
              <button
                  type="button"
                  title="Agregar todos"
                  :disabled="!notAssignedRoles.length"
                  @click="moveAllRight"
                  class="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-brand-400 hover:text-brand-500 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight class="w-4 h-4" />
              </button>
              <!-- Mover selección → izquierda -->
              <button
                  type="button"
                  title="Quitar seleccionados"
                  :disabled="!rightSelected.length"
                  @click="moveOneLeft"
                  class="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-error-400 hover:text-error-500 hover:bg-error-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft class="w-4 h-4" />
              </button>
              <!-- Mover todos → izquierda -->
              <button
                  type="button"
                  title="Quitar todos"
                  :disabled="!assignedRolesList.length"
                  @click="moveAllLeft"
                  class="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-error-400 hover:text-error-500 hover:bg-error-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft class="w-4 h-4" />
              </button>
            </div>

            <!-- Columna derecha: asignados -->
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Roles asignados</span>
                <span
                    class="text-xs px-2 py-0.5 rounded-full"
                    :class="assignedRolesList.length
                    ? 'bg-brand-50 text-brand-600'
                    : 'bg-gray-100 text-gray-400'"
                >
                  {{ assignedRolesList.length }}
                </span>
              </div>
              <div class="flex-1 min-h-[160px] max-h-56 overflow-y-auto rounded-xl border bg-gray-50 transition-colors"
                   :class="[
                     assignedRolesList.length ? 'border-brand-200' : 'border-gray-200',
                     errors.roles ? 'border-error-500 ring-2 ring-error-500/20' : ''
                   ]"
              >
                <div
                    v-for="role in assignedRolesList"
                    :key="role.id"
                    class="flex items-center gap-2.5 px-3 py-2 hover:bg-white transition-colors cursor-pointer"
                    :class="rightSelected.includes(role.id) ? 'bg-error-50 border-l-2 border-error-400' : ''"
                    @click="rightSelected.includes(role.id)
                    ? rightSelected = rightSelected.filter(id => id !== role.id)
                    : rightSelected.push(role.id)"
                >
                  <input
                      type="checkbox"
                      :value="role.id"
                      v-model="rightSelected"
                      class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 pointer-events-none flex-shrink-0"
                  />
                  <span class="text-sm text-gray-700 truncate">{{ role.name }}</span>
                </div>
                <div v-if="!assignedRolesList.length" class="flex items-center justify-center h-full py-8 text-xs text-gray-400">
                  Sin roles asignados
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- ── Footer ─────────────────────────────────────────────── -->
      <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
        <button
            type="button"
            @click="router.push('/manage-user-role/users')"
            class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
            type="button"
            @click="handleSave"
            :disabled="saving"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
          <Save v-else class="w-4 h-4" />
          {{ saving ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>

    </div>
  </div>
</template>
