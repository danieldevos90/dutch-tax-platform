'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, FileSpreadsheet, Calculator, Download, AlertCircle, CheckCircle, Loader2, Bot, TrendingUp, BarChart3, FileText, CreditCard, Database } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabaseTransactionService } from '@/lib/supabase-transactions'

interface ProcessedTransaction {
  date: string
  description: string
  amount: number
  merchant?: string
  category?: string
  notes?: string
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

interface TaxFlowResult {
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

interface TaxCalculationResult {
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

export default function TaxFlowPage() {
  const { user } = useAuth()
  const [activeStep, setActiveStep] = useState<'upload' | 'process' | 'calculate' | 'report'>('upload')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Data source selection
  const [dataSource, setDataSource] = useState<'csv' | 'revolut'>('csv')
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [businessType, setBusinessType] = useState<'eenmanszaak' | 'bv' | 'vof' | 'maatschap'>('eenmanszaak')
  const [businessSector, setBusinessSector] = useState('')
  const [businessName, setBusinessName] = useState('')
  
  // Processing results
  const [flowResult, setFlowResult] = useState<TaxFlowResult | null>(null)
  
  // Tax calculation state
  const [annualRevenue, setAnnualRevenue] = useState('')
  const [additionalExpenses, setAdditionalExpenses] = useState('')
  const [additionalDeductions, setAdditionalDeductions] = useState('')
  const [calculationResult, setCalculationResult] = useState<TaxCalculationResult | null>(null)
  
  // Report state
  const [taxReport, setTaxReport] = useState<string>('')
  
  // Existing data state
  const [existingTransactions, setExistingTransactions] = useState<any[] | null>(null)
  const [transactionSummary, setTransactionSummary] = useState<any>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load existing data on component mount
  useEffect(() => {
    if (user) {
      loadExistingData()
    }
  }, [user])

  const loadExistingData = async () => {
    if (!user) return
    
    try {
      const [transactionsResult, summaryResult] = await Promise.all([
        supabaseTransactionService.getTransactions(user.id),
        supabaseTransactionService.getTransactionSummary(user.id)
      ])
      
      setExistingTransactions(transactionsResult.data)
      setTransactionSummary(summaryResult)
    } catch (error) {
      console.error('Error loading existing data:', error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        setSelectedFile(file)
        setError('')
      } else {
        setError('Please select an Excel (.xlsx, .xls) or CSV file')
      }
    }
  }

  const handleProcessData = async () => {
    if (dataSource === 'csv' && (!selectedFile || !businessType)) {
      setError('Please select a file and business type')
      return
    }

    if (dataSource === 'revolut' && !businessType) {
      setError('Please select business type')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      if (dataSource === 'csv') {
        const formData = new FormData()
        formData.append('file', selectedFile!)
        formData.append('businessType', businessType)
        if (businessSector) {
          formData.append('businessSector', businessSector)
        }

        const response = await fetch('/api/tax-flow/process-excel', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()
        
        if (data.success) {
          setFlowResult(data.result)
          setSuccess(`Processed ${data.result.transactions.length} transactions in ${(data.result.processingTime / 1000).toFixed(1)}s`)
          setActiveStep('calculate')
          await loadExistingData() // Refresh data
        } else {
          setError(data.error || 'Failed to process file')
        }
      } else {
        // For Revolut, we would need to fetch transactions from Revolut API
        // This is a placeholder - in a real implementation, you'd fetch from Revolut
        setError('Revolut integration not yet implemented')
      }
    } catch (error) {
      setError('Failed to process data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCalculateTax = async () => {
    if (!flowResult || !annualRevenue.trim()) {
      setError('Please process Excel file first and enter annual revenue')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/tax-flow/calculate-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType,
          annualRevenue: parseFloat(annualRevenue),
          businessSector: businessSector || undefined,
          transactions: flowResult.transactions,
          additionalExpenses: additionalExpenses ? parseFloat(additionalExpenses) : undefined,
          additionalDeductions: additionalDeductions ? parseFloat(additionalDeductions) : undefined
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setCalculationResult(data.calculation)
        setSuccess('Tax calculation completed!')
        setActiveStep('report')
      } else {
        setError(data.error || 'Failed to calculate tax')
      }
    } catch (error) {
      setError('Failed to calculate tax')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!flowResult || !calculationResult) {
      setError('Please complete processing and calculation first')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/tax-flow/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flowResult,
          calculationResult,
          businessInfo: {
            name: businessName || 'Your Business',
            type: businessType,
            sector: businessSector || 'General',
            year: 2025
          }
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setTaxReport(data.report)
        setSuccess('Tax report generated successfully!')
      } else {
        setError(data.error || 'Failed to generate report')
      }
    } catch (error) {
      setError('Failed to generate report')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadReport = () => {
    if (!taxReport) return
    
    const blob = new Blob([taxReport], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tax-report-${businessName || 'business'}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const steps = [
    { id: 'upload', name: 'Upload Excel', icon: Upload },
    { id: 'process', name: 'AI Processing', icon: Bot },
    { id: 'calculate', name: 'Tax Calculation', icon: Calculator },
    { id: 'report', name: 'Generate Report', icon: FileText },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Tax Flow Processing</h1>
          <p className="text-gray-500 text-sm mt-1">Upload Excel files for AI-powered tax analysis and calculations</p>
        </div>
        <div className="flex items-center space-x-2 text-blue-600">
          <FileSpreadsheet className="w-5 h-5" />
          <span className="text-sm font-medium">Excel + AI Integration</span>
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

      {/* Progress Steps */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = activeStep === step.id
            const isCompleted = steps.findIndex(s => s.id === activeStep) > index
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted ? 'bg-green-500 border-green-500 text-white' :
                  isActive ? 'bg-black border-black text-white' :
                  'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-black' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        {activeStep === 'upload' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Data Source</h2>
              <p className="text-gray-600 mb-6">Choose how to import your transaction data for AI-powered categorization and tax analysis.</p>
            </div>

            {/* Data Source Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setDataSource('csv')}
                className={`p-6 border-2 rounded-lg text-left transition-colors ${
                  dataSource === 'csv'
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white text-black hover:border-gray-300'
                }`}
              >
                <FileSpreadsheet className="w-8 h-8 mb-3" />
                <h3 className="font-semibold mb-2">Upload CSV/Excel</h3>
                <p className="text-sm opacity-80">Upload your transaction file (.csv, .xlsx, .xls)</p>
              </button>
              
              <button
                onClick={() => setDataSource('revolut')}
                className={`p-6 border-2 rounded-lg text-left transition-colors ${
                  dataSource === 'revolut'
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white text-black hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-8 h-8 mb-3" />
                <h3 className="font-semibold mb-2">Connect Revolut</h3>
                <p className="text-sm opacity-80">Import transactions from your Revolut account</p>
              </button>
            </div>

            {/* Business Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your Business Name"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Business Type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as any)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="eenmanszaak">Eenmanszaak (Sole Proprietorship)</option>
                  <option value="bv">BV (Private Limited Company)</option>
                  <option value="vof">VOF (General Partnership)</option>
                  <option value="maatschap">Maatschap (Professional Partnership)</option>
                </select>
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

            {/* File Upload (only for CSV) */}
            {dataSource === 'csv' && (
              <div>
                <label className="block text-sm font-medium text-black mb-2">Transaction File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    {selectedFile ? selectedFile.name : 'Click to select file'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supported formats: .csv, .xlsx, .xls (max 10MB)
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Select File
                  </button>
                </div>
              </div>
            )}

            {/* Existing Data Summary */}
            {transactionSummary && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Existing Data</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Transactions</p>
                    <p className="text-xl font-bold text-black">{transactionSummary.totalTransactions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold text-black">€{transactionSummary.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deductible</p>
                    <p className="text-xl font-bold text-black">€{transactionSummary.totalDeductible.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">KIA Eligible</p>
                    <p className="text-xl font-bold text-black">€{transactionSummary.kiaEligibleAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleProcessData}
              disabled={isLoading || (dataSource === 'csv' && !selectedFile)}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Bot className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Processing...' : 'Process with AI'}</span>
            </button>
          </div>
        )}

        {activeStep === 'calculate' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Tax Calculation</h2>
              <p className="text-gray-600 mb-6">Enter additional information to calculate your tax liability.</p>
            </div>

            {/* Summary Cards */}
            {flowResult ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600">Total Transactions</h3>
                  <p className="text-2xl font-bold text-black">{flowResult.transactions.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600">Total Amount</h3>
                  <p className="text-2xl font-bold text-black">€{flowResult.summary.totalAmount.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600">Deductible</h3>
                  <p className="text-2xl font-bold text-black">€{flowResult.summary.totalDeductible.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600">KIA Eligible</h3>
                  <p className="text-2xl font-bold text-black">€{flowResult.summary.kiaEligibleAmount.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Available</h3>
                <p className="text-gray-500">Please upload transaction data or connect your Revolut account first.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Annual Revenue (€)</label>
                <input
                  type="number"
                  value={annualRevenue}
                  onChange={(e) => setAnnualRevenue(e.target.value)}
                  placeholder="e.g., 75000"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Additional Expenses (€)</label>
                <input
                  type="number"
                  value={additionalExpenses}
                  onChange={(e) => setAdditionalExpenses(e.target.value)}
                  placeholder="e.g., 5000"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Additional Deductions (€)</label>
                <input
                  type="number"
                  value={additionalDeductions}
                  onChange={(e) => setAdditionalDeductions(e.target.value)}
                  placeholder="e.g., 2000"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleCalculateTax}
              disabled={isLoading || !annualRevenue.trim() || !flowResult}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Calculator className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Calculating...' : 'Calculate Tax'}</span>
            </button>
          </div>
        )}

        {activeStep === 'report' && calculationResult && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Tax Report</h2>
              <p className="text-gray-600 mb-6">Generate a comprehensive tax report based on your processed data.</p>
            </div>

            {/* Tax Calculation Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">Income Tax</h3>
                <p className="text-2xl font-bold text-black">€{calculationResult.incomeTax.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">Total Tax Liability</h3>
                <p className="text-2xl font-bold text-black">€{calculationResult.totalTaxLiability.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">Effective Tax Rate</h3>
                <p className="text-2xl font-bold text-black">{calculationResult.effectiveTaxRate.toFixed(1)}%</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleGenerateReport}
                disabled={isLoading}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
                <span>{isLoading ? 'Generating...' : 'Generate Report'}</span>
              </button>

              {taxReport && (
                <button
                  onClick={downloadReport}
                  className="px-6 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Report</span>
                </button>
              )}
            </div>

            {taxReport && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Generated Tax Report</h3>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-800 text-sm">{taxReport}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recommendations and Warnings */}
      {flowResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {flowResult.recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">AI Recommendations</h3>
              <ul className="space-y-2 text-blue-700">
                {flowResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {flowResult.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">Warnings</h3>
              <ul className="space-y-2 text-yellow-700">
                {flowResult.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 