// Supabase Database Types for Ecofluffa
export type OrderStatus = 'pending' | 'washing' | 'ready' | 'delivered' | 'cancelled'
export type UserRole = 'customer' | 'provider' | 'admin'
export type ContactStatus = 'new' | 'responded' | 'resolved'
export type ActivityType = 'status' | 'message' | 'booking' | 'admin'

export interface Profile {
  id: string
  full_name: string
  phone: string
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
  created_at: string
}

export const PROVIDER_PLACEHOLDER_LOCATION = 'Update your location'

export interface Service {
  id: string
  title: string
  category: string
  price_label: string
  description: string
  turnaround: string
  popular: boolean
  created_at: string
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
