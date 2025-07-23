// Revolut Business API Integration
// Based on: https://developer.revolut.com/docs/business/get-account-details

export interface RevolutAccount {
  id: string
  name: string
  currency: string
  balance: number
  iban?: string
  bic?: string
  account_no?: string
  sort_code?: string
  routing_number?: string
  beneficiary: string
  beneficiary_address: {
    street_line1?: string
    street_line2?: string
    region?: string
    city?: string
    country: string
    postcode: string
  }
  bank_country?: string
  pooled?: boolean
  unique_reference?: string
  schemes: string[]
  estimated_time: {
    unit: 'days' | 'hours'
    min: number
    max: number
  }
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: string
}

export interface RevolutConnection {
  isConnected: boolean
  accessToken?: string
  refreshToken?: string
  expiresAt?: string
  accounts: RevolutAccount[]
}

export interface RevolutTransaction {
  id: string
  type: 'card_payment' | 'atm' | 'transfer' | 'exchange' | 'topup' | 'fee'
  state: 'pending' | 'completed' | 'failed' | 'cancelled'
  amount: number
  currency: string
  fee: number
  balance: number
  description: string
  merchant?: {
    name: string
    city?: string
    country?: string
    category?: string
  }
  counterparty?: {
  id: string
  name: string
    phone?: string
  country?: string
  }
  created_at: string
  updated_at: string
}

class RevolutAPI {
  private baseUrl = 'https://business.revolut.com/api/1.0'
  private accessToken?: string
  private refreshToken?: string

  constructor() {
    // Load tokens from localStorage or environment
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('revolut_access_token') || undefined
      this.refreshToken = localStorage.getItem('revolut_refresh_token') || undefined
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.accessToken) {
      throw new Error('No access token available')
    }

    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      // Token expired, try to refresh
      await this.refreshAccessToken()
      // Retry the request with new token
      headers.Authorization = `Bearer ${this.accessToken}`
      const retryResponse = await fetch(url, {
        ...options,
        headers,
      })
      
      if (!retryResponse.ok) {
        throw new Error(`Revolut API error: ${retryResponse.status}`)
      }
      
      return retryResponse.json()
    }

    if (!response.ok) {
      throw new Error(`Revolut API error: ${response.status}`)
    }

    return response.json()
  }

  private async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
  }

    // In a real implementation, you would make a request to refresh the token
    // For now, we'll simulate this
    console.log('Refreshing access token...')
    
    // Simulate token refresh
    const newAccessToken = `refreshed_token_${Date.now()}`
    const newExpiresAt = new Date(Date.now() + 40 * 60 * 1000).toISOString()
    
    this.accessToken = newAccessToken
    this.saveTokens(newAccessToken, this.refreshToken, newExpiresAt)
  }

  private saveTokens(accessToken: string, refreshToken: string, expiresAt: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('revolut_access_token', accessToken)
      localStorage.setItem('revolut_refresh_token', refreshToken)
      localStorage.setItem('revolut_expires_at', expiresAt)
    }
  }

  // Get all accounts
  async getAccounts(): Promise<RevolutAccount[]> {
    try {
      const accounts = await this.makeRequest('/accounts')
      return accounts.map((account: Record<string, unknown>) => ({
        ...account,
        status: 'connected' as const,
        lastSync: new Date().toISOString(),
      }))
    } catch (error) {
      console.error('Error fetching Revolut accounts:', error)
      throw error
    }
  }

  // Get account details including bank details
  async getAccountBankDetails(accountId: string): Promise<RevolutAccount> {
    try {
      const account = await this.makeRequest(`/accounts/${accountId}/bank-details`)
      return {
        ...account,
        status: 'connected' as const,
        lastSync: new Date().toISOString(),
    }
    } catch (error) {
      console.error('Error fetching account bank details:', error)
      throw error
    }
  }

  // Get transactions for an account
  async getTransactions(accountId: string, from?: string, to?: string): Promise<RevolutTransaction[]> {
    try {
      const params = new URLSearchParams()
      if (from) params.append('from', from)
      if (to) params.append('to', to)
      
      const transactions = await this.makeRequest(`/accounts/${accountId}/transactions?${params}`)
      return transactions
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }
  }

  // Connect to Revolut (simulate OAuth flow)
  async connect(clientId: string, clientSecret: string): Promise<RevolutConnection> {
    try {
      // In a real implementation, this would handle the OAuth flow
      // For now, we'll simulate a successful connection
      
      const mockAccessToken = `access_token_${Date.now()}`
      const mockRefreshToken = `refresh_token_${Date.now()}`
      const expiresAt = new Date(Date.now() + 40 * 60 * 1000).toISOString()
      
      this.accessToken = mockAccessToken
      this.refreshToken = mockRefreshToken
      this.saveTokens(mockAccessToken, mockRefreshToken, expiresAt)
      
      // Fetch accounts after connection
      const accounts = await this.getAccounts()
  
  return {
        isConnected: true,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        expiresAt,
        accounts,
      }
    } catch (error) {
      console.error('Error connecting to Revolut:', error)
      throw error
  }
}

  // Disconnect from Revolut
  disconnect() {
    this.accessToken = undefined
    this.refreshToken = undefined
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('revolut_access_token')
      localStorage.removeItem('revolut_refresh_token')
      localStorage.removeItem('revolut_expires_at')
    }
  }

  // Check if connected
  isConnected(): boolean {
    return !!this.accessToken
  }

  // Get connection status
  getConnectionStatus(): RevolutConnection {
    return {
      isConnected: this.isConnected(),
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiresAt: typeof window !== 'undefined' ? localStorage.getItem('revolut_expires_at') || undefined : undefined,
      accounts: [],
    }
  }
}

// Export singleton instance
export const revolutAPI = new RevolutAPI()

// Helper functions for the UI
export const connectRevolut = async (clientId: string, clientSecret: string) => {
  return await revolutAPI.connect(clientId, clientSecret)
}

export const disconnectRevolut = () => {
  revolutAPI.disconnect()
}

export const getRevolutAccounts = async () => {
  return await revolutAPI.getAccounts()
}

export const getRevolutTransactions = async (accountId: string, from?: string, to?: string) => {
  return await revolutAPI.getTransactions(accountId, from, to)
} 