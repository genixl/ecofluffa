export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  status: 'new' | 'responded' | 'resolved';
  adminResponse?: string;
  respondedAt?: string;
};

export const CONTACT_SUBMISSIONS: ContactSubmission[] = [
  {
    id: 'CS-001',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    subject: 'Order Issue',
    message: 'My order EF-2048 was supposed to arrive on May 28th but I haven\'t received it yet. Can you help track it down?',
    submittedAt: '2026-05-29T10:30:00Z',
    status: 'responded',
    adminResponse: 'Hi Jane, I apologize for the delay. Your order is currently ready for pickup with Ocean Breeze Laundry. The driver will deliver it by end of day today. Thank you for your patience!',
    respondedAt: '2026-05-29T14:15:00Z',
  },
  {
    id: 'CS-002',
    name: 'Michael Johnson',
    email: 'michael.j@example.com',
    subject: 'Billing & Payments',
    message: 'I was charged twice for my recent order. Can you refund the duplicate charge?',
    submittedAt: '2026-05-30T08:45:00Z',
    status: 'new',
  },
  {
    id: 'CS-003',
    name: 'Sarah Kimani',
    email: 'sarah.kimani@example.com',
    subject: 'Provider Complaint',
    message: 'The provider damaged my dress during dry cleaning. It has a visible stain now. What\'s the claim process?',
    submittedAt: '2026-05-31T15:20:00Z',
    status: 'new',
  },
];
