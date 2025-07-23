'use client'

import { useState } from 'react'
import { MessageCircle, Calculator, FileText, TrendingUp, AlertCircle, CheckCircle, Loader2, Send, Bot, User } from 'lucide-react'

interface TaxAdvice {
  answer: string
  relevantRules: string[]
  recommendations: string[]
  warnings: string[]
  confidence: number
  sources: string[]
}

interface TransactionCategorization {
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

interface TaxCalculation {
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

export default function TaxAgentPage() {
  const [activeTab, setActiveTab] = useState<'advice' | 'categorize' | 'calculate' | 'optimize'>('advice')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Tax Advice State
  const [adviceQuestion, setAdviceQuestion] = useState('')
  const [businessType, setBusinessType] = useState<'eenmanszaak' | 'bv' | 'vof' | 'maatschap'>('eenmanszaak')
  const [annualRevenue, setAnnualRevenue] = useState('')
  const [businessSector, setBusinessSector] = useState('')
  const [taxAdvice, setTaxAdvice] = useState<TaxAdvice | null>(null)

  // Transaction Categorization State
  const [transactionDescription, setTransactionDescription] = useState('')
  const [transactionAmount, setTransactionAmount] = useState('')
  const [transactionMerchant, setTransactionMerchant] = useState('')
  const [categorization, setCategorization] = useState<TransactionCategorization | null>(null)

  // Tax Calculation State
  const [calcRevenue, setCalcRevenue] = useState('')
  const [calcExpenses, setCalcExpenses] = useState('')
  const [calcVatCollected, setCalcVatCollected] = useState('')
  const [calcVatPaid, setCalcVatPaid] = useState('')
  const [calcKia, setCalcKia] = useState('')
  const [calcOther, setCalcOther] = useState('')
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null)

  const handleGetTaxAdvice = async () => {
    if (!adviceQuestion.trim()) {
      setError('Please enter your tax question')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ai/tax-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: adviceQuestion,
          businessType,
          annualRevenue: annualRevenue ? parseFloat(annualRevenue) : undefined,
          businessSector: businessSector || undefined
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setTaxAdvice(data.advice)
        setSuccess('Tax advice generated successfully!')
      } else {
        setError(data.error || 'Failed to get tax advice')
      }
    } catch (error) {
      setError('Failed to get tax advice')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategorizeTransaction = async () => {
    if (!transactionDescription.trim() || !transactionAmount.trim()) {
      setError('Please enter transaction description and amount')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: transactionDescription,
          amount: parseFloat(transactionAmount),
          merchant: transactionMerchant || undefined,
          date: new Date().toISOString()
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setCategorization(data.categorization)
        setSuccess('Transaction categorized successfully!')
      } else {
        setError(data.error || 'Failed to categorize transaction')
      }
    } catch (error) {
      setError('Failed to categorize transaction')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCalculateTax = async () => {
    if (!calcRevenue.trim()) {
      setError('Please enter annual revenue')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ai/calculate-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          annualRevenue: parseFloat(calcRevenue),
          businessType,
          deductibleExpenses: parseFloat(calcExpenses) || 0,
          vatCollected: parseFloat(calcVatCollected) || 0,
          vatPaid: parseFloat(calcVatPaid) || 0,
          kiaDeductions: parseFloat(calcKia) || 0,
          otherDeductions: parseFloat(calcOther) || 0,
          year: 2025
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setTaxCalculation(data.calculation)
        setSuccess('Tax calculation completed!')
      } else {
        setError(data.error || 'Failed to calculate tax')
      }
    } catch (error) {
      setError('Failed to calculate tax')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'advice', name: 'Tax Advice', icon: MessageCircle },
    { id: 'categorize', name: 'Categorize', icon: FileText },
    { id: 'calculate', name: 'Calculate', icon: Calculator },
    { id: 'optimize', name: 'Optimize', icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">AI Tax Agent</h1>
          <p className="text-gray-500 text-sm mt-1">Get expert Dutch tax advice powered by AI</p>
        </div>
        <div className="flex items-center space-x-2 text-blue-600">
          <Bot className="w-5 h-5" />
          <span className="text-sm font-medium">Powered by Gemini AI</span>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'advice' | 'categorize' | 'calculate' | 'optimize')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-gray-100 text-black' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {activeTab === 'advice' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Get Tax Advice</h2>
              <p className="text-gray-600 mb-6">Ask any question about Dutch tax rules and get expert advice tailored to your business.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Business Type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as 'eenmanszaak' | 'bv' | 'vof' | 'maatschap')}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="eenmanszaak">Eenmanszaak (Sole Proprietorship)</option>
                  <option value="bv">BV (Private Limited Company)</option>
                  <option value="vof">VOF (General Partnership)</option>
                  <option value="maatschap">Maatschap (Professional Partnership)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Annual Revenue (€)</label>
                <input
                  type="number"
                  value={annualRevenue}
                  onChange={(e) => setAnnualRevenue(e.target.value)}
                  placeholder="e.g., 50000"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Business Sector</label>
              <input
                type="text"
                value={businessSector}
                onChange={(e) => setBusinessSector(e.target.value)}
                placeholder="e.g., IT Services, Retail, Consulting"
                className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Your Tax Question</label>
              <textarea
                value={adviceQuestion}
                onChange={(e) => setAdviceQuestion(e.target.value)}
                placeholder="Ask any question about Dutch tax rules, deductions, VAT, KIA, etc..."
                rows={4}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              />
            </div>

