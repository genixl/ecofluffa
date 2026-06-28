// Supabase Database Types for Ecofluffa
export type OrderStatus = 'pending' | 'washing' | 'ready' | 'delivered' | 'cancelled'
export type UserRole = 'customer' | 'provider' | 'admin'
export type ContactStatus = 'new' | 'responded' | 'resolved'
export type ActivityType = 'status' | 'message' | 'booking' | 'admin'
export type ApprovalStatus = 'pending' | 'approved' | 'disabled'
export type ServiceApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface Profile {
  id: string
  full_name: string
  phone: string
  alternate_phone?: string
  preferred_pickup_notes?: string
  role: UserRole
  provider_id: string | null
  created_at: string
}

export interface Provider {
  id: string
  name: string
  location: string
  pickup_fee: string
  rating: number
  review_count: number
  phone: string
  is_listed: boolean
  approval_status?: ApprovalStatus
  created_at: string
}

export const PROVIDER_PLACEHOLDER_LOCATION = 'Update your location'

export interface Service {
  id: string // UUID
  title: string
  category: string
  price_label: string
  description: string
  turnaround: string
  popular: boolean
  provider_id: string | null // set for provider-owned custom services only
  approval_status?: ServiceApprovalStatus
  created_at: string
}

export function isCatalogService(service: Service) {
  return service.provider_id == null
}

export function isServiceVisibleToCustomers(service: Service) {
  if (isCatalogService(service)) return true
  return (service.approval_status ?? 'approved') === 'approved'
}

export interface ProviderService {
  id: string
  provider_id: string
  service_id: string
  price: string
  unit: string
  turnaround: string
  created_at: string
  // joined
  provider?: Provider
  service?: Service
}

export interface Order {
  id: string
  customer_id: string
  provider_id: string
  status: OrderStatus
  pickup_date: string
  pickup_time: string
  pickup_address: string
  customer_name?: string
  customer_phone?: string
  notes: string
  total_estimate: string
  created_at: string
  // joined
  customer?: Profile
  provider?: Provider
  order_services?: OrderService[]
}

export interface OrderService {
  id: string
  order_id: string
  title: string
  price: string
  description: string
  created_at: string
}

export interface OrderMessage {
  id: string
  order_id: string
  from_role: UserRole
  sender_name: string
  body: string
  created_at: string
}

export interface OrderActivity {
  id: string
  order_id: string
  type: ActivityType
  title: string
  detail: string
  actor_role: UserRole
  actor_name: string
  created_at: string
}

export interface Rating {
  id: string
  order_id: string
  provider_id: string
  customer_id: string
  score: number        // 1–5
  comment: string
  created_at: string
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: ContactStatus
  admin_response: string | null
  responded_at: string | null
  created_at: string
}

// Order flow
export const ORDER_FLOW: OrderStatus[] = ['pending', 'washing', 'ready', 'delivered']

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  washing: 'Washing',
  ready: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const SERVICE_CATEGORIES = ['All', 'Everyday', 'Premium', 'Specialty'] as const
