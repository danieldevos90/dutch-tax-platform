'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Database,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabaseTransactionService } from '@/lib/supabase-transactions'

interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  category: string
  type: 'income' | 'expense'
  status: 'completed' | 'pending' | 'failed'
  merchant?: string
  ai_category?: string
}

const categories = [
  'All Categories',
  'Income',
  'Office Supplies',
  'Fuel',
  'Software',
  'Travel',
  'Marketing',
  'Food & Entertainment',
  'Professional Services',
  'Equipment',
  'Insurance',
  'Utilities',
  'Rent',
  'Transportation',
  'Healthcare',
  'Education',
  'Other'
]

export default function TransactionsPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedType, setSelectedType] = useState('all')

  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user])

  const loadTransactions = async () => {
    if (!user) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const result = await supabaseTransactionService.getTransactions(user.id)
      if (result.data) {
        const formattedTransactions: Transaction[] = result.data.map(t => ({
          id: t.id || '',
          description: t.description,
          amount: t.amount,
          date: t.date,
          category: t.ai_category || t.category || 'Uncategorized',
          type: t.type,
          status: 'completed' as const,
          merchant: t.merchant,
          ai_category: t.ai_category
        }))
        setTransactions(formattedTransactions)
      } else {
        setTransactions(null)
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
      setError('Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTransactions = transactions?.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         transaction.merchant?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All Categories' || transaction.category === selectedCategory
    const matchesType = selectedType === 'all' || transaction.type === selectedType
    return matchesSearch && matchesCategory && matchesType
  }) || []

  const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0
  const totalExpenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0
  const netAmount = totalIncome - totalExpenses

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Transactions</h1>
            <p className="text-gray-500 text-sm mt-1">Loading your transaction history...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Transactions</h1>
            <p className="text-gray-500 text-sm mt-1">Error loading transactions</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">
            {transactions ? `Manage your ${transactions.length} transactions` : 'No transactions found'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => window.location.href = '/dashboard/tax-flow'}
            className="px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard/tax-flow'}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {transactions && transactions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Income</p>
                <p className="text-2xl font-bold text-green-600 mt-1">€{totalIncome.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600 mt-1">€{totalExpenses.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Net Amount</p>
                <p className={`text-2xl font-bold mt-1 ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{netAmount.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Transactions Found</h3>
          <p className="text-gray-500 mb-4">Upload transaction data to see your transaction history.</p>
          <button 
            onClick={() => window.location.href = '/dashboard/tax-flow'}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Upload Data
          </button>
        </div>
      )}

      {/* Filters and Search */}
      {transactions && transactions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      {transactions && transactions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-black">
              {filteredTransactions.length} of {transactions.length} transactions
            </h2>
          </div>
          
          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black">{transaction.description}</p>
                        <p className="text-xs text-gray-500">
                          {transaction.merchant && `${transaction.merchant} • `}
                          {transaction.category} • {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : ''}€{Math.abs(transaction.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{transaction.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No transactions match your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 