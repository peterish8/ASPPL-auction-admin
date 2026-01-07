// Database Types - matching Supabase schema

export interface Trade {
  id: string
  trade_number: string
  trade_date: string
  is_active: boolean
  created_at: string
}

export interface PoolingSchedule {
  id: string
  trade_id: string
  location: string
  pooling_date: string
  order_index: number
  created_at: string
}

export interface DropdownOption {
  id: string
  category: 'details' | 'type' | 'depot'
  label: string
  is_active: boolean
  order_index: number
  created_at: string
}

export interface Submission {
  id: string
  trade_number: string
  phone_number: string
  device_fingerprint?: string
  name: string
  details: string
  weight: number
  type: string
  depot: string
  submitted_at: string
}

// Form types
export interface TradeFormData {
  trade_number: string
  trade_date: string
  is_active: boolean
}

export interface PoolingFormData {
  location: string
  pooling_date: string
}

export interface DropdownFormData {
  category: 'details' | 'type' | 'depot'
  label: string
}

// Filter types
export interface SubmissionFilters {
  trade_number?: string
  depot?: string
  type?: string
}
