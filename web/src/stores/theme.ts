import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Initialize from localStorage or system preference
  const getInitialTheme = (): boolean => {
    if (typeof window === 'undefined') return false

    const saved = localStorage.getItem('theme')
    if (saved === 'dark') return true
    if (saved === 'light') return false

    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  const isDark = ref(getInitialTheme())

  // Apply theme to document
  const applyTheme = (dark: boolean) => {
    if (typeof document === 'undefined') return

    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Initialize theme on store creation
  if (typeof window !== 'undefined') {
    applyTheme(isDark.value)
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme(isDark.value)

    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    }
  }

  return {
    isDark,
    toggleTheme,
  }
})
