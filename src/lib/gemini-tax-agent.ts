import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface TaxAdviceRequest {
  question: string
  businessType: 'eenmanszaak' | 'bv' | 'vof' | 'maatschap'
  annualRevenue?: number
  businessSector?: string
  specificContext?: string
}

export interface TaxAdviceResponse {
  answer: string
  relevantRules: string[]
  recommendations: string[]
  warnings: string[]
  confidence: number
  sources: string[]
}

export interface TransactionCategorization {
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
  taxImplications: string[]
}

export interface TaxCalculationRequest {
  annualRevenue: number
  businessType: 'eenmanszaak' | 'bv' | 'vof' | 'maatschap'
  deductibleExpenses: number
  vatCollected: number
  vatPaid: number
  kiaDeductions: number
  otherDeductions: number
  year: number
}

export interface TaxCalculationResponse {
  incomeTax: number
  vatOwed: number
  vatRefund: number
  totalTaxLiability: number
  effectiveTaxRate: number
  breakdown: {
    incomeTaxBreakdown: string
    vatBreakdown: string
    deductionsBreakdown: string
  }
  recommendations: string[]
  warnings: string[]
}

export interface TaxOptimizationRequest {
  currentSituation: {
    businessType: string
    annualRevenue: number
    currentExpenses: number
    currentTaxLiability: number
  }
  goals: string[]
  constraints: string[]
}

export interface TaxOptimizationResponse {
  recommendations: {
    shortTerm: string[]
    longTerm: string[]
  }
  potentialSavings: number
  implementationSteps: string[]
  risks: string[]
  timeline: string
}

export class GeminiTaxAgent {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  // Public getter for model access
  getModel() {
    return this.model
  }

  /**
   * Get personalized Dutch tax advice
   */
  async getTaxAdvice(request: TaxAdviceRequest): Promise<TaxAdviceResponse> {
    const prompt = `
You are an expert Dutch tax advisor with 20+ years of experience specializing in Dutch business taxation. 
Provide comprehensive, accurate, and practical tax advice for Dutch entrepreneurs.

BUSINESS CONTEXT:
- Business Type: ${request.businessType}
- Annual Revenue: ${request.annualRevenue ? `€${request.annualRevenue.toLocaleString()}` : 'Not specified'}
- Business Sector: ${request.businessSector || 'Not specified'}
- Specific Context: ${request.specificContext || 'General inquiry'}

QUESTION: ${request.question}

Provide a comprehensive response that includes:
1. Direct answer to the question
2. Relevant Dutch tax rules and regulations
3. Practical recommendations
4. Any warnings or important considerations
5. Confidence level (0-100)
6. Sources/references

Focus on 2025 Dutch tax rules and be specific about:
- Income tax rates and brackets
- VAT rules (21%, 9%, 0%)
- Deductible expenses
- KIA (Kleinschaligheidsinvesteringsaftrek)
- Self-employed deductions
- Business structure implications

Respond in a structured, professional manner suitable for business owners.
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse the response (in a real implementation, you'd want more robust parsing)
      return {
        answer: text,
        relevantRules: this.extractRules(text),
        recommendations: this.extractRecommendations(text),
        warnings: this.extractWarnings(text),
        confidence: this.extractConfidence(text),
        sources: this.extractSources(text)
      }
    } catch (error) {
      console.error('Error getting tax advice:', error)
      throw new Error('Failed to get tax advice from AI agent')
    }
  }

  /**
   * Categorize transactions for Dutch tax purposes
   */
  async categorizeTransaction(
    description: string,
    amount: number,
    merchant?: string,
    date?: string
  ): Promise<TransactionCategorization> {
    const prompt = `
You are an expert Dutch tax advisor specializing in expense categorization for Dutch businesses.

Analyze this transaction for Dutch tax purposes:

DESCRIPTION: ${description}
AMOUNT: €${amount}
MERCHANT: ${merchant || 'Unknown'}
DATE: ${date || 'Not specified'}

Categorize this transaction according to Dutch tax rules for 2025. Consider:

DUTCH TAX CATEGORIES:
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

Respond with ONLY a JSON object:
{
  "category": "main_category",
  "subcategory": "optional_subcategory",
  "isDeductible": boolean,
  "deductiblePercentage": number (0-100),
  "vatReclaimable": boolean,
  "vatPercentage": number (0, 9, or 21),
  "isKiaEligible": boolean,
  "description": "Clear explanation",
  "confidence": number (0-100),
  "reasoning": "Brief explanation",
  "taxImplications": ["implication1", "implication2"]
}
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI')
      }
      
