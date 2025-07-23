import { NextRequest, NextResponse } from 'next/server'
import { taxFlowProcessor } from '@/lib/tax-flow-processor'

export async function POST(request: NextRequest) {
  try {
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
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Only Excel files (.xlsx, .xls) are supported' },
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

    const result = await taxFlowProcessor.processExcelFile(
      file,
      businessType,
      businessSector
    )

    return NextResponse.json({
      success: true,
      result
    })

  } catch (error) {
    console.error('Error processing Excel file:', error)
    return NextResponse.json(
      { error: 'Failed to process Excel file' },
      { status: 500 }
    )
  }
} 