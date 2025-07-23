// Dutch Tax Rules Engine for Sole Proprietors (Eenmanszaak) 2025
export interface TaxRates2025 {
  incomeTax: {
    bracket1: { max: 38441; rate: 0.3582 }
    bracket2: { min: 38441; max: 76817; rate: 0.3748 }
    bracket3: { min: 76817; rate: 0.4950 }
  }
  vat: {
    standard: 0.21
    reduced: 0.09
    zero: 0.00
  }
}

export interface TaxDeductions2025 {
  zelfstandigenaftrek: 2470
  startersaftrek: 2123
  mkbWinstvrijstellingRate: 0.127
  korThreshold: 20000
  kiaMinimumInvestment: 2900
  kiaAssetMinimum: 450
  kiaMaximumInvestment: 392230
  representationThreshold: 5700
  representationPercentage: 0.80
}

export const TAX_RATES_2025: TaxRates2025 = {
  incomeTax: {
    bracket1: { max: 38441, rate: 0.3582 },
    bracket2: { min: 38441, max: 76817, rate: 0.3748 },
    bracket3: { min: 76817, rate: 0.4950 }
  },
  vat: {
    standard: 0.21,
    reduced: 0.09,
    zero: 0.00
  }
}

export const TAX_DEDUCTIONS_2025: TaxDeductions2025 = {
  zelfstandigenaftrek: 2470,
  startersaftrek: 2123,
  mkbWinstvrijstellingRate: 0.127,
  korThreshold: 20000,
  kiaMinimumInvestment: 2900,
  kiaAssetMinimum: 450,
  kiaMaximumInvestment: 392230,
  representationThreshold: 5700,
  representationPercentage: 0.80
}

// KIA (Kleinschaligheidsinvesteringsaftrek) calculation brackets
export function calculateKIA(totalInvestment: number): number {
  if (totalInvestment <= TAX_DEDUCTIONS_2025.kiaMinimumInvestment) {
    return 0
  }
  
  if (totalInvestment >= TAX_DEDUCTIONS_2025.kiaMaximumInvestment) {
    return 0
  }
  
  if (totalInvestment <= 70602) {
    return totalInvestment * 0.28
  }
  
  if (totalInvestment <= 130744) {
    return 19769
  }
  
  // €130,745 – €392,230: €19,769 minus 7.56% of the amount above €130,744
  const excess = totalInvestment - 130744
  return Math.max(0, 19769 - (excess * 0.0756))
}

// Calculate income tax based on 2025 brackets
export function calculateIncomeTax(taxableIncome: number): number {
  let tax = 0
  
  if (taxableIncome <= TAX_RATES_2025.incomeTax.bracket1.max) {
    tax = taxableIncome * TAX_RATES_2025.incomeTax.bracket1.rate
  } else if (taxableIncome <= TAX_RATES_2025.incomeTax.bracket2.max) {
    tax = TAX_RATES_2025.incomeTax.bracket1.max * TAX_RATES_2025.incomeTax.bracket1.rate
    tax += (taxableIncome - TAX_RATES_2025.incomeTax.bracket1.max) * TAX_RATES_2025.incomeTax.bracket2.rate
  } else {
    tax = TAX_RATES_2025.incomeTax.bracket1.max * TAX_RATES_2025.incomeTax.bracket1.rate
    tax += (TAX_RATES_2025.incomeTax.bracket2.max - TAX_RATES_2025.incomeTax.bracket1.max) * TAX_RATES_2025.incomeTax.bracket2.rate
    tax += (taxableIncome - TAX_RATES_2025.incomeTax.bracket2.max) * TAX_RATES_2025.incomeTax.bracket3.rate
  }
  
  return tax
}

// Check if entrepreneur meets hours criterion (urencriterium)
export function meetsHoursCriterion(hoursWorked: number): boolean {
  return hoursWorked >= 1225 // At least 1,225 hours per year
}

// Check if eligible for startersaftrek
export function isEligibleForStartersaftrek(
  currentYear: number,
  firstYearBusiness: number,
  yearsUsedZelfstandigenaftrek: number
): boolean {
  const yearsInBusiness = currentYear - firstYearBusiness + 1
  
  // Must be within first 5 years and used zelfstandigenaftrek max 2 times before
  return yearsInBusiness <= 5 && yearsUsedZelfstandigenaftrek <= 2
}

// Calculate representation costs deduction
export function calculateRepresentationDeduction(
  representationCosts: number,
  usePercentageMethod: boolean = true
): number {
  if (usePercentageMethod) {
    return representationCosts * TAX_DEDUCTIONS_2025.representationPercentage
  } else {
    // Threshold method
    return Math.max(0, representationCosts - TAX_DEDUCTIONS_2025.representationThreshold)
  }
}

