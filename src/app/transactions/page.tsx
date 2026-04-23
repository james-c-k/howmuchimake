"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import TransactionForm from "@/components/TransactionForm";
import { usePortfolio } from "@/hooks/usePortfolio";
import { uid } from "@/lib/storage";

export default function TransactionsPage() {
  const { portfolio, loaded, addTransaction, removeTransaction } = usePortfolio();
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const assetMap = useMemo(() => {
    return new Map(portfolio.assets.map((a) => [a.id, a]));
  }, [portfolio.assets]);

  const filtered = useMemo(() => {
    const list =
      filter === "all"
        ? portfolio.transactions
        : portfolio.transactions.filter((t) => t.assetId === filter);
    return list.slice().sort((a, b) => b.date.localeCompare(a.date));
  }, [portfolio.transactions, filter]);

  if (!loaded) return <div className="py-20 text-center text-gray-400">載入中…</div>;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">交易紀錄</h1>
        {!adding && portfolio.assets.length > 0 && (
          <button
            onClick={() => setAdding(true)}
            className="rounded-lg bg-line px-3 py-1.5 text-sm font-semibold text-white"
          >
            ＋ 新增
          </button>
        )}
      </header>

      {adding && (
        <TransactionForm
          assets={portfolio.assets}
          onSubmit={(data) => {
            addTransaction({ id: uid(), createdAt: Date.now(), ...data });
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {portfolio.assets.length > 0 && (
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">全部標的</option>
          {portfolio.assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.symbol} — {a.name}
            </option>
          ))}
        </select>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          {portfolio.assets.length === 0 ? (
            <>
              請先到{" "}
              <Link href="/assets" className="text-line underline">
                「標的」頁
              </Link>{" "}
              建立至少一檔投資
            </>
          ) : (
            <>尚無交易紀錄</>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((t) => {
            const asset = assetMap.get(t.assetId);
            return (
              <li key={t.id} className="rounded-xl bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span
                      className={`mr-2 rounded px-2 py-0.5 text-xs font-semibold text-white ${
                        t.side === "buy" ? "bg-profit" : "bg-loss"
                      }`}
                    >
                      {t.side === "buy" ? "買" : "賣"}
                    </span>
                    <span className="font-semibold">
                      {asset ? asset.symbol : "(已刪除)"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">{t.date}</div>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {t.units.toLocaleString("en-US", { maximumFractionDigits: 4 })} @{" "}
                    {t.price.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                    {t.note ? ` · ${t.note}` : ""}
                    {t.recurringPlanId ? " · 定期定額" : ""}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm("刪除此筆交易？")) removeTransaction(t.id);
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    刪除
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
