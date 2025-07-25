// Financial Ratios Response Model
export interface FinancialRatiosResponse {
  data: {
    records: FinancialRatio[];
  };
}

export interface FinancialRatio {
  year: number;
  quarter: number;
  debtToEquity: number | null;
  fixedAssetToEquity: number | null;
  equityToCharterCapital: number | null;
  netProfitMargin: number | null;
  roe: number | null;
  roic: number | null;
  roa: number | null;
  dividendYield: number | null;
  financialLeverage: number | null;
  marketCapital: number | null;
  outstandingShares: number | null;
  peRatio: number | null;
  pbRatio: number | null;
  psRatio: number | null;
  pCashFlow: number | null;
  eps: number | null;
  bvps: number | null;
  [key: string]: any; // For additional properties
}

// Income Statement Response Model
export interface IncomeStatementResponse {
  data: {
    records: IncomeStatement[];
  };
}

export interface IncomeStatement {
  year: number;
  quarter: number;
  revenue: number | null;
  netProfit: number | null;
  profitAfterTax: number | null;
  profitAttributableToParent: number | null;
  grossProfit?: number | null; // Optional for backward compatibility
  operatingIncome?: number | null; // Optional for backward compatibility
  netIncome?: number | null; // Optional for backward compatibility
  eps?: number | null; // Optional for backward compatibility
  ebitda?: number | null; // Optional for backward compatibility
  ebit?: number | null; // Optional for backward compatibility
  totalAssets?: number | null; // Optional for backward compatibility
  totalEquity?: number | null; // Optional for backward compatibility
  totalDebt?: number | null; // Optional for backward compatibility
  workingCapital?: number | null; // Optional for backward compatibility
  [key: string]: any; // For additional properties
}

// Combined Financial Data for easier use
export interface FinancialData {
  ratios: FinancialRatiosResponse | null;
  incomeStatement: IncomeStatementResponse | null;
}

// Helper function to format period display
export function formatPeriod(year: number, quarter: number): string {
  return `Q${quarter}/${year}`;
}
