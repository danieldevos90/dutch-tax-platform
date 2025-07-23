import { NextRequest, NextResponse } from 'next/server'
import { taxFlowProcessor } from '@/lib/tax-flow-processor'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const businessType = formData.get('businessType') as 'eenmanszaak' | 'bv' | 'vof' | 'maatschap'
    const businessSector = formData.get('businessSector') as string

    if (!file || !businessType) {
      return NextResponse.json(
        { error: 'File and business type are required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only Excel (.xlsx, .xls) or CSV files are supported' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    const result = await taxFlowProcessor.processFile(
      file,
      businessType,
      businessSector,
      user.id
    )

    return NextResponse.json({
      success: true,
      result
    })

  } catch (error) {
    console.error('Error processing file:', error)
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    )
  }
} 