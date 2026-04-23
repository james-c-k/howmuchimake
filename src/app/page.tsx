"use client";

import { useMemo } from "react";
import HoldingsList from "@/components/HoldingsList";
import PortfolioSummary from "@/components/PortfolioSummary";
import { summarizeAsset, totalsTWD } from "@/lib/calculations";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useQuotes } from "@/hooks/useQuotes";

export default function DashboardPage() {
  const { portfolio, loaded } = usePortfolio();

  const symbols = useMemo(
    () => portfolio.assets.map((a) => a.quoteSymbol).filter(Boolean),
    [portfolio.assets],
  );
  const currencies = useMemo(
    () => Array.from(new Set(portfolio.assets.map((a) => a.currency))),
    [portfolio.assets],
  );

  const { quotes, fx, loading, refreshedAt, refresh } = useQuotes(
    symbols,
    currencies,
  );

  const holdings = useMemo(() => {
    return portfolio.assets
      .map((asset) =>
        summarizeAsset(
          asset,
          portfolio.transactions,
          quotes[asset.quoteSymbol] ?? null,
          fx,
        ),
      )
      .filter((h) => h.units > 0.0001 || h.realizedPnl !== 0)
      .sort((a, b) => (b.marketValueTWD ?? 0) - (a.marketValueTWD ?? 0));
  }, [portfolio.assets, portfolio.transactions, quotes, fx]);

  const totals = useMemo(() => totalsTWD(holdings), [holdings]);

  if (!loaded) {
    return <div className="py-20 text-center text-gray-400">載入中…</div>;
  }

  return (
    <div className="space-y-4">
      <PortfolioSummary
        cost={totals.cost}
        market={totals.market}
        unrealized={totals.unrealized}
        realized={totals.realized}
        totalPnl={totals.totalPnl}
        returnPct={totals.returnPct}
        refreshedAt={refreshedAt}
        loading={loading}
        onRefresh={() => void refresh()}
      />
      <section>
        <h2 className="mb-2 px-1 text-sm font-semibold text-gray-600">持倉</h2>
        <HoldingsList holdings={holdings} />
      </section>
    </div>
  );
}
