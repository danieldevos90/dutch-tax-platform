import { NextRequest, NextResponse } from 'next/server'
import { taxFlowProcessor } from '@/lib/tax-flow-processor'

export async function POST(request: NextRequest) {
  try {
    const {
      flowResult,
      calculationResult,
      businessInfo
    } = await request.json()

    if (!flowResult || !calculationResult || !businessInfo) {
      return NextResponse.json(
        { error: 'Flow result, calculation result, and business info are required' },
        { status: 400 }
      )
    }

    const report = await taxFlowProcessor.generateTaxReport(
      flowResult,
      calculationResult,
      businessInfo
    )

    return NextResponse.json({
      success: true,
      report
    })

  } catch (error) {
    console.error('Error generating tax report:', error)
    return NextResponse.json(
      { error: 'Failed to generate tax report' },
      { status: 500 }
    )
  }
} 