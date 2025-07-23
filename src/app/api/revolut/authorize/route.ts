import { NextRequest, NextResponse } from 'next/server'
import { revolutIntegration, revolutDatabase } from '@/lib/revolut-integration'

export async function POST(request: NextRequest) {
  try {
    const { userId, clientId } = await request.json()

    if (!userId || !clientId) {
      return NextResponse.json(
        { error: 'User ID and Client ID are required' },
        { status: 400 }
      )
    }

    // Get user's certificate
    const certificate = await revolutDatabase.getCertificateByUserId(userId)
    if (!certificate) {
      return NextResponse.json(
        { error: 'No certificate found for user' },
        { status: 404 }
      )
    }

    // Update certificate with client ID
    certificate.clientId = clientId
    certificate.updatedAt = new Date()
    await revolutDatabase.saveCertificate(certificate)

    // Generate client assertion JWT
    const clientAssertion = revolutIntegration.generateClientAssertion(
      certificate.privateKey,
      clientId
    )

    // Create authorization URL
    const redirectUri = 'https://dutch-tax-platform.com/api/revolut/callback'
    const state = `${userId}_${Date.now()}`
    
    const authUrl = revolutIntegration.createAuthorizationUrl(
      clientId,
      redirectUri,
      state
    )

    return NextResponse.json({
      success: true,
      authUrl,
      state,
      clientAssertion
    })

  } catch (error) {
    console.error('Error in Revolut authorize:', error)
    return NextResponse.json(
      { error: 'Failed to create authorization URL' },
      { status: 500 }
    )
  }
} 