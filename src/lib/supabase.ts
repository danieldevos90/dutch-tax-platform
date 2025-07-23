import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create client if environment variables are available
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Types for database tables
export interface Transaction {
  id: string
  user_id: string
  amount: number
  currency: string
  description: string
  category: string
  subcategory?: string
  date: string
  bank_reference?: string
  merchant?: string
  is_deductible: boolean
  deductible_percentage: number
  vat_amount?: number
  vat_reclaimable: boolean
  is_kia_eligible: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  user_id: string
  invoice_number: string
  client_name: string
  client_email: string
  client_address?: string
  amount: number
  vat_amount: number
  total_amount: number
  currency: string
  description: string
  due_date: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  pdf_url?: string
  payment_reference?: string
  created_at: string
  updated_at: string
  paid_at?: string
}

export interface TaxCalculation {
  id: string
  user_id: string
  year: number
  total_revenue: number
  total_expenses: number
  profit: number
  zelfstandigenaftrek: number
  startersaftrek: number
  mkb_winstvrijstelling: number
  kia_deduction: number
  taxable_profit: number
  income_tax: number
  vat_due: number
  vat_reclaimable: number
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  company_name?: string
  kvk_number?: string
  btw_number?: string
  address?: string
  phone?: string
  first_year_business?: number
  kor_opted_in: boolean
  created_at: string
  updated_at: string
} 