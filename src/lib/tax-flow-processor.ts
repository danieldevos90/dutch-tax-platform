import { geminiTaxAgent } from './gemini-tax-agent'
import * as XLSX from 'xlsx'

export interface ExcelTransaction {
  date: string
  description: string
  amount: number
  merchant?: string
  category?: string
  notes?: string
}

export interface ProcessedTransaction extends ExcelTransaction {
  aiCategory: string
  aiSubcategory?: string
  isDeductible: boolean
  deductiblePercentage: number
  vatReclaimable: boolean
  vatPercentage: number
  isKiaEligible: boolean
  taxImplications: string[]
  confidence: number
  reasoning: string
}

export interface TaxFlowResult {
  transactions: ProcessedTransaction[]
  summary: {
    totalAmount: number
    totalDeductible: number
    totalVatReclaimable: number
    kiaEligibleAmount: number
    categories: Record<string, number>
    taxSavings: number
  }
  recommendations: string[]
  warnings: string[]
  processingTime: number
}

export interface TaxCalculationFlow {
  businessType: 'eenmanszaak' | 'bv' | 'vof' | 'maatschap'
  annualRevenue: number
  businessSector?: string
  transactions: ProcessedTransaction[]
  additionalExpenses?: number
  additionalDeductions?: number
}

export interface TaxFlowCalculationResult {
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
  potentialSavings: number
  optimizationSuggestions: string[]
}

export class TaxFlowProcessor {
  /**
   * Process Excel file with AI-powered categorization
   */
  async processExcelFile(
    file: File,
    businessType: 'eenmanszaak' | 'bv' | 'vof' | 'maatschap',
    businessSector?: string
  ): Promise<TaxFlowResult> {
    const startTime = Date.now()
    
    try {
      // Read Excel file
      const transactions = await this.readExcelFile(file)
      
      // Process transactions with AI
      const processedTransactions = await this.processTransactionsWithAI(
        transactions,
        businessType,
        businessSector
      )
      
      // Generate summary
      const summary = this.generateSummary(processedTransactions)
      
      // Get AI recommendations
      const recommendations = await this.getFlowRecommendations(
        processedTransactions,
        businessType,
        businessSector
      )
      
      const processingTime = Date.now() - startTime
      
      return {
        transactions: processedTransactions,
        summary,
        recommendations,
        warnings: this.generateWarnings(processedTransactions),
        processingTime
      }
    } catch (error) {
      console.error('Error processing Excel file:', error)
      throw new Error('Failed to process Excel file')
    }
  }

  /**
   * Calculate comprehensive tax liability from processed transactions
   */
  async calculateTaxFromFlow(
    flowData: TaxCalculationFlow
  ): Promise<TaxFlowCalculationResult> {
    try {
      // Calculate totals from transactions
      const totalExpenses = flowData.transactions.reduce((sum, t) => sum + t.amount, 0)
      const totalDeductible = flowData.transactions.reduce((sum, t) => sum + (t.amount * t.deductiblePercentage / 100), 0)
      const totalVatPaid = flowData.transactions.reduce((sum, t) => {
        if (t.vatReclaimable) {
          return sum + (t.amount * t.vatPercentage / (100 + t.vatPercentage))
        }
        return sum
      }, 0)
      
      const kiaDeductions = flowData.transactions
        .filter(t => t.isKiaEligible)
        .reduce((sum, t) => sum + t.amount, 0)

      // Get AI tax calculation
      const calculation = await geminiTaxAgent.calculateTax({
        annualRevenue: flowData.annualRevenue,
        businessType: flowData.businessType,
        deductibleExpenses: totalDeductible + (flowData.additionalExpenses || 0),
        vatCollected: 0, // Would need to be calculated from income
        vatPaid: totalVatPaid,
        kiaDeductions: kiaDeductions,
        otherDeductions: flowData.additionalDeductions || 0,
        year: 2025
      })

      // Get optimization suggestions
      const optimizationSuggestions = await this.getOptimizationSuggestions(
        flowData,
        calculation
      )

      return {
        ...calculation,
        potentialSavings: calculation.totalTaxLiability * 0.15, // Estimate 15% potential savings
        optimizationSuggestions
      }
    } catch (error) {
      console.error('Error calculating tax from flow:', error)
      throw new Error('Failed to calculate tax from flow')
    }
  }

