"use client";

import Link from "next/link";
import { useState } from "react";
import AssetForm from "@/components/AssetForm";
import { usePortfolio } from "@/hooks/usePortfolio";
import { uid } from "@/lib/storage";

export default function AssetsPage() {
  const { portfolio, loaded, upsertAsset, removeAsset } = usePortfolio();
  const [adding, setAdding] = useState(false);

  if (!loaded) return <div className="py-20 text-center text-gray-400">載入中…</div>;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">投資標的</h1>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="rounded-lg bg-line px-3 py-1.5 text-sm font-semibold text-white"
          >
            ＋ 新增
          </button>
        )}
      </header>
      {adding && (
        <AssetForm
          onSubmit={(data) => {
            upsertAsset({
              id: uid(),
              createdAt: Date.now(),
              ...data,
            });
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}
      {portfolio.assets.length === 0 && !adding ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          還沒有任何標的，按右上角新增一檔開始。
        </div>
      ) : (
        <ul className="space-y-2">
          {portfolio.assets.map((a) => (
            <li key={a.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <Link href={`/assets/${a.id}`} className="flex-1">
                  <div className="font-semibold">
                    {a.symbol} <span className="text-xs text-gray-400">({a.currency})</span>
                  </div>
                  <div className="text-xs text-gray-500">{a.name}</div>
                  <div className="mt-1 text-xs text-gray-400">
                    報價代號 {a.quoteSymbol}
                  </div>
                </Link>
                <button
                  onClick={() => {
                    if (confirm(`刪除 ${a.symbol} 會連同所有相關交易一併刪除，確定？`)) {
                      removeAsset(a.id);
                    }
                  }}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  刪除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
