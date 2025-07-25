export interface StockResponse {
  data: StockData;
  statusCode: number;
  isSuccess: boolean;
  message: string;
}

export interface StockData {
  stock: StockInfo;
  historical: HistoricalData;
  news: NewsData;
  events: EventsData;
  shareholders: ShareholdersData;
  officers: OfficersData;
  tradingStats: TradingStatsData;
  incomeStatement: IncomeStatementData;
  financeRatios: FinanceRatiosData;
}

export interface StockInfo {
  id: number;
  name: string;
  code: string;
  companyDescription: string;
  logoUrl: string;
}

export interface HistoricalData {
  records: HistoricalRecord[];
}

export interface HistoricalRecord {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

export interface NewsData {
  articles: NewsArticle[];
}

export interface NewsArticle {
  title: string;
  publishedDate: string;
  url: string;
  summary: string;
}

export interface EventsData {
  events: StockEvent[];
}

export interface StockEvent {
  eventTitle: string;
  publicDate: string;
  issueDate: string;
  sourceUrl: string;
  eventListCode: string;
  ratio: string;
  value: string;
  recordDate: string;
  exrightDate: string;
  eventListName: string;
}

export interface ShareholdersData {
  shareholders: Shareholder[];
}

export interface Shareholder {
  name: string;
  quantity: number;
  ownershipPercentage: number;
  updateDate: string;
}

export interface OfficersData {
  officers: Officer[];
}

export interface Officer {
  officerName: string;
  officerPosition: string;
  positionShortName: string;
  updateDate: string;
  officerOwnPercent: number;
  quantity: number;
}

export interface TradingStatsData {
  stats: TradingStats;
}

export interface TradingStats {
  ceiling: number;
  floor: number;
  refPrice: number;
  open: number;
  matchPrice: number;
  closePrice: number;
  priceChange: number;
}

export interface IncomeStatementData {
  records: IncomeStatementRecord[];
}

export interface IncomeStatementRecord {
  year: number;
  quarter: number;
  revenue: number;
  netProfit: number;
  profitAfterTax: number;
  profitAttributableToParent: number;
}

export interface FinanceRatiosData {
  records: FinanceRatioRecord[];
}

export interface FinanceRatioRecord {
  year: number;
  quarter: number;
  debtToEquity: number;
  fixedAssetToEquity: number;
  equityToCharterCapital: number;
  netProfitMargin: number;
  roe: number;
  roic: number;
  roa: number;
  dividendYield: number;
  financialLeverage: number;
  marketCapital: number;
  outstandingShares: number;
  peRatio: number;
  pbRatio: number;
  psRatio: number;
  pCashFlow: number;
  eps: number;
  bvps: number;
}
