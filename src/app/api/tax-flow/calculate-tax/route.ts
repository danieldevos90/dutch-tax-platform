import { NextRequest, NextResponse } from 'next/server'
import { taxFlowProcessor } from '@/lib/tax-flow-processor'

export async function POST(request: NextRequest) {
  try {
    const {
      businessType,
      annualRevenue,
      businessSector,
      transactions,
      additionalExpenses,
      additionalDeductions
    } = await request.json()

    if (!businessType || !annualRevenue || !transactions) {
      return NextResponse.json(
        { error: 'Business type, annual revenue, and transactions are required' },
        { status: 400 }
      )
    }

    const calculation = await taxFlowProcessor.calculateTaxFromFlow({
      businessType,
      annualRevenue,
      businessSector,
      transactions,
      additionalExpenses,
      additionalDeductions
    })

    return NextResponse.json({
      success: true,
      calculation
    })

  } catch (error) {
    console.error('Error calculating tax from flow:', error)
    return NextResponse.json(
      { error: 'Failed to calculate tax from flow' },
      { status: 500 }
    )
  }
} 