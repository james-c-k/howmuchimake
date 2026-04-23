"use client";

import Link from "next/link";
import { formatMoney, formatPct, pnlClass } from "@/lib/calculations";
import type { HoldingSummary } from "@/lib/types";

const typeLabels: Record<string, string> = {
  tw_stock: "台股",
  us_stock: "美股",
  fund: "基金",
  currency: "外幣",
  crypto: "加密貨幣",
  other: "其他",
};

export default function HoldingsList({
  holdings,
}: {
  holdings: HoldingSummary[];
}) {
  if (holdings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        還沒有任何持倉，
        <Link href="/assets" className="text-line underline">
          先新增一個標的
        </Link>
        。
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {holdings.map((h) => {
        const pctChange =
          h.currentPrice !== null && h.avgCost > 0
            ? ((h.currentPrice - h.avgCost) / h.avgCost) * 100
            : null;
        return (
          <li key={h.asset.id}>
            <Link
              href={`/assets/${h.asset.id}`}
              className="block rounded-xl bg-white p-4 shadow-sm hover:shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{h.asset.symbol}</span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                      {typeLabels[h.asset.type] ?? h.asset.type}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{h.asset.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatMoney(h.marketValueTWD, "TWD")}
                  </div>
                  <div className={`text-xs ${pnlClass(h.unrealizedPnlTWD)}`}>
                    {formatMoney(h.unrealizedPnlTWD, "TWD")} ({formatPct(pctChange)})
                  </div>
                </div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>
                  持有 {h.units.toLocaleString("en-US", { maximumFractionDigits: 4 })} 單位
                </span>
                <span>
                  均價 {h.avgCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </span>
                <span>
                  現價{" "}
                  {h.currentPrice !== null
                    ? h.currentPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })
                    : "—"}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