// Calculate car bijtelling (private use addition)
export function calculateCarBijtelling(
  catalogValue: number,
  isElectric: boolean,
  isHydrogen: boolean = false,
  hasSolarPanels: boolean = false,
  privateKilometers: number
): number {
  if (privateKilometers <= 500) {
    return 0 // No bijtelling if private use <= 500km
  }
  
  let bijtelling = 0
  
  if (isElectric && (isHydrogen || hasSolarPanels)) {
    // Full 17% rate for hydrogen or solar panel cars
    bijtelling = catalogValue * 0.17
  } else if (isElectric) {
    // 17% for first €30,000, 22% for remainder
    const firstPortion = Math.min(catalogValue, 30000)
    const remainder = Math.max(0, catalogValue - 30000)
    bijtelling = (firstPortion * 0.17) + (remainder * 0.22)
  } else {
    // 22% for all fossil fuel cars
    bijtelling = catalogValue * 0.22
  }
  
  return bijtelling
}

// Check KOR (Small Business Scheme) eligibility and warnings
export function checkKORStatus(
  yearlyTurnover: number,
  isOptedIn: boolean
): {
  eligible: boolean
  warningMessage?: string
  mustExit: boolean
} {
  if (yearlyTurnover > TAX_DEDUCTIONS_2025.korThreshold) {
    return {
      eligible: false,
      mustExit: true,
      warningMessage: `Turnover exceeds €${TAX_DEDUCTIONS_2025.korThreshold.toLocaleString()}. You must exit KOR immediately.`
    }
  }
  
  if (yearlyTurnover > TAX_DEDUCTIONS_2025.korThreshold * 0.9) {
    return {
      eligible: true,
      mustExit: false,
      warningMessage: `Warning: Approaching KOR limit. Current turnover: €${yearlyTurnover.toLocaleString()}`
    }
  }
  
  return {
    eligible: true,
    mustExit: false
  }
}

// Comprehensive tax calculation for sole proprietor
export interface TaxCalculationResult {
  grossProfit: number
  zelfstandigenaftrek: number
  startersaftrek: number
  totalOndernemersaftrek: number
  profitAfterOndernemersaftrek: number
  mkbWinstvrijstelling: number
  taxableProfit: number
  incomeTax: number
  effectiveTaxRate: number
  vatDue: number
  vatReclaimable: number
  netVatPosition: number
  kiaDeduction: number
  representationDeduction: number
  carBijtelling: number
}

export function calculateComprehensiveTax(params: {
  grossProfit: number
  hoursWorked: number
  isStarterEligible: boolean
  yearlyInvestments: number
  representationCosts: number
  carCatalogValue?: number
  carIsElectric?: boolean
  carPrivateKm?: number
  vatOnSales: number
  vatOnExpenses: number
}): TaxCalculationResult {
  const {
    grossProfit,
    hoursWorked,
    isStarterEligible,
    yearlyInvestments,
    representationCosts,
    carCatalogValue = 0,
    carIsElectric = false,
    carPrivateKm = 0,
    vatOnSales,
    vatOnExpenses
  } = params
  
  // Calculate entrepreneur deductions
  const meetsHours = meetsHoursCriterion(hoursWorked)
  const zelfstandigenaftrek = meetsHours ? TAX_DEDUCTIONS_2025.zelfstandigenaftrek : 0
  const startersaftrek = (meetsHours && isStarterEligible) ? TAX_DEDUCTIONS_2025.startersaftrek : 0
  const totalOndernemersaftrek = zelfstandigenaftrek + startersaftrek
  
  // Calculate KIA deduction
  const kiaDeduction = calculateKIA(yearlyInvestments)
  
  // Calculate representation costs deduction
  const representationDeduction = calculateRepresentationDeduction(representationCosts)
  
  // Calculate car bijtelling
  const carBijtelling = carCatalogValue > 0 ? 
    calculateCarBijtelling(carCatalogValue, carIsElectric, false, false, carPrivateKm) : 0
  
  // Calculate profit after deductions
  const profitAfterOndernemersaftrek = Math.max(0, grossProfit - totalOndernemersaftrek)
  const mkbWinstvrijstelling = profitAfterOndernemersaftrek * TAX_DEDUCTIONS_2025.mkbWinstvrijstellingRate
  
  // Add bijtelling back to taxable profit
  const taxableProfit = profitAfterOndernemersaftrek - mkbWinstvrijstelling + carBijtelling
  
  // Calculate income tax
  const incomeTax = calculateIncomeTax(taxableProfit)
  const effectiveTaxRate = grossProfit > 0 ? (incomeTax / grossProfit) * 100 : 0
  
  // VAT calculations
  const vatDue = vatOnSales
  const vatReclaimable = vatOnExpenses
  const netVatPosition = vatDue - vatReclaimable
  
  return {
    grossProfit,
    zelfstandigenaftrek,
    startersaftrek,
    totalOndernemersaftrek,
    profitAfterOndernemersaftrek,
    mkbWinstvrijstelling,
    taxableProfit,
    incomeTax,
    effectiveTaxRate,
    vatDue,
    vatReclaimable,
    netVatPosition,
    kiaDeduction,
    representationDeduction,
    carBijtelling
  }
} 