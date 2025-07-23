'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  FileText, 
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  PieChart,
  Database,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabaseTransactionService } from '@/lib/supabase-transactions'

interface DashboardStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  taxLiability: number
  revenueChange: number
  expensesChange: number
  profitChange: number
  taxChange: number
}

interface DashboardTransaction {
  id: string
  description: string
  amount: number
  date: string
  category: string
  type: 'income' | 'expense'
}

interface DashboardTask {
  id: string
  title: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed'
}

export default function DashboardOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<DashboardTransaction[] | null>(null)
  const [upcomingTasks, setUpcomingTasks] = useState<DashboardTask[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return
    
    setIsLoading(true)
    setError('')
    
    try {
      // Load transaction summary
      const summaryResult = await supabaseTransactionService.getTransactionSummary(user.id)
      
      if (summaryResult) {
        const totalRevenue = summaryResult.totalIncome
        const totalExpenses = summaryResult.totalExpenses
        const netProfit = totalRevenue - totalExpenses
        const estimatedTaxLiability = netProfit * 0.25 // Simplified tax calculation
        
        setStats({
          totalRevenue,
          totalExpenses,
          netProfit,
          taxLiability: estimatedTaxLiability,
          revenueChange: 0, // Would need historical data for real changes
          expensesChange: 0,
          profitChange: 0,
          taxChange: 0
        })
      }

      // Load recent transactions
      const transactionsResult = await supabaseTransactionService.getTransactions(user.id)
      if (transactionsResult.data) {
        const recent = transactionsResult.data
          .slice(0, 5)
          .map(t => ({
            id: t.id || '',
            description: t.description,
            amount: t.amount,
            date: t.date,
            category: t.ai_category || t.category || 'Uncategorized',
            type: t.type
          }))
        setRecentTransactions(recent)
      }

      // For now, no tasks are stored in Supabase, so show null
      setUpcomingTasks(null)
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
  return (
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-black">Dashboard Overview</h1>
            <p className="text-gray-500 text-sm mt-1">Loading your business data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
            <h1 className="text-2xl font-bold text-black">Dashboard Overview</h1>
            <p className="text-gray-500 text-sm mt-1">Error loading dashboard data</p>
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
          <h1 className="text-2xl font-bold text-black">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">
            {stats ? 'Welcome back! Here\'s what\'s happening with your business.' : 'No data available yet. Upload transactions to get started.'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            Export Report
          </button>
        </div>
        </div>

      {/* Stats Grid */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-black mt-1">€{stats.totalRevenue.toLocaleString()}</p>
          </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-black" />
          </div>
        </div>
            <div className="flex items-center mt-4">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium ml-1 text-green-600">
                {stats.revenueChange > 0 ? '+' : ''}{stats.revenueChange}%
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
          </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold text-black mt-1">€{stats.totalExpenses.toLocaleString()}</p>
          </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-black" />
      </div>
            </div>
            <div className="flex items-center mt-4">
              <ArrowDownRight className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium ml-1 text-red-600">
                {stats.expensesChange > 0 ? '+' : ''}{stats.expensesChange}%
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Net Profit</p>
                <p className="text-2xl font-bold text-black mt-1">€{stats.netProfit.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium ml-1 text-green-600">
                {stats.profitChange > 0 ? '+' : ''}{stats.profitChange}%
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Tax Liability</p>
                <p className="text-2xl font-bold text-black mt-1">€{stats.taxLiability.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-black" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <ArrowDownRight className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium ml-1 text-red-600">
                {stats.taxChange > 0 ? '+' : ''}{stats.taxChange}%
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Available</h3>
          <p className="text-gray-500 mb-4">Upload transaction data to see your business metrics.</p>
          <button 
            onClick={() => window.location.href = '/dashboard/tax-flow'}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Upload Data
          </button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-black">Recent Transactions</h2>
            <button 
              onClick={() => window.location.href = '/dashboard/tax-flow'}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all
            </button>
          </div>
          {recentTransactions && recentTransactions.length > 0 ? (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{transaction.category} • {transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : ''}€{Math.abs(transaction.amount).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-black">Upcoming Tasks</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all
            </button>
          </div>
          {upcomingTasks && upcomingTasks.length > 0 ? (
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-black">{task.title}</p>
                      <p className="text-xs text-gray-500 mt-1">Due: {task.dueDate}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.priority === 'high' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.status === 'pending' 
                          ? 'bg-gray-100 text-gray-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No upcoming tasks</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/dashboard/tax-flow'}
            className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <CreditCard className="w-5 h-5 text-black" />
            <span className="text-sm font-medium text-black">Upload Data</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <FileText className="w-5 h-5 text-black" />
            <span className="text-sm font-medium text-black">Create Invoice</span>
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard/tax-flow'}
            className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Calculator className="w-5 h-5 text-black" />
            <span className="text-sm font-medium text-black">Tax Calculator</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <PieChart className="w-5 h-5 text-black" />
            <span className="text-sm font-medium text-black">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  )
} 