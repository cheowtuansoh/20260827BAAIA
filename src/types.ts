export type MarketCategory = 'INDICES' | 'STOCKS' | 'CRYPTO' | 'FUTURES' | 'FOREX' | 'BONDS' | 'ECONOMY';

export interface CandlestickPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketInstrument {
  id: string;
  symbol: string;
  name: string;
  category: MarketCategory;
  subCategory?: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: string;
  marketCap?: string;
  sparklineData: number[];
  candlestickData: CandlestickPoint[];
  badgeNumber?: string;
  badgeColor?: string;
  badgeBg?: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  country?: string;
  exchange?: string;
  description?: string;
  peRatio?: number;
  dividendYield?: number;
  week52High?: number;
  week52Low?: number;
  rsi?: number;
  lastTickDirection?: 'up' | 'down' | null;
  lastTickTime?: number;
}

export interface PortfolioPosition {
  instrumentId: string;
  symbol: string;
  name: string;
  shares: number;
  avgBuyPrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  category: MarketCategory;
}

export interface TransactionRecord {
  id: string;
  instrumentId: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  totalAmount: number;
  timestamp: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  category: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  summary: string;
  relatedSymbols: string[];
  imageUrl?: string;
  readTime: string;
}

export interface PriceAlert {
  id: string;
  instrumentId: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  createdAt: string;
  triggered?: boolean;
}

export type ActiveTab = 'markets' | 'watchlist' | 'news' | 'portfolio' | 'settings';
