// import { supabase } from './supabase'

export interface Transaction {
  id?: string
  user_id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  merchant?: string
  category?: string
  notes?: string
  ai_category?: string
  ai_subcategory?: string
  is_deductible?: boolean
  deductible_percentage?: number
  vat_reclaimable?: boolean
  vat_percentage?: number
  is_kia_eligible?: boolean
  tax_implications?: string[]
  confidence?: number
  reasoning?: string
  source: 'csv_upload' | 'revolut_api'
  created_at?: string
  updated_at?: string
}

export interface TaxFlowSession {
  id?: string
  user_id: string
  business_name: string
  business_type: 'eenmanszaak' | 'bv' | 'vof' | 'maatschap'
  business_sector?: string
  annual_revenue?: number
  additional_expenses?: number
  additional_deductions?: number
  total_transactions: number
  total_amount: number
  total_deductible: number
  total_vat_reclaimable: number
  kia_eligible_amount: number
  income_tax?: number
  vat_owed?: number
  total_tax_liability?: number
  effective_tax_rate?: number
  recommendations?: string[]
  warnings?: string[]
  tax_report?: string
  created_at?: string
  updated_at?: string
}

export class SupabaseTransactionService {
  // Temporarily disabled for build
  async saveTransactions(transactions: Transaction[]): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Supabase temporarily disabled' }
  }

  async getTransactions(userId: string): Promise<{ data: Transaction[] | null; error?: string }> {
    return { data: null, error: 'Supabase temporarily disabled' }
  }

  /**
   * Save tax flow session
   */
  async saveTaxFlowSession(session: TaxFlowSession): Promise<{ success: boolean; error?: string; sessionId?: string }> {
    try {
      const { data, error } = await supabase
        .from('tax_flow_sessions')
        .insert(session)
        .select()
        .single()

      if (error) {
        console.error('Error saving tax flow session:', error)
        return { success: false, error: error.message }
      }

      return { success: true, sessionId: data.id }
    } catch (error) {
      console.error('Error saving tax flow session:', error)
      return { success: false, error: 'Failed to save tax flow session' }
    }
  }

  /**
   * Get tax flow sessions for a user
   */
  async getTaxFlowSessions(userId: string): Promise<{ data: TaxFlowSession[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('tax_flow_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching tax flow sessions:', error)
        return { data: null, error: error.message }
      }

      return { data: data || [] }
    } catch (error) {
      console.error('Error fetching tax flow sessions:', error)
      return { data: null, error: 'Failed to fetch tax flow sessions' }
    }
  }

  /**
   * Update tax flow session
   */
  async updateTaxFlowSession(sessionId: string, updates: Partial<TaxFlowSession>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('tax_flow_sessions')
        .update(updates)
        .eq('id', sessionId)

      if (error) {
        console.error('Error updating tax flow session:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating tax flow session:', error)
      return { success: false, error: 'Failed to update tax flow session' }
    }
  }

  /**
   * Delete transactions for a user
   */
  async deleteUserTransactions(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting transactions:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting transactions:', error)
      return { success: false, error: 'Failed to delete transactions' }
    }
  }

  /**
   * Get transaction summary for a user
   */
  async getTransactionSummary(userId: string): Promise<{
    totalTransactions: number
    totalAmount: number
    totalIncome: number
    totalExpenses: number
    totalDeductible: number
    totalVatReclaimable: number
    kiaEligibleAmount: number
    categories: Record<string, number>
  } | null> {
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)

      if (error || !transactions) {
        return null
      }

      const totalTransactions = transactions.length
      const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      const totalDeductible = transactions
        .filter(t => t.is_deductible)
        .reduce((sum, t) => sum + (Math.abs(t.amount) * (t.deductible_percentage || 0) / 100), 0)
      const totalVatReclaimable = transactions
        .filter(t => t.vat_reclaimable)
        .reduce((sum, t) => sum + (Math.abs(t.amount) * (t.vat_percentage || 0) / (100 + (t.vat_percentage || 0))), 0)
      const kiaEligibleAmount = transactions
        .filter(t => t.is_kia_eligible)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const categories: Record<string, number> = {}
      transactions.forEach(t => {
        const category = t.ai_category || t.category || 'uncategorized'
        categories[category] = (categories[category] || 0) + Math.abs(t.amount)
      })

      return {
        totalTransactions,
        totalAmount,
        totalIncome,
        totalExpenses,
        totalDeductible,
        totalVatReclaimable,
        kiaEligibleAmount,
        categories
      }
    } catch (error) {
      console.error('Error getting transaction summary:', error)
      return null
    }
  }
}

export const supabaseTransactionService = new SupabaseTransactionService() 