
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string
          role: 'customer' | 'provider' | 'admin'
          provider_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string
          phone?: string
          role?: 'customer' | 'provider' | 'admin'
          provider_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string
          role?: 'customer' | 'provider' | 'admin'
          provider_id?: string | null
        }
      }
      providers: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          location: string
          pickup_fee?: string
          rating?: number
          review_count?: number
          phone?: string
          is_listed?: boolean
        }
        Update: {
          name?: string
          location?: string
          pickup_fee?: string
          rating?: number
          review_count?: number
          phone?: string
          is_listed?: boolean
        }
      }
      services: {
        Row: {
          id: string
          title: string
          category: string
          price_label: string
          description: string
          turnaround: string
          popular: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          category?: string
          price_label?: string
          description?: string
          turnaround?: string
          popular?: boolean
        }
        Update: {
          title?: string
          category?: string
          price_label?: string
          description?: string
          turnaround?: string
          popular?: boolean
        }
      }
      provider_services: {
        Row: {
          id: string
          provider_id: string
          service_id: string
          price: string
          unit: string
          turnaround: string
          created_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          service_id: string
          price?: string
          unit?: string
          turnaround?: string
        }
        Update: {
          price?: string
          unit?: string
          turnaround?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string
          provider_id: string
          status: 'pending' | 'washing' | 'ready' | 'delivered' | 'cancelled'
          pickup_date: string
          pickup_time: string
          pickup_address: string
          notes: string
          total_estimate: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          provider_id: string
          status?: 'pending' | 'washing' | 'ready' | 'delivered' | 'cancelled'
          pickup_date: string
          pickup_time: string
          pickup_address: string
          notes?: string
          total_estimate?: string
        }
        Update: {
          status?: 'pending' | 'washing' | 'ready' | 'delivered' | 'cancelled'
          pickup_time?: string
          pickup_date?: string
          pickup_address?: string
          notes?: string
        }
      }
      order_services: {
        Row: {
          id: string
          order_id: string
          title: string
          price: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          title: string
          price?: string
          description?: string
        }
        Update: {
          title?: string
          price?: string
          description?: string
        }
      }
      order_activities: {
        Row: {
          id: string
          order_id: string
          type: 'status' | 'message' | 'booking' | 'admin'
          title: string
          detail: string
          actor_role: 'customer' | 'provider' | 'admin'
          actor_name: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          type: 'status' | 'message' | 'booking' | 'admin'
          title: string
          detail?: string
          actor_role: 'customer' | 'provider' | 'admin'
          actor_name: string
        }
        Update: {
          type?: string
          title?: string
          detail?: string
        }
      }
      order_messages: {
        Row: {
          id: string
          order_id: string
          from_role: 'customer' | 'provider' | 'admin'
          sender_name: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          from_role: 'customer' | 'provider' | 'admin'
          sender_name: string
          body: string
        }
        Update: {
          body?: string
        }
      }
      ratings: {
        Row: {
          id: string
          order_id: string
          provider_id: string
          customer_id: string
          score: number
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          provider_id: string
          customer_id: string
          score: number
          comment?: string
        }
        Update: {
          score?: number
          comment?: string
        }
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          subject: string
          message: string
          status: 'new' | 'responded' | 'resolved'
          admin_response: string | null
          responded_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          subject?: string
          message: string
          status?: 'new' | 'responded' | 'resolved'
          admin_response?: string | null
        }
        Update: {
          status?: 'new' | 'responded' | 'resolved'
          admin_response?: string | null
          responded_at?: string | null
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          address: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string
          address: string
          is_default?: boolean
        }
        Update: {
          label?: string
          address?: string
          is_default?: boolean
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
