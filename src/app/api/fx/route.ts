import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 300;

async function fetchRate(from: string): Promise<number> {
  if (from === "TWD") return 1;
  const symbol = `${from}TWD=X`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; HowMuchIMake/1.0;)",
      Accept: "application/json",
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`FX ${symbol} ${res.status}`);
  const data = await res.json();
  const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
  if (typeof price !== "number") throw new Error(`FX ${symbol} no price`);
  return price;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const currenciesParam = searchParams.get("currencies") ?? "USD";
  const currencies = Array.from(
    new Set(currenciesParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)),
  );

  const results = await Promise.allSettled(currencies.map((c) => fetchRate(c)));
  const rates: Record<string, number> = {};
  const errors: Record<string, string> = {};
  currencies.forEach((c, i) => {
    const r = results[i];
    if (r.status === "fulfilled") rates[c] = r.value;
    else errors[c] = r.reason instanceof Error ? r.reason.message : "failed";
  });

  return NextResponse.json({ rates, errors, updatedAt: Date.now() });
}
