import { ref, computed } from 'vue'

const THEME_KEY = 'life-progress-theme'

// 全局共享的主题状态(模块级单例)
const isDark = ref(false)

/** 初始化主题(在 app.vue 中调用一次) */
function initTheme(): void {
  if (import.meta.server) return
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
  }
  applyTheme()
}

/** 切换主题 */
function toggleTheme(): void {
  isDark.value = !isDark.value
  applyTheme()
  localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light')
}

function applyTheme(): void {
  if (import.meta.server) return
  document.documentElement.classList.toggle('dark', isDark.value)
}

export function useTheme() {
  return {
    isDark: computed(() => isDark.value),
    initTheme,
    toggleTheme,
  }
}
