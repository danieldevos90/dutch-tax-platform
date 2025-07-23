import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface ExpenseCategorizationResult {
  category: string
  subcategory?: string
  isDeductible: boolean
  deductiblePercentage: number
  vatReclaimable: boolean
  vatPercentage: number
  isKiaEligible: boolean
  description: string
  confidence: number
  reasoning: string
}

export interface TransactionData {
  description: string
  amount: number
  merchant?: string
  date: string
  bankReference?: string
}

// Comprehensive Dutch tax categorization prompt
const DUTCH_TAX_PROMPT = `
You are an expert Dutch tax advisor specializing in sole proprietorship (eenmanszaak) tax rules for 2025. 

Analyze the following transaction and provide categorization based on Dutch tax law:

DUTCH TAX RULES TO CONSIDER:
1. Representation costs (representatiekosten): 80% deductible for business entertainment, meals, drinks, gifts
2. KIA eligibility: Business assets >€450 per item, total yearly >€2,900 (computers, equipment, machinery)
3. VAT rates: 21% standard, 9% reduced (food, books), 0% exports
4. Fully deductible: Office supplies, business insurance, professional fees, marketing, business travel
5. Partially deductible: Home office (if separate space), mixed-use items
6. Non-deductible: Personal expenses, fines, private use of business assets
7. Car expenses: Business km €0.21/km OR all costs if company car (with bijtelling for private use)

CATEGORIES:
- office_supplies (100% deductible, 21% VAT reclaimable)
- equipment_it (100% deductible, 21% VAT, KIA eligible if >€450)
- equipment_other (100% deductible, 21% VAT, KIA eligible if >€450)
- professional_services (100% deductible, 21% VAT)
- marketing_advertising (100% deductible, 21% VAT)
- travel_business (100% deductible, varies VAT)
- representation (80% deductible, 21% VAT)
- insurance_business (100% deductible, 21% VAT)
- rent_office (100% deductible, 21% VAT)
- utilities (100% deductible if business, 21% VAT)
- fuel_business (100% deductible if business car, 21% VAT)
- subscriptions_software (100% deductible, 21% VAT)
- training_education (100% deductible, 21% VAT)
- legal_accounting (100% deductible, 21% VAT)
- inventory_materials (100% deductible, varies VAT)
- bank_charges (100% deductible, 21% VAT)
- interest_business (100% deductible, no VAT)
- private_personal (0% deductible, no VAT reclaim)

Respond with ONLY a JSON object with these fields:
{
  "category": "main_category",
  "subcategory": "optional_subcategory",
  "isDeductible": boolean,
  "deductiblePercentage": number (0-100),
  "vatReclaimable": boolean,
  "vatPercentage": number (0, 9, or 21),
  "isKiaEligible": boolean,
  "description": "Clear explanation of the expense",
  "confidence": number (0-100),
  "reasoning": "Brief explanation of categorization"
}
`