  /**
   * Generate tax report from processed data
   */
  async generateTaxReport(
    flowResult: TaxFlowResult,
    calculationResult: TaxFlowCalculationResult,
    businessInfo: {
      name: string
      type: string
      sector: string
      year: number
    }
  ): Promise<string> {
    try {
      const prompt = `
Generate a comprehensive Dutch tax report for a business based on the following data:

BUSINESS INFORMATION:
- Name: ${businessInfo.name}
- Type: ${businessInfo.type}
- Sector: ${businessInfo.sector}
- Tax Year: ${businessInfo.year}

TRANSACTION SUMMARY:
- Total Transactions: ${flowResult.transactions.length}
- Total Amount: €${flowResult.summary.totalAmount.toLocaleString()}
- Total Deductible: €${flowResult.summary.totalDeductible.toLocaleString()}
- VAT Reclaimable: €${flowResult.summary.totalVatReclaimable.toLocaleString()}
- KIA Eligible: €${flowResult.summary.kiaEligibleAmount.toLocaleString()}

TAX CALCULATION:
- Income Tax: €${calculationResult.incomeTax.toLocaleString()}
- VAT Owed: €${calculationResult.vatOwed.toLocaleString()}
- Total Tax Liability: €${calculationResult.totalTaxLiability.toLocaleString()}
- Effective Tax Rate: ${calculationResult.effectiveTaxRate.toFixed(1)}%

TOP CATEGORIES:
${Object.entries(flowResult.summary.categories)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .map(([category, amount]) => `- ${category}: €${amount.toLocaleString()}`)
  .join('\n')}

RECOMMENDATIONS:
${calculationResult.recommendations.join('\n')}

Generate a professional, structured tax report suitable for business owners and accountants.
Include sections for:
1. Executive Summary
2. Transaction Analysis
3. Tax Calculations
4. Recommendations
5. Compliance Notes
6. Next Steps

Format the report in clear, professional language with proper Dutch tax terminology.
`

      const result = await geminiTaxAgent.getModel().generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Error generating tax report:', error)
      throw new Error('Failed to generate tax report')
    }
  }

