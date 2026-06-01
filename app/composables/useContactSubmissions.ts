import { CONTACT_SUBMISSIONS, type ContactSubmission } from '~/data/contactSubmissions';

const nowIso = () => new Date().toISOString();

export function useContactSubmissions() {
  const submissions = useState<ContactSubmission[]>(
    'contact-submissions',
    () => structuredClone(CONTACT_SUBMISSIONS)
  );

  const submitContactForm = (
    name: string,
    email: string,
    subject: string,
    message: string
  ) => {
    const id = `CS-${String(submissions.value.length + 1).padStart(3, '0')}`;
    const submission: ContactSubmission = {
      id,
      name,
      email,
      subject,
      message,
      submittedAt: nowIso(),
      status: 'new',
    };
    submissions.value.unshift(submission);
    return id;
  };

  const respondToSubmission = (id: string, response: string) => {
    const submission = submissions.value.find((s) => s.id === id);
    if (!submission) return;
    submission.adminResponse = response;
    submission.respondedAt = nowIso();
    submission.status = 'responded';
  };

  const resolveSubmission = (id: string) => {
    const submission = submissions.value.find((s) => s.id === id);
    if (submission) {
      submission.status = 'resolved';
    }
  };

  const getNewSubmissions = computed(() =>
    submissions.value.filter((s) => s.status === 'new')
  );

  const getRespondedSubmissions = computed(() =>
    submissions.value.filter((s) => s.status === 'responded')
  );

  const getResolvedSubmissions = computed(() =>
    submissions.value.filter((s) => s.status === 'resolved')
  );

  const getSubmissionById = (id: string) =>
    submissions.value.find((s) => s.id === id);

  return {
    submissions,
    submitContactForm,
    respondToSubmission,
    resolveSubmission,
    getNewSubmissions,
    getRespondedSubmissions,
    getResolvedSubmissions,
    getSubmissionById,
  };
}
