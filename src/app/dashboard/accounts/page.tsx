'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Settings,
  RefreshCw,
  ExternalLink,
  Database,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

interface BankAccount {
  id: string
  name: string
  type: 'Business' | 'Personal'
  currency: string
  balance: number
  iban?: string
  accountNo?: string
  sortCode?: string
  status: 'active' | 'inactive'
  lastSync: string
  transactions: number
}

export default function AccountsPage() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<BankAccount[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadAccounts()
    }
  }, [user])

  const loadAccounts = async () => {
    if (!user) return
    
    setIsLoading(true)
    setError('')
    
    try {
      // For now, no bank accounts are stored in Supabase, so show null
      // In a real implementation, you would fetch from Supabase
      setAccounts(null)
    } catch (error) {
      console.error('Error loading accounts:', error)
      setError('Failed to load accounts')
    } finally {
      setIsLoading(false)
    }
  }

  const totalBalance = accounts?.reduce((sum, account) => sum + account.balance, 0) || 0
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Bank Accounts</h1>
            <p className="text-gray-500 text-sm mt-1">Loading your accounts...</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Bank Accounts</h1>
            <p className="text-gray-500 text-sm mt-1">Error loading accounts</p>
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
          <h1 className="text-2xl font-bold text-black">Bank Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">
            {accounts ? `Manage your ${accounts.length} connected bank accounts` : 'No accounts connected'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard/settings'}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Total Balance */}
      {accounts && accounts.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Balance</p>
              <p className="text-3xl font-bold text-black mt-1">€{totalBalance.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Across {accounts.length} accounts</p>
            </div>
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-black" />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Bank Accounts Connected</h3>
          <p className="text-gray-500 mb-4">Connect your bank accounts to automatically sync transactions.</p>
          <button 
            onClick={() => window.location.href = '/dashboard/settings'}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Connect Account
          </button>
        </div>
      )}

      {/* Accounts Grid */}
      {accounts && accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
          <div key={account.id} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#00D2FF] rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">{account.name}</h3>
                  <p className="text-sm text-gray-500">{account.type} Account</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  account.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {account.status}
                </span>
                <button className="text-gray-400 hover:text-black">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Balance</span>
                <span className="text-lg font-bold text-black">
                  {account.currency} {account.balance.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Account Details</span>
                <span className="text-sm text-gray-700">
                  {account.iban ? account.iban : `${account.accountNo} / ${account.sortCode}`}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Transactions</span>
                <span className="text-sm font-medium text-black">{account.transactions}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Last Sync</span>
                <span className="text-sm text-gray-700">
                  {new Date(account.lastSync).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button className="flex-1 px-3 py-2 text-sm border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors">
                  View Transactions
                </button>
                <button className="px-3 py-2 text-sm border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  )
} 