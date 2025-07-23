import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId } = body
    
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
    }
    
    // In a real implementation, this would initiate the OAuth flow
    // For now, we'll return a mock response
    return NextResponse.json({
      success: true,
      message: 'Revolut connection initiated',
      authUrl: `https://business.revolut.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL + '/api/revolut/callback')}`
    })
  } catch (error) {
    console.error('Error connecting to Revolut:', error)
    return NextResponse.json({ error: 'Failed to connect to Revolut' }, { status: 500 })
  }
} 