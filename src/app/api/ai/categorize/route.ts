import { NextRequest, NextResponse } from 'next/server'
import { geminiTaxAgent } from '@/lib/gemini-tax-agent'

export async function POST(request: NextRequest) {
  try {
    const { description, amount, merchant, date } = await request.json()

    if (!description || !amount) {
      return NextResponse.json(
        { error: 'Description and amount are required' },
        { status: 400 }
      )
    }

    const categorization = await geminiTaxAgent.categorizeTransaction(
      description,
      amount,
      merchant,
      date
    )

    return NextResponse.json({
      success: true,
      categorization
    })

  } catch (error) {
    console.error('Error categorizing transaction:', error)
    return NextResponse.json(
      { error: 'Failed to categorize transaction' },
      { status: 500 }
    )
  }
} 