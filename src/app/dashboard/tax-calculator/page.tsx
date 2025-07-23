'use client'

import { useState } from 'react'
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  FileText,
  Download,
  RefreshCw,
  Info
} from 'lucide-react'

interface TaxCalculation {
  revenue: number
  expenses: number
  grossProfit: number
  zelfstandigenaftrek: number
  startersaftrek: number
  mkbWinstvrijstelling: number
  taxableIncome: number
  estimatedTax: number
  vatDue: number
  vatReclaimable: number
  netProfit: number
}

export default function TaxCalculatorPage() {
  const [revenue, setRevenue] = useState(85420)
  const [expenses, setExpenses] = useState(23150)
  const [hoursWorked, setHoursWorked] = useState(1450)
  const [isStarter, setIsStarter] = useState(false)
  const [vatRate, setVatRate] = useState(21)

  const calculateTax = (): TaxCalculation => {
    const grossProfit = revenue - expenses
    const zelfstandigenaftrek = hoursWorked >= 1225 ? 2470 : 0
    const startersaftrek = isStarter && hoursWorked >= 1225 ? 2123 : 0
    const mkbWinstvrijstelling = Math.max(0, (grossProfit - zelfstandigenaftrek - startersaftrek) * 0.127)
    const taxableIncome = Math.max(0, grossProfit - zelfstandigenaftrek - startersaftrek - mkbWinstvrijstelling)
    const estimatedTax = taxableIncome * 0.37 // Simplified tax rate
    const vatDue = revenue * (vatRate / 100)
    const vatReclaimable = expenses * (vatRate / 100)
    const netProfit = grossProfit - estimatedTax

    return {
      revenue,
      expenses,
      grossProfit,
      zelfstandigenaftrek,
      startersaftrek,
      mkbWinstvrijstelling,
      taxableIncome,
      estimatedTax,
      vatDue,
      vatReclaimable,
      netProfit
    }
  }

  const taxData = calculateTax()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Tax Calculator</h1>
          <p className="text-gray-500 text-sm mt-1">Calculate your Dutch tax obligations for 2025</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Input Values</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Total Revenue (€)</label>
                <input
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">Total Expenses (€)</label>
                <input
                  type="number"
                  value={expenses}
                  onChange={(e) => setExpenses(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">Hours Worked</label>
                <input
                  type="number"
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 1225 hours required for deductions</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">VAT Rate (%)</label>
                <select
                  value={vatRate}
                  onChange={(e) => setVatRate(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value={21}>21% - Standard Rate</option>
                  <option value={9}>9% - Reduced Rate</option>
                  <option value={0}>0% - Zero Rate</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isStarter"
                  checked={isStarter}
                  onChange={(e) => setIsStarter(e.target.checked)}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-2"
                />
                <label htmlFor="isStarter" className="text-sm text-black">
                  I am a starter (first 3 years)
                </label>
              </div>
            </div>
          </div>

          {/* Tax Deductions Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Tax Deductions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-black">Zelfstandigenaftrek</span>
                </div>
                <span className="text-sm text-gray-600">€2,470</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-black">Startersaftrek</span>
                </div>
                <span className="text-sm text-gray-600">€2,123</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-black">MKB Winstvrijstelling</span>
                </div>
                <span className="text-sm text-gray-600">12.7%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Gross Profit</p>
                  <p className="text-2xl font-bold text-black mt-1">€{taxData.grossProfit.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Estimated Tax</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">€{taxData.estimatedTax.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Net Profit</p>
                  <p className="text-2xl font-bold text-black mt-1">€{taxData.netProfit.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-black" />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Tax Breakdown</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="text-sm font-medium text-black">€{taxData.revenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Expenses</span>
                <span className="text-sm font-medium text-black">-€{taxData.expenses.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-sm font-medium text-black">Gross Profit</span>
                <span className="text-sm font-bold text-black">€{taxData.grossProfit.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Zelfstandigenaftrek</span>
                <span className="text-sm font-medium text-green-600">-€{taxData.zelfstandigenaftrek.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Startersaftrek</span>
                <span className="text-sm font-medium text-green-600">-€{taxData.startersaftrek.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">MKB Winstvrijstelling</span>
                <span className="text-sm font-medium text-green-600">-€{taxData.mkbWinstvrijstelling.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-sm font-medium text-black">Taxable Income</span>
                <span className="text-sm font-bold text-black">€{taxData.taxableIncome.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-black">Estimated Tax (37%)</span>
                <span className="text-sm font-bold text-red-600">€{taxData.estimatedTax.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* VAT Calculation */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-black mb-4">VAT Calculation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">VAT Due (Output)</span>
                  <span className="text-sm font-medium text-red-600">€{taxData.vatDue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">VAT Reclaimable (Input)</span>
                  <span className="text-sm font-medium text-green-600">€{taxData.vatReclaimable.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-black">Net VAT Due</span>
                  <span className="text-sm font-bold text-black">€{(taxData.vatDue - taxData.vatReclaimable).toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-black mb-2">VAT Rate: {vatRate}%</h4>
                <p className="text-xs text-gray-600">
                  Standard rate: 21%<br/>
                  Reduced rate: 9%<br/>
                  Zero rate: 0%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 