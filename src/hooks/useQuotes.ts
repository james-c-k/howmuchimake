"use client";

import { useCallback, useEffect, useState } from "react";
import type { Quote } from "@/lib/types";

interface QuoteResponseItem {
  quoteSymbol: string;
  price?: number;
  previousClose?: number | null;
  currency?: string;
  updatedAt?: number;
  error?: string;
}

interface FxResponse {
  rates: Record<string, number>;
  errors?: Record<string, string>;
  updatedAt: number;
}

export interface QuoteBundle {
  quotes: Record<string, Quote>;
  fx: Record<string, number>;
  loading: boolean;
  error: string | null;
  refreshedAt: number | null;
  refresh: () => Promise<void>;
}

export function useQuotes(
  symbols: string[],
  currencies: string[],
): QuoteBundle {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [fx, setFx] = useState<Record<string, number>>({ TWD: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<number | null>(null);

  const symbolsKey = symbols.slice().sort().join(",");
  const currenciesKey = currencies
    .filter((c) => c !== "TWD")
    .slice()
    .sort()
    .join(",");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const promises: Promise<void>[] = [];
      if (symbolsKey) {
        promises.push(
          fetch(`/api/quote?symbols=${encodeURIComponent(symbolsKey)}`)
            .then((r) => r.json())
            .then((data: { quotes: QuoteResponseItem[] }) => {
              const map: Record<string, Quote> = {};
              for (const q of data.quotes ?? []) {
                if (typeof q.price === "number") {
                  map[q.quoteSymbol] = {
                    quoteSymbol: q.quoteSymbol,
                    price: q.price,
                    previousClose: q.previousClose ?? undefined,
                    currency: q.currency ?? "USD",
                    updatedAt: q.updatedAt ?? Date.now(),
                  };
                }
              }
              setQuotes(map);
            }),
        );
      } else {
        setQuotes({});
      }

      if (currenciesKey) {
        promises.push(
          fetch(`/api/fx?currencies=${encodeURIComponent(currenciesKey)}`)
            .then((r) => r.json())
            .then((data: FxResponse) => {
              setFx({ TWD: 1, ...(data.rates ?? {}) });
            }),
        );
      } else {
        setFx({ TWD: 1 });
      }

      await Promise.all(promises);
      setRefreshedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "fetch failed");
    } finally {
      setLoading(false);
    }
  }, [symbolsKey, currenciesKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { quotes, fx, loading, error, refreshedAt, refresh };
}
