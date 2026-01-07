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
  date: string
  created_at: string
}

export interface DropdownOption {
  id: string
  category: 'details' | 'type' | 'depot'
  label: string
  order: number
  created_at: string
}

export interface Submission {
  id: string
  trade_id: string
  trade_number?: number
  phone: string
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
  date: string
}

export interface DropdownFormData {
  category: 'details' | 'type' | 'depot'
  label: string
}

// Filter types
export interface SubmissionFilters {
  trade_id?: string
  depot?: string
  type?: string
}
