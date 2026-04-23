"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import AssetForm from "@/components/AssetForm";
import TransactionForm from "@/components/TransactionForm";
import { formatMoney, formatPct, pnlClass, summarizeAsset } from "@/lib/calculations";
import { uid } from "@/lib/storage";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useQuotes } from "@/hooks/useQuotes";

export default function AssetDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    portfolio,
    loaded,
    upsertAsset,
    removeAsset,
    addTransaction,
    removeTransaction,
  } = usePortfolio();
  const [editing, setEditing] = useState(false);
  const [addingTx, setAddingTx] = useState(false);

  const asset = portfolio.assets.find((a) => a.id === params.id);
  const symbols = asset ? [asset.quoteSymbol] : [];
  const currencies = asset ? [asset.currency] : [];
  const { quotes, fx, loading, refresh } = useQuotes(symbols, currencies);

  const summary = useMemo(() => {
    if (!asset) return null;
    return summarizeAsset(
      asset,
      portfolio.transactions,
      quotes[asset.quoteSymbol] ?? null,
      fx,
    );
  }, [asset, portfolio.transactions, quotes, fx]);

  const txs = useMemo(() => {
    if (!asset) return [];
    return portfolio.transactions
      .filter((t) => t.assetId === asset.id)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [asset, portfolio.transactions]);

  if (!loaded) return <div className="py-20 text-center text-gray-400">載入中…</div>;
  if (!asset || !summary) {
    return (
      <div className="py-10 text-center text-sm text-gray-500">
        標的不存在。
        <Link href="/assets" className="ml-1 text-line underline">
          回到標的列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{asset.name}</div>
          <h1 className="text-xl font-semibold">
            {asset.symbol}{" "}
            <span className="text-sm font-normal text-gray-400">
              ({asset.currency})
            </span>
          </h1>
        </div>
        <button
          onClick={() => void refresh()}
          disabled={loading}
          className="rounded-full bg-gray-100 px-3 py-1 text-xs"
        >
          {loading ? "更新中" : "重新整理"}
        </button>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <Stat
          label="現價"
          value={
            summary.currentPrice !== null
              ? summary.currentPrice.toLocaleString("en-US", {
                  maximumFractionDigits: 4,
                })
              : "—"
          }
        />
        <Stat
          label="平均成本"
          value={summary.avgCost.toLocaleString("en-US", {
            maximumFractionDigits: 4,
          })}
        />
        <Stat
          label="持有單位"
          value={summary.units.toLocaleString("en-US", {
            maximumFractionDigits: 4,
          })}
        />
        <Stat
          label="市值（TWD）"
          value={formatMoney(summary.marketValueTWD)}
        />
        <Stat
          label="未實現損益"
          value={formatMoney(summary.unrealizedPnlTWD)}
          className={pnlClass(summary.unrealizedPnlTWD)}
        />
        <Stat
          label="報酬率"
          value={formatPct(
            summary.currentPrice !== null && summary.avgCost > 0
              ? ((summary.currentPrice - summary.avgCost) / summary.avgCost) * 100
              : null,
          )}
          className={pnlClass(
            summary.currentPrice !== null && summary.avgCost > 0
              ? summary.currentPrice - summary.avgCost
              : null,
          )}
        />
      </section>

      <div className="flex gap-2">
        <button
          onClick={() => setAddingTx((v) => !v)}
          className="flex-1 rounded-lg bg-line py-2 text-sm font-semibold text-white"
        >
          {addingTx ? "取消" : "記錄交易"}
        </button>
        <button
          onClick={() => setEditing((v) => !v)}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm"
        >
          {editing ? "取消編輯" : "編輯"}
        </button>
      </div>

      {addingTx && (
        <TransactionForm
          assets={[asset]}
          initialAssetId={asset.id}
          onSubmit={(data) => {
            addTransaction({ id: uid(), createdAt: Date.now(), ...data });
            setAddingTx(false);
          }}
          onCancel={() => setAddingTx(false)}
        />
      )}

      {editing && (
        <AssetForm
          initial={asset}
          onSubmit={(data) => {
            upsertAsset({ ...asset, ...data });
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      )}

      <section>
        <h2 className="mb-2 px-1 text-sm font-semibold text-gray-600">交易明細</h2>
        {txs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            尚無交易
          </div>
        ) : (
          <ul className="space-y-2">
            {txs.map((t) => (
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
                      {t.units.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                    </span>{" "}
                    @ {t.price.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                  </div>
                  <div className="text-xs text-gray-400">{t.date}</div>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    小計{" "}
                    {formatMoney(
                      t.price * t.units + (t.side === "buy" ? t.fee + t.tax : -t.fee - t.tax),
                      asset.currency,
                      2,
                    )}
                    {t.note ? ` · ${t.note}` : ""}
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
            ))}
          </ul>
        )}
      </section>

      <button
        onClick={() => {
          if (confirm(`刪除 ${asset.symbol} 連同所有交易？`)) {
            removeAsset(asset.id);
            router.push("/assets");
          }
        }}
        className="w-full rounded-lg border border-red-200 py-2 text-sm text-red-500"
      >
        刪除此標的
      </button>
    </div>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-1 text-base font-semibold ${className ?? ""}`}>{value}</div>
    </div>
  );
}
