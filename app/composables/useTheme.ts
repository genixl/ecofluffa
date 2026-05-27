
export function useTheme() {
  const isDark = useState<boolean>('theme-dark', () => false)

  const initTheme = () => {
    if (import.meta.client) {
      const stored = localStorage.getItem('ecofluffa-theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = stored ? stored === 'dark' : prefersDark
      applyTheme(isDark.value)
    }
  }

  const applyTheme = (dark: boolean) => {
    if (import.meta.client) {
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    }
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme(isDark.value)
    if (import.meta.client) {
      localStorage.setItem('ecofluffa-theme', isDark.value ? 'dark' : 'light')
    }
  }

  const setTheme = (dark: boolean) => {
    isDark.value = dark
    applyTheme(dark)
    if (import.meta.client) {
      localStorage.setItem('ecofluffa-theme', dark ? 'dark' : 'light')
    }
  }

  return { isDark, toggleTheme, setTheme, initTheme }
}