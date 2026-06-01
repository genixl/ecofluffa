export type AuthRole = 'customer' | 'provider' | 'admin' | null

export function useAuth() {
  const role = useState<AuthRole>('auth-role', () => null)
  const userName = useState<string>('auth-name', () => '')

  const login = (userRole: AuthRole, name = '') => {
    role.value = userRole
    userName.value = name
  }

  const logout = () => {
    role.value = null
    userName.value = ''
  }

  const isLoggedIn = computed(() => role.value !== null)
  const isCustomer = computed(() => role.value === 'customer')
  const isProvider = computed(() => role.value === 'provider')
  const isAdmin = computed(() => role.value === 'admin')

  return {
    role,
    userName,
    login,
    logout,
    isLoggedIn,
    isCustomer,
    isProvider,
    isAdmin,
  }
}
