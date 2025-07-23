'use client'

import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Settings,
  RefreshCw,
  ExternalLink
} from 'lucide-react'

const accounts = [
  {
    id: 1,
    name: 'Revolut Business EUR',
    type: 'Business',
    currency: 'EUR',
    balance: 15420.50,
    iban: 'NL91ABNA0417164300',
    status: 'active',
    lastSync: '2025-01-15T10:30:00Z',
    transactions: 45,
  },
  {
    id: 2,
    name: 'Revolut Business USD',
    type: 'Business',
    currency: 'USD',
    balance: 8230.75,
    accountNo: '12345678',
    sortCode: '12-34-56',
    status: 'active',
    lastSync: '2025-01-15T10:30:00Z',
    transactions: 23,
  },
  {
    id: 3,
    name: 'Local Bank Account',
    type: 'Business',
    currency: 'EUR',
    balance: 5670.25,
    iban: 'NL02ABNA0123456789',
    status: 'active',
    lastSync: '2025-01-14T15:45:00Z',
    transactions: 12,
  },
]

const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Bank Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your connected bank accounts and balances</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Total Balance */}
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

      {/* Accounts Grid */}
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

      {/* Connection Status */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Connection Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-black">Revolut Business</p>
              <p className="text-xs text-gray-500">Connected • 2 accounts</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-black">Local Bank</p>
              <p className="text-xs text-gray-500">Connected • 1 account</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg opacity-50">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-500">More Banks</p>
              <p className="text-xs text-gray-400">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 