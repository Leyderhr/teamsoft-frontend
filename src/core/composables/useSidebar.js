import { ref, provide, inject, onMounted, onUnmounted } from 'vue'

const SidebarSymbol = Symbol('sidebar')

export function useSidebarProvider() {
  const isExpanded = ref(true)
  const isMobileOpen = ref(false)
  const isHovered = ref(false)
  const openSubmenu = ref(null)
  const isMobile = ref(false)

  function checkMobile() {
    isMobile.value = window.innerWidth < 1024
    if (!isMobile.value) {
      isMobileOpen.value = false
    }
  }

  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

  function toggleSidebar() {
    if (isMobile.value) {
      isMobileOpen.value = !isMobileOpen.value
    } else {
      isExpanded.value = !isExpanded.value
    }
  }

  function toggleMobileSidebar() {
    isMobileOpen.value = !isMobileOpen.value
  }

  function setIsHovered(value) {
    isHovered.value = value
  }

  function toggleSubmenu(key) {
    openSubmenu.value = openSubmenu.value === key ? null : key
  }

  const context = {
    isExpanded,
    isMobileOpen,
    isHovered,
    openSubmenu,
    isMobile,
    toggleSidebar,
    toggleMobileSidebar,
    setIsHovered,
    toggleSubmenu,
  }

  provide(SidebarSymbol, context)
  return context
}

export function useSidebar() {
  const context = inject(SidebarSymbol)
  if (!context) {
    throw new Error('useSidebar() must be called within a component that has useSidebarProvider() in a parent.')
  }
  return context
}
