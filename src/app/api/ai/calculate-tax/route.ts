import { NextRequest, NextResponse } from 'next/server'
import { geminiTaxAgent } from '@/lib/gemini-tax-agent'

export async function POST(request: NextRequest) {
  try {
    const {
      annualRevenue,
      businessType,
      deductibleExpenses,
      vatCollected,
      vatPaid,
      kiaDeductions,
      otherDeductions,
      year
    } = await request.json()

    if (!annualRevenue || !businessType) {
      return NextResponse.json(
        { error: 'Annual revenue and business type are required' },
        { status: 400 }
      )
    }

    const calculation = await geminiTaxAgent.calculateTax({
      annualRevenue,
      businessType,
      deductibleExpenses: deductibleExpenses || 0,
      vatCollected: vatCollected || 0,
      vatPaid: vatPaid || 0,
      kiaDeductions: kiaDeductions || 0,
      otherDeductions: otherDeductions || 0,
      year: year || 2025
    })

    return NextResponse.json({
      success: true,
      calculation
    })

  } catch (error) {
    console.error('Error calculating tax:', error)
    return NextResponse.json(
      { error: 'Failed to calculate tax' },
      { status: 500 }
    )
  }
} 