            <button
              onClick={handleGetTaxAdvice}
              disabled={isLoading || !adviceQuestion.trim()}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Getting Advice...' : 'Get Tax Advice'}</span>
            </button>

            {taxAdvice && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4">AI Tax Advice</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 mb-4">{taxAdvice.answer}</p>
                  
                  {taxAdvice.relevantRules.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-black mb-2">Relevant Rules:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {taxAdvice.relevantRules.map((rule, index) => (
                          <li key={index}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {taxAdvice.recommendations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-black mb-2">Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {taxAdvice.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {taxAdvice.warnings.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-red-600 mb-2">Warnings:</h4>
                      <ul className="list-disc list-inside space-y-1 text-red-700">
                        {taxAdvice.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Confidence: {taxAdvice.confidence}%</span>
                    {taxAdvice.sources.length > 0 && (
                      <span>Sources: {taxAdvice.sources.join(', ')}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'categorize' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Categorize Transactions</h2>
              <p className="text-gray-600 mb-6">Get AI-powered categorization for your business transactions with Dutch tax implications.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Transaction Description</label>
                <input
                  type="text"
                  value={transactionDescription}
                  onChange={(e) => setTransactionDescription(e.target.value)}
                  placeholder="e.g., Office supplies from Staples"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Amount (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  placeholder="e.g., 125.50"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Merchant (Optional)</label>
              <input
                type="text"
                value={transactionMerchant}
                onChange={(e) => setTransactionMerchant(e.target.value)}
                placeholder="e.g., Staples, Amazon, etc."
                className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <button
              onClick={handleCategorizeTransaction}
              disabled={isLoading || !transactionDescription.trim() || !transactionAmount.trim()}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Categorizing...' : 'Categorize Transaction'}</span>
            </button>

            {categorization && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Categorization Result</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-black mb-2">Category</h4>
                    <p className="text-gray-700">{categorization.category}</p>
                    {categorization.subcategory && (
                      <p className="text-gray-500 text-sm">{categorization.subcategory}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-black mb-2">Deductibility</h4>
                    <p className="text-gray-700">{categorization.deductiblePercentage}% deductible</p>
                    <p className="text-gray-500 text-sm">
                      {categorization.isDeductible ? 'Fully deductible' : 'Not deductible'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-black mb-2">VAT</h4>
                    <p className="text-gray-700">{categorization.vatPercentage}% VAT</p>
                    <p className="text-gray-500 text-sm">
                      {categorization.vatReclaimable ? 'VAT reclaimable' : 'VAT not reclaimable'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-black mb-2">KIA Eligibility</h4>
                    <p className="text-gray-700">
                      {categorization.isKiaEligible ? 'KIA eligible' : 'Not KIA eligible'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-black mb-2">Explanation</h4>
                  <p className="text-gray-700 mb-2">{categorization.description}</p>
                  <p className="text-gray-600 text-sm">{categorization.reasoning}</p>
                </div>

                {categorization.taxImplications.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-black mb-2">Tax Implications</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {categorization.taxImplications.map((implication, index) => (
                        <li key={index}>{implication}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-500">
                  Confidence: {categorization.confidence}%
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'calculate' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">AI Tax Calculator</h2>
              <p className="text-gray-600 mb-6">Get AI-powered tax calculations with detailed breakdowns and recommendations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Annual Revenue (€)</label>
                <input
                  type="number"
                  value={calcRevenue}
                  onChange={(e) => setCalcRevenue(e.target.value)}
                  placeholder="e.g., 75000"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Deductible Expenses (€)</label>
                <input
                  type="number"
                  value={calcExpenses}
                  onChange={(e) => setCalcExpenses(e.target.value)}
                  placeholder="e.g., 15000"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">VAT Collected (€)</label>
                <input
                  type="number"
                  value={calcVatCollected}
                  onChange={(e) => setCalcVatCollected(e.target.value)}
                  placeholder="e.g., 15750"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">VAT Paid (€)</label>
                <input
                  type="number"
                  value={calcVatPaid}
                  onChange={(e) => setCalcVatPaid(e.target.value)}
                  placeholder="e.g., 3150"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">KIA Deductions (€)</label>
                <input
                  type="number"
                  value={calcKia}
                  onChange={(e) => setCalcKia(e.target.value)}
                  placeholder="e.g., 2000"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Other Deductions (€)</label>
                <input
                  type="number"
                  value={calcOther}
                  onChange={(e) => setCalcOther(e.target.value)}
                  placeholder="e.g., 1000"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleCalculateTax}
              disabled={isLoading || !calcRevenue.trim()}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Calculator className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Calculating...' : 'Calculate Tax'}</span>
            </button>

            {taxCalculation && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Tax Calculation Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-black mb-2">Income Tax</h4>
                    <p className="text-2xl font-bold text-black">€{taxCalculation.incomeTax.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-black mb-2">VAT Owed</h4>
                    <p className="text-2xl font-bold text-black">€{taxCalculation.vatOwed.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-black mb-2">Total Tax</h4>
                    <p className="text-2xl font-bold text-black">€{taxCalculation.totalTaxLiability.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-black mb-2">Breakdown</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Income Tax:</strong> {taxCalculation.breakdown.incomeTaxBreakdown}</p>
                      <p><strong>VAT:</strong> {taxCalculation.breakdown.vatBreakdown}</p>
                      <p><strong>Deductions:</strong> {taxCalculation.breakdown.deductionsBreakdown}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-black mb-2">Summary</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Effective Tax Rate:</strong> {taxCalculation.effectiveTaxRate.toFixed(1)}%</p>
                      <p><strong>VAT Refund:</strong> €{taxCalculation.vatRefund.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {taxCalculation.recommendations.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-black mb-2">AI Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {taxCalculation.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {taxCalculation.warnings.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-red-600 mb-2">Warnings</h4>
                    <ul className="list-disc list-inside space-y-1 text-red-700">
                      {taxCalculation.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'optimize' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Tax Optimization</h2>
              <p className="text-gray-600 mb-6">Coming soon: Get AI-powered recommendations to optimize your tax position.</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-800">Tax Optimization Features</h3>
              </div>
              <ul className="space-y-2 text-blue-700">
                <li>• Business structure optimization recommendations</li>
                <li>• Expense optimization strategies</li>
                <li>• KIA (Kleinschaligheidsinvesteringsaftrek) opportunities</li>
                <li>• VAT optimization advice</li>
                <li>• Timing strategies for tax efficiency</li>
                <li>• Risk assessment and compliance guidance</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 