import type { Asset, Portfolio, RecurringPlan, Transaction } from "./types";

const STORAGE_KEY = "howmuchimake.portfolio.v1";

const empty: Portfolio = { assets: [], transactions: [], recurringPlans: [] };

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadPortfolio(): Portfolio {
  if (!isBrowser()) return empty;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw) as Partial<Portfolio>;
    return {
      assets: parsed.assets ?? [],
      transactions: parsed.transactions ?? [],
      recurringPlans: parsed.recurringPlans ?? [],
    };
  } catch {
    return empty;
  }
}

export function savePortfolio(portfolio: Portfolio) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
}

export function exportPortfolioJSON(portfolio: Portfolio) {
  return JSON.stringify(portfolio, null, 2);
}

export function importPortfolioJSON(text: string): Portfolio {
  const parsed = JSON.parse(text) as Partial<Portfolio>;
  return {
    assets: parsed.assets ?? [],
    transactions: parsed.transactions ?? [],
    recurringPlans: parsed.recurringPlans ?? [],
  };
}

export function upsertAsset(portfolio: Portfolio, asset: Asset): Portfolio {
  const idx = portfolio.assets.findIndex((a) => a.id === asset.id);
  const assets = [...portfolio.assets];
  if (idx >= 0) assets[idx] = asset;
  else assets.push(asset);
  return { ...portfolio, assets };
}

export function removeAsset(portfolio: Portfolio, id: string): Portfolio {
  return {
    ...portfolio,
    assets: portfolio.assets.filter((a) => a.id !== id),
    transactions: portfolio.transactions.filter((t) => t.assetId !== id),
    recurringPlans: portfolio.recurringPlans.filter((p) => p.assetId !== id),
  };
}

export function addTransaction(portfolio: Portfolio, tx: Transaction): Portfolio {
  return { ...portfolio, transactions: [...portfolio.transactions, tx] };
}

export function removeTransaction(portfolio: Portfolio, id: string): Portfolio {
  return { ...portfolio, transactions: portfolio.transactions.filter((t) => t.id !== id) };
}

export function upsertRecurringPlan(portfolio: Portfolio, plan: RecurringPlan): Portfolio {
  const idx = portfolio.recurringPlans.findIndex((p) => p.id === plan.id);
  const plans = [...portfolio.recurringPlans];
  if (idx >= 0) plans[idx] = plan;
  else plans.push(plan);
  return { ...portfolio, recurringPlans: plans };
}

export function removeRecurringPlan(portfolio: Portfolio, id: string): Portfolio {
  return { ...portfolio, recurringPlans: portfolio.recurringPlans.filter((p) => p.id !== id) };
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
