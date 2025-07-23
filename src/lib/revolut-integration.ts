import jwt from 'jsonwebtoken'
import forge from 'node-forge'

export interface RevolutCertificate {
  id: string
  userId: string
  privateKey: string
  publicKey: string
  clientId?: string
  createdAt: Date
  updatedAt: Date
}

export interface RevolutConnection {
  id: string
  userId: string
  certificateId: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: Date
  isConnected: boolean
  accounts: RevolutAccount[]
  createdAt: Date
  updatedAt: Date
}

export interface RevolutAccount {
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

export interface RevolutTransaction {
  id: string
  type: string
  request_id: string
  state: string
  reason_code?: string
  created_at: string
  updated_at: string
  completed_at?: string
  scheduled_for?: string
  related_transaction_id?: string
  reference: string
  legs: RevolutTransactionLeg[]
  merchant?: RevolutMerchant
  counterparty?: RevolutCounterparty
  amount: number
  currency: string
  fee: number
  balance: number
  description: string
}

export interface RevolutTransactionLeg {
  leg_id: string
  account_id: string
  amount: number
  currency: string
  balance: number
  description: string
  bill_amount?: number
  bill_currency?: string
}

export interface RevolutMerchant {
  name: string
  city?: string
  category_code?: string
  category?: string
  country?: string
  mcc?: number
}

export interface RevolutCounterparty {
  id: string
  name: string
  phone?: string
  profile_type: string
  country?: string
  state?: string
  created_at: string
  updated_at: string
}

export class RevolutIntegration {
  private readonly API_BASE_URL = 'https://b2b.revolut.com/api/1.0'
  private readonly SANDBOX_API_BASE_URL = 'https://sandbox-b2b.revolut.com/api/1.0'

  constructor(private isSandbox: boolean = true) {}

  /**
   * Generate RSA key pair for a user
   */
  async generateCertificate(userId: string): Promise<RevolutCertificate> {
    const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 })
    
