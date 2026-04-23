import type { Asset, HoldingSummary, Quote, Transaction } from "./types";

export function summarizeAsset(
  asset: Asset,
  transactions: Transaction[],
  quote: Quote | null,
  fxToTWD: Record<string, number>,
): HoldingSummary {
  const txs = transactions
    .filter((t) => t.assetId === asset.id)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  let units = 0;
  let avgCost = 0;
  let realizedPnl = 0;

  for (const tx of txs) {
    if (tx.side === "buy") {
      const cost = tx.price * tx.units + tx.fee + tx.tax;
      const newUnits = units + tx.units;
      avgCost = newUnits > 0 ? (avgCost * units + cost) / newUnits : 0;
      units = newUnits;
    } else {
      const proceeds = tx.price * tx.units - tx.fee - tx.tax;
      realizedPnl += proceeds - avgCost * tx.units;
      units = Math.max(0, units - tx.units);
      if (units === 0) avgCost = 0;
    }
  }

  const totalCost = units * avgCost;
  const currentPrice = quote ? quote.price : null;
  const marketValue = currentPrice !== null ? currentPrice * units : null;
  const unrealizedPnl = marketValue !== null ? marketValue - totalCost : null;

  const fx = asset.currency === "TWD" ? 1 : fxToTWD[asset.currency] ?? null;
  const totalCostTWD = fx !== null ? totalCost * fx : totalCost;
  const marketValueTWD = marketValue !== null && fx !== null ? marketValue * fx : null;
  const unrealizedPnlTWD =
    unrealizedPnl !== null && fx !== null ? unrealizedPnl * fx : null;

  return {
    asset,
    units,
    avgCost,
    totalCost,
    realizedPnl,
    currentPrice,
    marketValue,
    unrealizedPnl,
    totalCostTWD,
    marketValueTWD,
    unrealizedPnlTWD,
  };
}

export function totalsTWD(holdings: HoldingSummary[]) {
  let cost = 0;
  let market = 0;
  let unrealized = 0;
  let realized = 0;
  let hasMarket = true;
  for (const h of holdings) {
    cost += h.totalCostTWD;
    realized += h.realizedPnl;
    if (h.marketValueTWD === null) {
      hasMarket = false;
    } else {
      market += h.marketValueTWD;
      if (h.unrealizedPnlTWD !== null) unrealized += h.unrealizedPnlTWD;
    }
  }
  return {
    cost,
    market: hasMarket ? market : null,
    unrealized: hasMarket ? unrealized : null,
    realized,
    totalPnl: hasMarket ? unrealized + realized : null,
    returnPct: hasMarket && cost > 0 ? ((unrealized + realized) / cost) * 100 : null,
  };
}

export function formatMoney(v: number | null, currency = "TWD", digits = 0): string {
  if (v === null || Number.isNaN(v)) return "-";
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  const s = abs.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${sign}${currency} ${s}`;
}

export function formatPct(v: number | null, digits = 2): string {
  if (v === null || Number.isNaN(v)) return "-";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(digits)}%`;
}

export function pnlClass(v: number | null): string {
  if (v === null || v === 0) return "text-gray-500";
  return v > 0 ? "text-profit" : "text-loss";
}
