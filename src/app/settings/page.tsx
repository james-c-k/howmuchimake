"use client";

import { useRef, useState } from "react";
import { usePortfolio } from "@/hooks/usePortfolio";
import {
  exportPortfolioJSON,
  importPortfolioJSON,
} from "@/lib/storage";

export default function SettingsPage() {
  const { portfolio, loaded, replace } = usePortfolio();
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!loaded) return <div className="py-20 text-center text-gray-400">載入中…</div>;

  function download() {
    const text = exportPortfolioJSON(portfolio);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `howmuchimake-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = importPortfolioJSON(text);
      if (confirm(`匯入將覆蓋現有資料（${parsed.assets.length} 檔標的、${parsed.transactions.length} 筆交易），確定？`)) {
        replace(parsed);
        setMessage("匯入成功");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "匯入失敗");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function resetAll() {
    if (confirm("確定清除所有資料？此動作無法復原")) {
      replace({ assets: [], transactions: [], recurringPlans: [] });
      setMessage("已清除");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">設定</h1>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold">資料管理</h2>
        <p className="mt-1 text-xs text-gray-500">
          所有資料儲存在此裝置的瀏覽器內，清除瀏覽器資料將會遺失。建議定期匯出備份。
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <button
            onClick={download}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm"
          >
            匯出 JSON
          </button>
          <label className="rounded-lg bg-gray-100 px-4 py-2 text-center text-sm">
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={importFile}
            />
            匯入 JSON
          </label>
          <button
            onClick={resetAll}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-500"
          >
            清除全部資料
          </button>
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold">目前統計</h2>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <Stat label="標的數" value={portfolio.assets.length} />
          <Stat label="交易數" value={portfolio.transactions.length} />
          <Stat
            label="定期定額"
            value={portfolio.recurringPlans.filter((p) => p.active).length}
          />
        </dl>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm text-xs text-gray-500">
        <h2 className="mb-1 text-sm font-semibold text-gray-700">關於報價</h2>
        <p>
          報價資料來自 Yahoo Finance 公開 chart endpoint。延遲約 15–20 分鐘，假日與盤後會顯示上次收盤。基金淨值若 Yahoo 沒有收錄，需手動更新。
        </p>
      </section>

      {message && (
        <div className="rounded-lg bg-line/10 px-3 py-2 text-sm text-line">{message}</div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded bg-gray-50 p-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
