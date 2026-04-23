export type AssetType = "tw_stock" | "us_stock" | "fund" | "currency" | "crypto" | "other";

export type TransactionSide = "buy" | "sell";

export interface Asset {
  id: string;
  type: AssetType;
  symbol: string;
  quoteSymbol: string;
  name: string;
  currency: "TWD" | "USD" | "JPY" | "EUR" | "CNY" | "HKD";
  fundNavUrl?: string;
  createdAt: number;
}

export interface Transaction {
  id: string;
  assetId: string;
  side: TransactionSide;
  price: number;
  units: number;
  fee: number;
  tax: number;
  date: string;
  note?: string;
  recurringPlanId?: string;
  createdAt: number;
}

export type RecurringFrequency = "weekly" | "biweekly" | "monthly";

export interface RecurringPlan {
  id: string;
  assetId: string;
  amount: number;
  frequency: RecurringFrequency;
  dayOfPeriod: number;
  startDate: string;
  endDate?: string;
  active: boolean;
  createdAt: number;
}

export interface Quote {
  quoteSymbol: string;
  price: number;
  currency: string;
  previousClose?: number;
  updatedAt: number;
}

export interface Portfolio {
  assets: Asset[];
  transactions: Transaction[];
  recurringPlans: RecurringPlan[];
}

export interface HoldingSummary {
  asset: Asset;
  units: number;
  avgCost: number;
  totalCost: number;
  realizedPnl: number;
  currentPrice: number | null;
  marketValue: number | null;
  unrealizedPnl: number | null;
  marketValueTWD: number | null;
  totalCostTWD: number;
  unrealizedPnlTWD: number | null;
}
