import type { ContactSubmission } from '~/types/supabase'

export function useContactSubmissions() {
  const supabase = useSupabaseClient()

  const submissions = useState<ContactSubmission[]>('contact-submissions', () => [])
  const loading = useState<boolean>('contact-loading', () => false)

  const fetchSubmissions = async () => {
    loading.value = true
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) submissions.value = data as ContactSubmission[]
    loading.value = false
  }

  const submitContactForm = async (
    name: string,
    email: string,
    subject: string,
    message: string
  ) => {
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert({ name, email, subject, message, status: 'new' })
      .select()
      .single()
    if (error) return { error: error.message }
    if (data) submissions.value.unshift(data as ContactSubmission)
    return { error: null }
  }

  const respondToSubmission = async (id: string, response: string) => {
    const { error } = await supabase
      .from('contact_submissions')
      .update({
        admin_response: response,
        responded_at: new Date().toISOString(),
        status: 'responded',
      })
      .eq('id', id)
    if (!error) {
      const s = submissions.value.find((x) => x.id === id)
      if (s) {
        s.admin_response = response
        s.responded_at = new Date().toISOString()
        s.status = 'responded'
      }
    }
  }

  const resolveSubmission = async (id: string) => {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status: 'resolved' })
      .eq('id', id)
    if (!error) {
      const s = submissions.value.find((x) => x.id === id)
      if (s) s.status = 'resolved'
    }
  }

  const getSubmissionById = (id: string) =>
    submissions.value.find((s) => s.id === id) ?? null

  const getNewSubmissions = computed(() =>
    submissions.value.filter((s) => s.status === 'new')
  )
  const getRespondedSubmissions = computed(() =>
    submissions.value.filter((s) => s.status === 'responded')
  )
  const getResolvedSubmissions = computed(() =>
    submissions.value.filter((s) => s.status === 'resolved')
  )

  return {
    submissions,
    loading,
    fetchSubmissions,
    submitContactForm,
    respondToSubmission,
    resolveSubmission,
    getSubmissionById,
    getNewSubmissions,
    getRespondedSubmissions,
    getResolvedSubmissions,
  }
}
