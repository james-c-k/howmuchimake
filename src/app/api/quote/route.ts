import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 60;

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        previousClose?: number;
        currency?: string;
      };
    }>;
    error?: { code: string; description: string } | null;
  };
}

async function fetchYahoo(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; HowMuchIMake/1.0; +https://github.com/)",
      Accept: "application/json",
    },
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Yahoo ${symbol} ${res.status}`);
  }
  const data = (await res.json()) as YahooChartResponse;
  const result = data.chart?.result?.[0];
  const meta = result?.meta;
  if (!meta?.regularMarketPrice) {
    throw new Error(`Yahoo ${symbol} no price`);
  }
  return {
    price: meta.regularMarketPrice,
    previousClose: meta.chartPreviousClose ?? meta.previousClose,
    currency: meta.currency ?? "USD",
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbolsParam = searchParams.get("symbols");
  if (!symbolsParam) {
    return NextResponse.json({ error: "missing symbols" }, { status: 400 });
  }
  const symbols = symbolsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const results = await Promise.allSettled(symbols.map((s) => fetchYahoo(s)));

  const payload = symbols.map((symbol, i) => {
    const r = results[i];
    if (r.status === "fulfilled") {
      return {
        quoteSymbol: symbol,
        price: r.value.price,
        previousClose: r.value.previousClose ?? null,
        currency: r.value.currency,
        updatedAt: Date.now(),
      };
    }
    return {
      quoteSymbol: symbol,
      error: r.reason instanceof Error ? r.reason.message : "failed",
    };
  });

  return NextResponse.json({ quotes: payload });
}
