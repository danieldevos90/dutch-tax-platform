'use client'

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
  PieChart
} from 'lucide-react'

const stats = [
  {
    name: 'Total Revenue',
    value: '€45,231',
    change: '+20.1%',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    name: 'Total Expenses',
    value: '€23,456',
    change: '+5.2%',
    changeType: 'negative',
    icon: CreditCard,
  },
  {
    name: 'Net Profit',
    value: '€21,775',
    change: '+12.3%',
    changeType: 'positive',
    icon: TrendingUp,
  },
  {
    name: 'Tax Liability',
    value: '€6,532',
    change: '-2.1%',
    changeType: 'positive',
    icon: Calculator,
  },
]

const recentTransactions = [
  {
    id: 1,
    description: 'Office Supplies - Staples',
    amount: -89.50,
    date: '2025-01-15',
    category: 'Office Supplies',
    type: 'expense',
  },
  {
    id: 2,
    description: 'Client Payment - Project Alpha',
    amount: 2500.00,
    date: '2025-01-14',
    category: 'Income',
    type: 'income',
  },
  {
    id: 3,
    description: 'Fuel - Shell Station',
    amount: -65.20,
    date: '2025-01-13',
    category: 'Fuel',
    type: 'expense',
  },
  {
    id: 4,
    description: 'Software Subscription - Adobe',
    amount: -29.99,
    date: '2025-01-12',
    category: 'Software',
    type: 'expense',
  },
  {
    id: 5,
    description: 'Consulting Fee - Client Beta',
    amount: 1800.00,
    date: '2025-01-11',
    category: 'Income',
    type: 'income',
  },
]

const upcomingTasks = [
  {
    id: 1,
    title: 'Q4 BTW Filing',
    dueDate: '2025-01-31',
    priority: 'high',
    status: 'pending',
  },
  {
    id: 2,
    title: 'Annual Tax Return',
    dueDate: '2025-03-01',
    priority: 'high',
    status: 'pending',
  },
  {
    id: 3,
    title: 'MKB Winstvrijstelling Review',
    dueDate: '2025-02-15',
    priority: 'medium',
    status: 'in-progress',
  },
]

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening with your business.</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-black mt-1">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-black" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ml-1 ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-black">Recent Transactions</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all
            </button>
          </div>
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
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-black">Upcoming Tasks</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all
            </button>
          </div>
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
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <CreditCard className="w-5 h-5 text-black" />
            <span className="text-sm font-medium text-black">Add Transaction</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <FileText className="w-5 h-5 text-black" />
            <span className="text-sm font-medium text-black">Create Invoice</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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