export async function categorizeTransaction(
  transaction: TransactionData,
  businessContext?: string
): Promise<ExpenseCategorizationResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `
${DUTCH_TAX_PROMPT}

TRANSACTION TO ANALYZE:
Description: ${transaction.description}
Amount: €${transaction.amount}
Merchant: ${transaction.merchant || 'Unknown'}
Date: ${transaction.date}
Bank Reference: ${transaction.bankReference || 'N/A'}
Business Context: ${businessContext || 'General business'}

Analyze this transaction for Dutch tax compliance.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse JSON response
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim()
    const categorization = JSON.parse(cleanedText) as ExpenseCategorizationResult
    
    // Validate and apply business rules
    return validateAndEnrichCategorization(categorization, transaction)
    
  } catch (error) {
    console.error('Error categorizing transaction:', error)
    
    // Fallback categorization
    return {
      category: 'uncategorized',
      isDeductible: false,
      deductiblePercentage: 0,
      vatReclaimable: false,
      vatPercentage: 21,
      isKiaEligible: false,
      description: 'Unable to categorize - requires manual review',
      confidence: 0,
      reasoning: 'AI categorization failed'
    }
  }
}

// Validate and enrich AI categorization with business rules
function validateAndEnrichCategorization(
  categorization: ExpenseCategorizationResult,
  transaction: TransactionData
): ExpenseCategorizationResult {
  // Apply specific Dutch tax rules
  const enriched = { ...categorization }
  
  // KIA eligibility rules
  if (enriched.isKiaEligible && transaction.amount < 450) {
    enriched.isKiaEligible = false
    enriched.reasoning += ' (Amount too low for KIA - minimum €450 per asset)'
  }
  
  // Representation costs rules
  if (enriched.category === 'representation') {
    enriched.deductiblePercentage = 80
    enriched.isDeductible = true
  }
  
  // Ensure VAT percentages are valid
  if (![0, 9, 21].includes(enriched.vatPercentage)) {
    enriched.vatPercentage = 21 // Default to standard rate
  }
  
  // Private/personal expenses
  if (enriched.category === 'private_personal') {
    enriched.isDeductible = false
    enriched.deductiblePercentage = 0
    enriched.vatReclaimable = false
    enriched.isKiaEligible = false
  }
  
  return enriched
}

// Batch categorization for multiple transactions
export async function categorizeTransactionsBatch(
  transactions: TransactionData[],
  businessContext?: string,
  batchSize: number = 10
): Promise<ExpenseCategorizationResult[]> {
  const results: ExpenseCategorizationResult[] = []
  
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize)
    const batchPromises = batch.map(transaction => 
      categorizeTransaction(transaction, businessContext)
    )
    
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
    
    // Small delay to avoid rate limits
    if (i + batchSize < transactions.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return results
}

// Category suggestions for manual override
export const EXPENSE_CATEGORIES = {
  'office_supplies': {
    name: 'Office Supplies',
    deductible: 100,
    vatReclaimable: true,
    vatRate: 21,
    kiaEligible: false,
    examples: ['Paper', 'Pens', 'Printer ink', 'Desk accessories']
  },
  'equipment_it': {
    name: 'IT Equipment',
    deductible: 100,
    vatReclaimable: true,
    vatRate: 21,
    kiaEligible: true,
    examples: ['Laptop', 'Monitor', 'Software', 'Server']
  },
  'equipment_other': {
    name: 'Other Equipment',
    deductible: 100,
    vatReclaimable: true,
    vatRate: 21,
    kiaEligible: true,
    examples: ['Machinery', 'Tools', 'Furniture', 'Vehicles']
  },
  'professional_services': {
    name: 'Professional Services',
    deductible: 100,
    vatReclaimable: true,
    vatRate: 21,
    kiaEligible: false,
    examples: ['Consulting', 'Legal fees', 'Accounting', 'Design services']
  },
  'marketing_advertising': {
    name: 'Marketing & Advertising',
    deductible: 100,
    vatReclaimable: true,
    vatRate: 21,
    kiaEligible: false,
    examples: ['Online ads', 'Print materials', 'Website', 'Trade shows']
  },
  'representation': {
    name: 'Representation Costs',
    deductible: 80,
    vatReclaimable: true,
    vatRate: 21,
    kiaEligible: false,
    examples: ['Client dinners', 'Business gifts', 'Entertainment', 'Conference meals']
  },
  'travel_business': {
    name: 'Business Travel',
    deductible: 100,
    vatReclaimable: true,
    vatRate: 21,
    kiaEligible: false,
    examples: ['Train tickets', 'Hotel', 'Taxi', 'Parking']
  },
  'private_personal': {
    name: 'Private/Personal',
    deductible: 0,
    vatReclaimable: false,
    vatRate: 0,
    kiaEligible: false,
    examples: ['Personal shopping', 'Private meals', 'Personal travel']
  }
} as const

export type ExpenseCategory = keyof typeof EXPENSE_CATEGORIES 