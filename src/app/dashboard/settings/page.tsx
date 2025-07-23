'use client'

import { useState, useEffect } from 'react'
import { User, Building, Globe, Shield, CreditCard, Trash2, ExternalLink, CheckCircle, AlertCircle, RefreshCw, Copy, Download } from 'lucide-react'

interface RevolutAccount {
  id: string
  name: string
  currency: string
  balance: number
  iban?: string
  bic?: string
  account_no?: string
  sort_code?: string
  state: 'active' | 'inactive'
  public: boolean
  created_at: string
  updated_at: string
}

interface RevolutConnection {
  id: string
  isConnected: boolean
  accounts: RevolutAccount[]
  lastSync?: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [revolutConnection, setRevolutConnection] = useState<RevolutConnection | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)
  const [certificateData, setCertificateData] = useState<any>(null)
  const [clientId, setClientId] = useState('')
  const [step, setStep] = useState<'initial' | 'certificate' | 'authorize' | 'connected'>('initial')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Mock user ID (replace with actual user authentication)
  const userId = 'user_123'

  useEffect(() => {
    // Check URL parameters for OAuth callback results
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')
    const successParam = urlParams.get('success')

    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
    if (successParam) {
      setSuccess(decodeURIComponent(successParam))
      setStep('connected')
    }

    // Load existing connection
    loadRevolutConnection()
  }, [])

  const loadRevolutConnection = async () => {
    try {
      const response = await fetch(`/api/revolut/sync?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRevolutConnection(data.connection)
          if (data.connection.isConnected) {
            setStep('connected')
          }
        }
      }
    } catch (error) {
      console.error('Error loading Revolut connection:', error)
    }
  }

  const handleConnectRevolut = async () => {
    setIsConnecting(true)
    setError('')

    try {
      const response = await fetch('/api/revolut/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      const data = await response.json()
      
      if (data.success) {
        setCertificateData(data.certificate)
        setStep('certificate')
      } else {
        setError(data.error || 'Failed to initialize connection')
      }
    } catch (error) {
      setError('Failed to connect to Revolut')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleAuthorize = async () => {
    if (!clientId.trim()) {
      setError('Please enter your Client ID')
      return
    }

    setIsConnecting(true)
    setError('')

    try {
      const response = await fetch('/api/revolut/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, clientId })
      })

      const data = await response.json()
      
      if (data.success) {
        // Redirect to Revolut OAuth
        window.location.href = data.authUrl
      } else {
        setError(data.error || 'Failed to create authorization URL')
      }
    } catch (error) {
      setError('Failed to authorize with Revolut')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSyncAccounts = async () => {
    setIsSyncing(true)
    setError('')

    try {
      const response = await fetch('/api/revolut/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      const data = await response.json()
      
      if (data.success) {
        setRevolutConnection(prev => prev ? {
          ...prev,
          accounts: data.accounts
        } : null)
        setSuccess(data.message)
      } else {
        setError(data.error || 'Failed to sync accounts')
      }
    } catch (error) {
      setError('Failed to sync accounts')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDisconnectRevolut = async () => {
    setRevolutConnection(null)
    setStep('initial')
    setCertificateData(null)
    setClientId('')
    setSuccess('Revolut disconnected successfully')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copied to clipboard!')
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'business', name: 'Business Info', icon: Building },
    { id: 'integrations', name: 'Integrations', icon: Globe },
    { id: 'security', name: 'Security', icon: Shield },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Configure your account settings and integrations</p>
        </div>
        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
          Save Changes
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-gray-100 text-black' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold text-black mb-6">Profile Settings</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Daniel"
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="daniel@altfawesome.com"
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
              <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold text-black mb-6">Business Information</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Company Name</label>
                  <input
                    type="text"
                    defaultValue="AltfAwesome"
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">KVK Number</label>
                  <input
                    type="text"
                    defaultValue="12345678"
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">BTW Number</label>
                  <input
                    type="text"
                    defaultValue="NL123456789B01"
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Business Address</label>
                  <input
                    type="text"
                    defaultValue="123 Business Street, Amsterdam"
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
              <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-6">
            {/* Revolut Integration */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black">Revolut Business</h3>
                    <p className="text-gray-500 text-sm">Connect your Revolut Business account to import transactions</p>
                  </div>
                </div>
                {revolutConnection?.isConnected ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                ) : (
                  <button
                    onClick={handleConnectRevolut}
                    disabled={isConnecting}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                    <span>{isConnecting ? 'Connecting...' : 'Connect'}</span>
                  </button>
                )}
              </div>

              {step === 'certificate' && certificateData && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-blue-800 font-medium mb-2">Step 1: Upload Certificate to Revolut</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                      {certificateData.instructions.map((instruction: string, index: number) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-black font-medium">Public Certificate</h4>
                      <button
                        onClick={() => copyToClipboard(certificateData.publicKey)}
                        className="flex items-center space-x-1 text-gray-600 hover:text-black"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">Copy</span>
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={certificateData.publicKey}
                      className="w-full h-32 px-3 py-2 bg-white border border-gray-300 text-black rounded text-xs font-mono resize-none"
                    />
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-black font-medium mb-2">Step 2: Enter Client ID</h4>
                    <p className="text-gray-600 text-sm mb-3">After uploading the certificate, enter the Client ID provided by Revolut:</p>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="Enter your Client ID"
                        className="flex-1 px-4 py-2 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                      <button
                        onClick={handleAuthorize}
                        disabled={!clientId.trim() || isConnecting}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {isConnecting ? 'Connecting...' : 'Authorize'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {revolutConnection?.isConnected && (
                <div className="space-y-6">
                  {/* Connection Status */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-medium">Successfully Connected</span>
                      </div>
                      <button
                        onClick={handleSyncAccounts}
                        disabled={isSyncing}
                        className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm"
                      >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <p className="text-black mt-1">Active</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Accounts:</span>
                        <p className="text-black mt-1">{revolutConnection.accounts.length} connected</p>
                      </div>
                    </div>
                  </div>

                  {/* Connected Accounts */}
                  {revolutConnection.accounts.length > 0 && (
                    <div>
                      <h4 className="text-black font-medium mb-3">Connected Accounts</h4>
                      <div className="space-y-3">
                        {revolutConnection.accounts.map((account) => (
                          <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${account.state === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <div>
                                <p className="text-black font-medium">{account.name}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>{account.currency}</span>
                                  <span>€{account.balance.toLocaleString()}</span>
                                  {account.iban && <span>IBAN: {account.iban}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                Last sync: {account.updated_at ? new Date(account.updated_at).toLocaleDateString() : 'Never'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleDisconnectRevolut}
                    className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Disconnect Revolut
                  </button>
                </div>
              )}
            </div>

            {/* Other Integrations Placeholder */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 opacity-50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">More Integrations Coming Soon</h3>
                  <p className="text-gray-500 text-sm">We're working on adding more bank integrations</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold text-black mb-6">Security Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                <div>
                  <h3 className="text-black font-medium">Two-Factor Authentication</h3>
                  <p className="text-gray-500 text-sm">Add an extra layer of security to your account</p>
                </div>
                <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                  Enable
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                <div>
                  <h3 className="text-black font-medium">Change Password</h3>
                  <p className="text-gray-500 text-sm">Update your account password</p>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors">
                  Change
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 