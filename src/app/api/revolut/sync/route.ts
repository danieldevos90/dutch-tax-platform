import { NextRequest, NextResponse } from 'next/server'
import { revolutIntegration, revolutDatabase } from '@/lib/revolut-integration'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user's connection
    const connection = await revolutDatabase.getConnectionByUserId(userId)
    if (!connection) {
      return NextResponse.json(
        { error: 'No Revolut connection found' },
        { status: 404 }
      )
    }

    if (!connection.isConnected || !connection.accessToken) {
      return NextResponse.json(
        { error: 'Revolut not connected' },
        { status: 400 }
      )
    }

    // Check if token is expired and refresh if needed
    if (connection.expiresAt && new Date() > connection.expiresAt) {
      const certificate = await revolutDatabase.getCertificateByUserId(userId)
      if (!certificate || !certificate.clientId) {
        return NextResponse.json(
          { error: 'Certificate not found' },
          { status: 404 }
        )
      }

      const clientAssertion = revolutIntegration.generateClientAssertion(
        certificate.privateKey,
        certificate.clientId
      )

      const refreshResponse = await revolutIntegration.refreshAccessToken(
        connection.refreshToken!,
        clientAssertion
      )

      const expiresAt = new Date()
      expiresAt.setSeconds(expiresAt.getSeconds() + refreshResponse.expires_in)

      await revolutDatabase.updateConnection(connection.id, {
        accessToken: refreshResponse.access_token,
        expiresAt
      })

      connection.accessToken = refreshResponse.access_token
      connection.expiresAt = expiresAt
    }

    // Sync connection (get accounts)
    const syncedConnection = await revolutIntegration.syncConnection(connection)
    
    await revolutDatabase.updateConnection(connection.id, {
      accounts: syncedConnection.accounts
    })

    return NextResponse.json({
      success: true,
      accounts: syncedConnection.accounts,
      message: `Synced ${syncedConnection.accounts.length} accounts`
    })

  } catch (error) {
    console.error('Error syncing Revolut:', error)
    return NextResponse.json(
      { error: 'Failed to sync Revolut data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const accountId = searchParams.get('accountId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user's connection
    const connection = await revolutDatabase.getConnectionByUserId(userId)
    if (!connection) {
      return NextResponse.json(
        { error: 'No Revolut connection found' },
        { status: 404 }
      )
    }

    if (!connection.isConnected || !connection.accessToken) {
      return NextResponse.json(
        { error: 'Revolut not connected' },
        { status: 400 }
      )
    }

    // If accountId is provided, get transactions for that account
    if (accountId) {
      const transactions = await revolutIntegration.getTransactions(
        connection.accessToken,
        accountId
      )

      return NextResponse.json({
        success: true,
        transactions
      })
    }

    // Otherwise return connection status
    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        isConnected: connection.isConnected,
        accounts: connection.accounts,
        lastSync: connection.updatedAt
      }
    })

  } catch (error) {
    console.error('Error getting Revolut data:', error)
    return NextResponse.json(
      { error: 'Failed to get Revolut data' },
      { status: 500 }
    )
  }
} 