    // Generate private key in PEM format
    const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey)
    
    // Generate public key certificate
    const cert = forge.pki.createCertificate()
    cert.publicKey = keypair.publicKey
    cert.serialNumber = '01'
    cert.validity.notBefore = new Date()
    cert.validity.notAfter = new Date()
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 5)
    
    // Set certificate attributes
    const attrs = [
      { name: 'commonName', value: 'dutch-tax-platform.com' },
      { name: 'countryName', value: 'NL' },
      { name: 'stateOrProvinceName', value: 'North Holland' },
      { name: 'localityName', value: 'Amsterdam' },
      { name: 'organizationName', value: 'DutchTax Platform' },
      { name: 'organizationalUnitName', value: 'Development' }
    ]
    
    cert.setSubject(attrs)
    cert.setIssuer(attrs)
    
    // Self-sign the certificate
    cert.sign(keypair.privateKey, forge.md.sha256.create())
    
    // Convert to PEM format
    const publicKeyPem = forge.pki.certificateToPem(cert)
    
    return {
      id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      privateKey: privateKeyPem,
      publicKey: publicKeyPem,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Generate JWT client assertion for OAuth
   */
  generateClientAssertion(
    privateKey: string,
    clientId: string,
    issuer: string = 'dutch-tax-platform.com'
  ): string {
    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iss: issuer,
      sub: clientId,
      aud: 'https://revolut.com',
      exp: now + 3600, // 1 hour expiration
      iat: now
    }

    return jwt.sign(payload, privateKey, { 
      algorithm: 'RS256',
      header: {
        alg: 'RS256',
        typ: 'JWT'
      }
    })
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    code: string,
    clientAssertion: string
  ): Promise<{ access_token: string; token_type: string; expires_in: number; refresh_token: string }> {
    const baseUrl = this.isSandbox ? this.SANDBOX_API_BASE_URL : this.API_BASE_URL
    
    const response = await fetch(`${baseUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: clientAssertion
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to exchange code for token: ${error}`)
    }

    return response.json()
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(
    refreshToken: string,
    clientAssertion: string
  ): Promise<{ access_token: string; token_type: string; expires_in: number }> {
    const baseUrl = this.isSandbox ? this.SANDBOX_API_BASE_URL : this.API_BASE_URL
    
    const response = await fetch(`${baseUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: clientAssertion
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to refresh token: ${error}`)
    }

    return response.json()
  }

  /**
   * Get user's Revolut accounts
   */
  async getAccounts(accessToken: string): Promise<RevolutAccount[]> {
    const baseUrl = this.isSandbox ? this.SANDBOX_API_BASE_URL : this.API_BASE_URL
    
    const response = await fetch(`${baseUrl}/accounts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get accounts: ${error}`)
    }

    return response.json()
  }

  /**
   * Get transactions for an account
   */
  async getTransactions(
    accessToken: string,
    accountId: string,
    from?: string,
    to?: string,
    count: number = 100
  ): Promise<RevolutTransaction[]> {
    const baseUrl = this.isSandbox ? this.SANDBOX_API_BASE_URL : this.API_BASE_URL
    
    const params = new URLSearchParams({
      count: count.toString()
    })
    
    if (from) params.append('from', from)
    if (to) params.append('to', to)

    const response = await fetch(`${baseUrl}/accounts/${accountId}/transactions?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get transactions: ${error}`)
    }

    return response.json()
  }

  /**
   * Get account details
   */
  async getAccount(accessToken: string, accountId: string): Promise<RevolutAccount> {
    const baseUrl = this.isSandbox ? this.SANDBOX_API_BASE_URL : this.API_BASE_URL
    
    const response = await fetch(`${baseUrl}/accounts/${accountId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get account: ${error}`)
    }

    return response.json()
  }

  /**
   * Create OAuth authorization URL
   */
  createAuthorizationUrl(clientId: string, redirectUri: string, state?: string): string {
    const baseUrl = this.isSandbox ? 'https://sandbox-business.revolut.com' : 'https://business.revolut.com'
    
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri
    })
    
    if (state) params.append('state', state)
    
    return `${baseUrl}/app/oauth/authorize?${params}`
  }

  /**
   * Validate access token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getAccounts(accessToken)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get connection status and sync accounts
   */
  async syncConnection(connection: RevolutConnection): Promise<RevolutConnection> {
    if (!connection.accessToken) {
      throw new Error('No access token available')
    }

    // Check if token is expired
    if (connection.expiresAt && new Date() > connection.expiresAt) {
      // Token expired, need to refresh
      throw new Error('Access token expired, refresh required')
    }

    // Get accounts
    const accounts = await this.getAccounts(connection.accessToken)
    
    return {
      ...connection,
      accounts,
      updatedAt: new Date()
    }
  }
}

// Database simulation (replace with your actual database)
export class RevolutDatabase {
  private certificates: Map<string, RevolutCertificate> = new Map()
  private connections: Map<string, RevolutConnection> = new Map()

  async saveCertificate(certificate: RevolutCertificate): Promise<void> {
    this.certificates.set(certificate.id, certificate)
  }

  async getCertificate(id: string): Promise<RevolutCertificate | null> {
    return this.certificates.get(id) || null
  }

  async getCertificateByUserId(userId: string): Promise<RevolutCertificate | null> {
    for (const cert of this.certificates.values()) {
      if (cert.userId === userId) {
        return cert
      }
    }
    return null
  }

  async saveConnection(connection: RevolutConnection): Promise<void> {
    this.connections.set(connection.id, connection)
  }

  async getConnection(id: string): Promise<RevolutConnection | null> {
    return this.connections.get(id) || null
  }

  async getConnectionByUserId(userId: string): Promise<RevolutConnection | null> {
    for (const conn of this.connections.values()) {
      if (conn.userId === userId) {
        return conn
      }
    }
    return null
  }

  async updateConnection(id: string, updates: Partial<RevolutConnection>): Promise<void> {
    const connection = this.connections.get(id)
    if (connection) {
      this.connections.set(id, { ...connection, ...updates, updatedAt: new Date() })
    }
  }
}

// Export singleton instances
export const revolutIntegration = new RevolutIntegration(true) // Sandbox mode
export const revolutDatabase = new RevolutDatabase() 