  /**
   * Read and parse Excel file
   */
  private async readExcelFile(file: File): Promise<ExcelTransaction[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          
          // Skip header row and map to transactions
          const transactions: ExcelTransaction[] = jsonData.slice(1).map((row: any) => ({
            date: row[0] || new Date().toISOString().split('T')[0],
            description: row[1] || '',
            amount: parseFloat(row[2]) || 0,
            merchant: row[3] || undefined,
            category: row[4] || undefined,
            notes: row[5] || undefined
          })).filter(t => t.description && t.amount > 0)
          
          resolve(transactions)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * Process transactions with AI categorization
   */
  private async processTransactionsWithAI(
    transactions: ExcelTransaction[],
    businessType: string,
    businessSector?: string
  ): Promise<ProcessedTransaction[]> {
    const processed: ProcessedTransaction[] = []
    
    // Process in batches to avoid rate limits
    const batchSize = 5
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (transaction) => {
        try {
          const categorization = await geminiTaxAgent.categorizeTransaction(
            transaction.description,
            transaction.amount,
            transaction.merchant,
            transaction.date
          )
          
          return {
            ...transaction,
            aiCategory: categorization.category,
            aiSubcategory: categorization.subcategory,
            isDeductible: categorization.isDeductible,
            deductiblePercentage: categorization.deductiblePercentage,
            vatReclaimable: categorization.vatReclaimable,
            vatPercentage: categorization.vatPercentage,
            isKiaEligible: categorization.isKiaEligible,
            taxImplications: categorization.taxImplications,
            confidence: categorization.confidence,
            reasoning: categorization.reasoning
          }
        } catch (error) {
          console.error('Error categorizing transaction:', error)
          // Return transaction with default categorization
          return {
            ...transaction,
            aiCategory: 'uncategorized',
            isDeductible: false,
            deductiblePercentage: 0,
            vatReclaimable: false,
            vatPercentage: 0,
            isKiaEligible: false,
            taxImplications: ['Unable to categorize'],
            confidence: 0,
            reasoning: 'AI categorization failed'
          }
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      processed.push(...batchResults)
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < transactions.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return processed
  }

  /**
   * Generate summary from processed transactions
   */
  private generateSummary(transactions: ProcessedTransaction[]) {
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
    const totalDeductible = transactions.reduce((sum, t) => sum + (t.amount * t.deductiblePercentage / 100), 0)
    const totalVatReclaimable = transactions.reduce((sum, t) => {
      if (t.vatReclaimable) {
        return sum + (t.amount * t.vatPercentage / (100 + t.vatPercentage))
      }
      return sum
    }, 0)
    const kiaEligibleAmount = transactions
      .filter(t => t.isKiaEligible)
      .reduce((sum, t) => sum + t.amount, 0)
    
    // Group by category
    const categories: Record<string, number> = {}
    transactions.forEach((t: ProcessedTransaction) => {
      categories[t.aiCategory] = (categories[t.aiCategory] || 0) + t.amount
    })
    
    return {
      totalAmount,
      totalDeductible,
      totalVatReclaimable,
      kiaEligibleAmount,
      categories,
      taxSavings: totalDeductible * 0.25 // Estimate 25% tax savings on deductible expenses
    }
  }

  /**
   * Get AI recommendations for the flow
   */
  private async getFlowRecommendations(
    transactions: ProcessedTransaction[],
    businessType: string,
    businessSector?: string
  ): Promise<string[]> {
    try {
      const summary = this.generateSummary(transactions)
      
      const prompt = `
Based on the following transaction data, provide 5 specific recommendations for tax optimization:

BUSINESS CONTEXT:
- Type: ${businessType}
- Sector: ${businessSector || 'General'}
- Total Transactions: ${transactions.length}
- Total Amount: €${summary.totalAmount.toLocaleString()}
- Total Deductible: €${summary.totalDeductible.toLocaleString()}
- KIA Eligible: €${summary.kiaEligibleAmount.toLocaleString()}

TOP CATEGORIES:
${Object.entries(summary.categories)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .map(([category, amount]) => `- ${category}: €${amount.toLocaleString()}`)
  .join('\n')}

Provide 5 specific, actionable recommendations for Dutch tax optimization in 2025.
Focus on practical steps the business can take immediately.
`

      const result = await geminiTaxAgent.getModel().generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Extract recommendations (simple parsing)
      const recommendations = text
        .split('\n')
        .filter(line => line.trim().match(/^\d+\.|^•|^-/))
        .map(line => line.replace(/^\d+\.\s*|^•\s*|^-\s*/, '').trim())
        .filter(line => line.length > 10)
        .slice(0, 5)
      
      return recommendations.length > 0 ? recommendations : [
        'Consider consulting with a tax advisor for personalized advice',
        'Review all transactions for missed deductible expenses',
        'Explore KIA opportunities for business investments',
        'Optimize VAT reclaim on business purchases',
        'Plan timing of expenses for tax efficiency'
      ]
    } catch (error) {
      console.error('Error getting flow recommendations:', error)
      return [
        'Review transactions for tax optimization opportunities',
        'Consider professional tax advice for complex situations'
      ]
    }
  }

  /**
   * Generate warnings from processed transactions
   */
  private generateWarnings(transactions: ProcessedTransaction[]): string[] {
    const warnings: string[] = []
    
    const lowConfidenceCount = transactions.filter(t => t.confidence < 50).length
    if (lowConfidenceCount > 0) {
      warnings.push(`${lowConfidenceCount} transactions have low confidence categorization - review manually`)
    }
    
    const personalExpenses = transactions.filter(t => t.aiCategory === 'private_personal')
    if (personalExpenses.length > 0) {
      warnings.push(`${personalExpenses.length} transactions appear to be personal expenses`)
    }
    
    const highAmountTransactions = transactions.filter(t => t.amount > 1000 && t.isKiaEligible)
    if (highAmountTransactions.length > 0) {
      warnings.push(`${highAmountTransactions.length} high-value KIA-eligible transactions detected`)
    }
    
    return warnings
  }

  /**
   * Get optimization suggestions based on calculation results
   */
  private async getOptimizationSuggestions(
    flowData: TaxCalculationFlow,
    calculation: any
  ): Promise<string[]> {
    try {
      const prompt = `
Based on the tax calculation results, provide 3 specific optimization suggestions:

CURRENT SITUATION:
- Business Type: ${flowData.businessType}
- Annual Revenue: €${flowData.annualRevenue.toLocaleString()}
- Total Tax Liability: €${calculation.totalTaxLiability.toLocaleString()}
- Effective Tax Rate: ${calculation.effectiveTaxRate.toFixed(1)}%

Provide 3 specific, actionable suggestions to reduce tax liability while maintaining compliance.
Focus on Dutch tax optimization strategies for 2025.
`

      const result = await geminiTaxAgent.getModel().generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      const suggestions = text
        .split('\n')
        .filter(line => line.trim().match(/^\d+\.|^•|^-/))
        .map(line => line.replace(/^\d+\.\s*|^•\s*|^-\s*/, '').trim())
        .filter(line => line.length > 10)
        .slice(0, 3)
      
      return suggestions.length > 0 ? suggestions : [
        'Consider increasing deductible business expenses',
        'Explore KIA opportunities for business investments',
        'Review business structure for tax efficiency'
      ]
    } catch (error) {
      console.error('Error getting optimization suggestions:', error)
      return [
        'Review business expenses for additional deductions',
        'Consider professional tax planning services'
      ]
    }
  }
}

// Export singleton instance
export const taxFlowProcessor = new TaxFlowProcessor() 