import { NextRequest, NextResponse } from 'next/server'
import { taxFlowProcessor } from '@/lib/tax-flow-processor'
import { supabaseTransactionService } from '@/lib/supabase-transactions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessType, businessSector, userId } = body
    
    if (!businessType || !userId) {
      return NextResponse.json({ error: 'Business type and user ID are required' }, { status: 400 })
    }
    
    // In a real implementation, this would fetch transactions from Revolut API
    // For now, we'll return a mock response
    const mockTransactions = [
      {
        created_at: '2025-01-15T10:30:00Z',
        description: 'Office supplies purchase',
        amount: -150.00,
        merchant: 'Office Depot',
        reference: 'TXN123456'
      }
    ]
    
    const result = await taxFlowProcessor.processRevolutTransactions(
      mockTransactions,
      businessType,
      businessSector,
      userId
    )
    
    return NextResponse.json({
      success: true,
      result
    })
  } catch (error) {
    console.error('Error processing Revolut transactions:', error)
    return NextResponse.json({ error: 'Failed to process Revolut transactions' }, { status: 500 })
  }
} 