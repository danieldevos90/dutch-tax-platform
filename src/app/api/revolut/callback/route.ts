import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  
  if (error) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=authorization_failed', request.url))
  }
  
  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=no_code', request.url))
  }
  
  try {
    // In a real implementation, you would exchange the code for tokens here
    // For now, we'll just redirect back to settings with success
    return NextResponse.redirect(new URL('/dashboard/settings?success=connected', request.url))
  } catch (error) {
    console.error('Error in Revolut callback:', error)
    return NextResponse.redirect(new URL('/dashboard/settings?error=callback_failed', request.url))
  }
} 