      const categorization = JSON.parse(jsonMatch[0])
      return categorization
    } catch (error) {
      console.error('Error categorizing transaction:', error)
      throw new Error('Failed to categorize transaction')
    }
  }

  /**
   * Calculate Dutch tax liability
   */
  async calculateTax(request: TaxCalculationRequest): Promise<TaxCalculationResponse> {
    const prompt = `
You are an expert Dutch tax calculator. Calculate the tax liability for a Dutch business.

BUSINESS DETAILS:
- Business Type: ${request.businessType}
- Annual Revenue: €${request.annualRevenue.toLocaleString()}
- Deductible Expenses: €${request.deductibleExpenses.toLocaleString()}
- VAT Collected: €${request.vatCollected.toLocaleString()}
- VAT Paid: €${request.vatPaid.toLocaleString()}
- KIA Deductions: €${request.kiaDeductions.toLocaleString()}
- Other Deductions: €${request.otherDeductions.toLocaleString()}
- Tax Year: ${request.year}

Calculate using 2025 Dutch tax rules:
- Income tax rates and brackets
- VAT calculations
- KIA benefits
- Self-employed deductions

Respond with ONLY a JSON object:
{
  "incomeTax": number,
  "vatOwed": number,
  "vatRefund": number,
  "totalTaxLiability": number,
  "effectiveTaxRate": number,
  "breakdown": {
    "incomeTaxBreakdown": "string",
    "vatBreakdown": "string",
    "deductionsBreakdown": "string"
  },
  "recommendations": ["rec1", "rec2"],
  "warnings": ["warning1", "warning2"]
}
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI')
      }
      
      const calculation = JSON.parse(jsonMatch[0])
      return calculation
    } catch (error) {
      console.error('Error calculating tax:', error)
      throw new Error('Failed to calculate tax liability')
    }
  }

  /**
   * Get tax optimization recommendations
   */
  async getTaxOptimization(request: TaxOptimizationRequest): Promise<TaxOptimizationResponse> {
    const prompt = `
You are an expert Dutch tax optimization advisor. Provide recommendations to optimize tax liability.

CURRENT SITUATION:
- Business Type: ${request.currentSituation.businessType}
- Annual Revenue: €${request.currentSituation.annualRevenue.toLocaleString()}
- Current Expenses: €${request.currentSituation.currentExpenses.toLocaleString()}
- Current Tax Liability: €${request.currentSituation.currentTaxLiability.toLocaleString()}

GOALS: ${request.goals.join(', ')}
CONSTRAINTS: ${request.constraints.join(', ')}

Provide optimization strategies considering:
- Business structure changes
- Expense optimization
- KIA opportunities
- VAT optimization
- Timing strategies
- Legal compliance

Respond with ONLY a JSON object:
{
  "recommendations": {
    "shortTerm": ["rec1", "rec2"],
    "longTerm": ["rec1", "rec2"]
  },
  "potentialSavings": number,
  "implementationSteps": ["step1", "step2"],
  "risks": ["risk1", "risk2"],
  "timeline": "string"
}
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI')
      }
      
      const optimization = JSON.parse(jsonMatch[0])
      return optimization
    } catch (error) {
      console.error('Error getting tax optimization:', error)
      throw new Error('Failed to get tax optimization advice')
    }
  }

  /**
   * Get VAT compliance advice
   */
  async getVatAdvice(businessType: string, revenue: number, sector: string): Promise<string> {
    const prompt = `
You are a Dutch VAT expert. Provide VAT compliance advice for:

BUSINESS DETAILS:
- Business Type: ${businessType}
- Annual Revenue: €${revenue.toLocaleString()}
- Sector: ${sector}

Provide advice on:
- VAT registration requirements
- VAT rates applicable
- Filing obligations
- Common VAT mistakes to avoid
- VAT optimization opportunities

Focus on practical, actionable advice for Dutch businesses.
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Error getting VAT advice:', error)
      throw new Error('Failed to get VAT advice')
    }
  }

  // Helper methods for parsing AI responses
  private extractRules(text: string): string[] {
    const rules = text.match(/Rule[^:]*:\s*([^\n]+)/gi) || []
    return rules.map(rule => rule.replace(/^Rule[^:]*:\s*/i, '').trim())
  }

  private extractRecommendations(text: string): string[] {
    const recommendations = text.match(/Recommendation[^:]*:\s*([^\n]+)/gi) || []
    return recommendations.map(rec => rec.replace(/^Recommendation[^:]*:\s*/i, '').trim())
  }

  private extractWarnings(text: string): string[] {
    const warnings = text.match(/Warning[^:]*:\s*([^\n]+)/gi) || []
    return warnings.map(warning => warning.replace(/^Warning[^:]*:\s*/i, '').trim())
  }

  private extractConfidence(text: string): number {
    const confidenceMatch = text.match(/confidence[^:]*:\s*(\d+)/i)
    return confidenceMatch ? parseInt(confidenceMatch[1]) : 75
  }

  private extractSources(text: string): string[] {
    const sources = text.match(/Source[^:]*:\s*([^\n]+)/gi) || []
    return sources.map(source => source.replace(/^Source[^:]*:\s*/i, '').trim())
  }
}

// Export singleton instance
export const geminiTaxAgent = new GeminiTaxAgent() 