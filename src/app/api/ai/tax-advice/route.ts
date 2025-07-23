import { NextRequest, NextResponse } from 'next/server'
import { geminiTaxAgent } from '@/lib/gemini-tax-agent'

export async function POST(request: NextRequest) {
  try {
    const { question, businessType, annualRevenue, businessSector, specificContext } = await request.json()

    if (!question || !businessType) {
      return NextResponse.json(
        { error: 'Question and business type are required' },
        { status: 400 }
      )
    }

    const advice = await geminiTaxAgent.getTaxAdvice({
      question,
      businessType,
      annualRevenue,
      businessSector,
      specificContext
    })

    return NextResponse.json({
      success: true,
      advice
    })

  } catch (error) {
    console.error('Error getting tax advice:', error)
    return NextResponse.json(
      { error: 'Failed to get tax advice' },
      { status: 500 }
    )
  }
} 