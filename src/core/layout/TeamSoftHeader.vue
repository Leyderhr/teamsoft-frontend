<template>
  <header class="sticky top-0 flex w-full bg-white border-b border-gray-200 z-20 shadow-theme-xs">
    <div class="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
      <div
        class="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4"
      >
        <!-- Hamburger toggle -->
        <button
          @click="handleHamburger"
          class="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 lg:h-11 lg:w-11"
        >
          <svg v-if="isMobileOpen" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              fill-rule="evenodd" clip-rule="evenodd"
              d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
              fill="currentColor"
            />
          </svg>
          <svg v-else width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path
              fill-rule="evenodd" clip-rule="evenodd"
              d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <!-- Logo mobile -->
        <router-link to="/" class="flex items-center lg:hidden">
          <span class="text-xl font-bold text-gray-900">
            TeamSoft<sup class="text-brand-500 text-sm">+</sup>
          </span>
        </router-link>

        <!-- Mobile: profile icon with combined dropdown -->
        <div class="relative flex items-center lg:hidden" ref="mobileProfileRef">
          <button
            @click="toggleMobileProfileMenu"
            class="flex items-center justify-center w-10 h-10 rounded-full bg-brand-500 hover:bg-brand-600 transition-colors"
          >
            <User class="w-5 h-5 text-white" />
          </button>

          <div
            v-if="mobileProfileMenuOpen"
            class="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-gray-200 bg-white shadow-theme-lg z-50 overflow-hidden"
          >
            <!-- User info -->
            <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div class="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                <User class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0">
                <span class="block font-semibold text-gray-800 text-sm truncate">
                  {{ authStore.user?.username || t('common.user') }}
                </span>
                <span
                  class="block text-xs text-gray-500 mt-0.5 truncate"
                  v-if="authStore.user?.authorities?.length > 0"
                >
                  {{ authStore.user.authorities[0].replace('ROLE_', '').replace(/_/g, ' ') }}
                </span>
              </div>
            </div>

            <!-- User actions -->
            <ul class="flex flex-col gap-0.5 p-2 border-b border-gray-200">
              <li>
                <router-link
                  to="/change-password"
                  class="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-100"
                  @click="mobileProfileMenuOpen = false"
                >
                  <Key class="w-4 h-4 text-gray-400 flex-shrink-0" />
                  {{ t('common.changePassword') }}
                </router-link>
              </li>
              <li>
                <button
                  @click="handleLogout"
                  class="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-100"
                >
                  <LogOut class="w-4 h-4 text-gray-400 flex-shrink-0" />
                  {{ t('common.logout') }}
                </button>
              </li>
            </ul>

            <!-- Language section (accordion) -->
            <div>
              <button
                @click="mobileLanguageExpanded = !mobileLanguageExpanded"
                class="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FlagIcon :code="localeStore.currentLanguage" />
                <span class="flex-1 text-left font-medium">
                  {{ mobileLanguages.find(l => l.code === localeStore.currentLanguage)?.name }}
                </span>
                <ChevronDown
                  class="w-4 h-4 text-gray-400 transition-transform duration-200"
                  :class="{ 'rotate-180': mobileLanguageExpanded }"
                />
              </button>

              <div v-if="mobileLanguageExpanded" class="px-2 pb-2 bg-gray-50">
                <button
                  v-for="lang in mobileLanguages"
                  :key="lang.code"
                  @click="() => { localeStore.setLanguage(lang.code); mobileProfileMenuOpen = false; mobileLanguageExpanded = false }"
                  class="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm rounded-xl hover:bg-gray-100"
                  :class="localeStore.currentLanguage === lang.code ? 'text-brand-500 font-medium bg-brand-50' : 'text-gray-700'"
                >
                  <FlagIcon :code="lang.code" />
                  <span class="flex-1 text-left">{{ lang.name }}</span>
                  <Check v-if="localeStore.currentLanguage === lang.code" class="w-4 h-4 flex-shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right actions (desktop only) -->
      <div class="hidden lg:flex items-center justify-end w-full gap-4">
        <!-- Language Switcher -->
        <LanguageSwitcher />

        <!-- User Profile -->
        <div class="relative" ref="profileRef">
          <button
            @click="toggleProfileMenu"
            class="flex items-center gap-2 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <div class="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center">
              <User class="w-4 h-4 text-white" />
            </div>
            <span class="font-medium text-sm">{{ authStore.user?.username || t('common.user') }}</span>
            <ChevronDown
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': profileMenuOpen }"
            />
          </button>

          <div
            v-if="profileMenuOpen"
            class="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg z-50"
          >
            <div class="pb-3 border-b border-gray-200">
              <span class="block font-semibold text-gray-800 text-sm">
                {{ authStore.user?.username || t('common.user') }}
              </span>
              <span
                class="block text-xs text-gray-500 mt-0.5"
                v-if="authStore.user?.authorities?.length > 0"
              >
                {{ authStore.user.authorities[0].replace('ROLE_', '').replace(/_/g, ' ') }}
              </span>
            </div>
            <ul class="flex flex-col gap-1 pt-3">
              <li>
                <router-link
                  to="/change-password"
                  class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
                  @click="profileMenuOpen = false"
                >
                  <Key class="w-4 h-4 text-gray-400" />
                  {{ t('common.changePassword') }}
                </router-link>
              </li>
              <li>
                <button
                  @click="handleLogout"
                  class="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <LogOut class="w-4 h-4 text-gray-400" />
                  {{ t('common.logout') }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/lib/auth-store'
import { useLocaleStore } from '@/core/store/locale.store.js'
import { useSidebar } from '@/core/composables/useSidebar.js'
import { User, ChevronDown, Key, LogOut, Check } from 'lucide-vue-next'
import LanguageSwitcher from '@/core/layout/LanguageSwitcher.vue'
import FlagIcon from '@/core/layout/FlagIcon.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const localeStore = useLocaleStore()
const { toggleSidebar, toggleMobileSidebar, isMobileOpen, isMobile } = useSidebar()

const profileRef = ref(null)
const mobileProfileRef = ref(null)
const profileMenuOpen = ref(false)
const mobileProfileMenuOpen = ref(false)
const mobileLanguageExpanded = ref(false)

const mobileLanguages = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' }
]

function handleHamburger() {
  if (isMobile.value) {
    toggleMobileSidebar()
  } else {
    toggleSidebar()
  }
}

const toggleProfileMenu = () => {
  profileMenuOpen.value = !profileMenuOpen.value
}

const toggleMobileProfileMenu = () => {
  mobileProfileMenuOpen.value = !mobileProfileMenuOpen.value
}

const handleLogout = async () => {
  profileMenuOpen.value = false
  mobileProfileMenuOpen.value = false
  authStore.clearAuth()
  router.push('/login')
}

const handleClickOutside = (event) => {
  if (profileRef.value && !profileRef.value.contains(event.target)) {
    profileMenuOpen.value = false
  }
  if (mobileProfileRef.value && !mobileProfileRef.value.contains(event.target)) {
    mobileProfileMenuOpen.value = false
    mobileLanguageExpanded.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
