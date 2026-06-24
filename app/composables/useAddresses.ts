export interface CustomerAddress {
  id: string
  user_id: string
  label: string
  address: string
  is_default: boolean
  created_at: string
}

export function useAddresses() {
  const supabase = useSupabaseClient()
  const { profile } = useAuth()

  const addresses = useState<CustomerAddress[]>('customer-addresses', () => [])
  const loading = useState<boolean>('customer-addresses-loading', () => false)

  /** Build a Google Maps search URL from a plain address string */
  const mapsUrl = (address: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

  const fetchAddresses = async () => {
    if (!profile.value?.id) return
    loading.value = true
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('user_id', profile.value.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
    loading.value = false
    if (!error && data) addresses.value = data as CustomerAddress[]
  }

  const addAddress = async (payload: { label: string; address: string; is_default: boolean }) => {
    if (!profile.value?.id) return null
    // clear any existing defaults before setting a new one
    if (payload.is_default) await clearDefault()
    const { data, error } = await supabase
      .from('customer_addresses')
      .insert({ ...payload, user_id: profile.value.id })
      .select()
      .single()
    if (!error && data) {
      addresses.value = [data as CustomerAddress, ...addresses.value]
      if (payload.is_default) markLocalDefault(data.id)
    }
    return error ? null : (data as CustomerAddress)
  }

  const updateAddress = async (id: string, payload: { label?: string; address?: string; is_default?: boolean }) => {
    if (payload.is_default) await clearDefault()
    const { data, error } = await supabase
      .from('customer_addresses')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (!error && data) {
      addresses.value = addresses.value.map((a) => (a.id === id ? (data as CustomerAddress) : a))
      if (payload.is_default) markLocalDefault(id)
    }
    return error ? null : (data as CustomerAddress)
  }

  const deleteAddress = async (id: string) => {
    const { error } = await supabase.from('customer_addresses').delete().eq('id', id)
    if (!error) addresses.value = addresses.value.filter((a) => a.id !== id)
    return !error
  }

  const setDefault = async (id: string) => {
    await clearDefault()
    await updateAddress(id, { is_default: true })
  }


  const clearDefault = async () => {
    if (!profile.value?.id) return
    await supabase
      .from('customer_addresses')
      .update({ is_default: false })
      .eq('user_id', profile.value.id)
      .eq('is_default', true)
  }

  const markLocalDefault = (id: string) => {
    addresses.value = addresses.value.map((a) => ({ ...a, is_default: a.id === id }))
  }

  const defaultAddress = computed(() => addresses.value.find((a) => a.is_default) ?? null)

  return {
    addresses,
    loading,
    defaultAddress,
    mapsUrl,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefault,
  }
}
