"use client";

import { useState } from "react";
import type { Asset, AssetType } from "@/lib/types";

const assetTypeOptions: { value: AssetType; label: string; hint: string }[] = [
  { value: "tw_stock", label: "台股 / 台灣 ETF", hint: "例：2330、00878" },
  { value: "us_stock", label: "美股", hint: "例：AAPL、VOO" },
  { value: "fund", label: "基金", hint: "輸入基金代號或自訂" },
  { value: "currency", label: "外幣 / 匯率", hint: "例：USD、JPY" },
  { value: "crypto", label: "加密貨幣", hint: "例：BTC、ETH" },
  { value: "other", label: "其他", hint: "自訂追蹤項目" },
];

const currencyOptions = ["TWD", "USD", "JPY", "EUR", "CNY", "HKD"] as const;

export default function AssetForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Asset;
  onSubmit: (a: Omit<Asset, "id" | "createdAt">) => void;
  onCancel?: () => void;
}) {
  const [type, setType] = useState<AssetType>(initial?.type ?? "tw_stock");
  const [symbol, setSymbol] = useState(initial?.symbol ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [currency, setCurrency] = useState<Asset["currency"]>(
    initial?.currency ?? "TWD",
  );
  const [quoteSymbol, setQuoteSymbol] = useState(initial?.quoteSymbol ?? "");
  const [fundNavUrl, setFundNavUrl] = useState(initial?.fundNavUrl ?? "");

  function computeQuote(type: AssetType, symbol: string): string {
    const s = symbol.trim();
    if (!s) return "";
    switch (type) {
      case "tw_stock":
        return /\.(TW|TWO)$/i.test(s) ? s.toUpperCase() : `${s}.TW`;
      case "us_stock":
        return s.toUpperCase();
      case "currency":
        return s.toUpperCase().endsWith("=X") ? s.toUpperCase() : `${s.toUpperCase()}TWD=X`;
      case "crypto":
        return s.toUpperCase().endsWith("-USD") ? s.toUpperCase() : `${s.toUpperCase()}-USD`;
      default:
        return s;
    }
  }

  function onTypeChange(t: AssetType) {
    setType(t);
    if (t === "tw_stock") setCurrency("TWD");
    if (t === "us_stock") setCurrency("USD");
    if (t === "crypto") setCurrency("USD");
    if (symbol) setQuoteSymbol(computeQuote(t, symbol));
  }

  function onSymbolChange(v: string) {
    setSymbol(v);
    setQuoteSymbol(computeQuote(type, v));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!symbol.trim()) return;
    onSubmit({
      type,
      symbol: symbol.trim(),
      name: name.trim() || symbol.trim(),
      currency,
      quoteSymbol: quoteSymbol.trim() || computeQuote(type, symbol),
      fundNavUrl: fundNavUrl.trim() || undefined,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
      <Field label="類別">
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value as AssetType)}
          className="input"
        >
          {assetTypeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="代號" hint={assetTypeOptions.find((o) => o.value === type)?.hint}>
        <input
          value={symbol}
          onChange={(e) => onSymbolChange(e.target.value)}
          className="input"
          placeholder="例：2330"
          required
        />
      </Field>
      <Field label="名稱（可選）">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="例：台積電"
        />
      </Field>
      <Field label="計價幣別">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Asset["currency"])}
          className="input"
        >
          {currencyOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>
      <Field label="報價代號" hint="用來向 Yahoo Finance 抓即時價（自動帶入，可手動改）">
        <input
          value={quoteSymbol}
          onChange={(e) => setQuoteSymbol(e.target.value)}
          className="input"
          placeholder="2330.TW / AAPL / BTC-USD"
        />
      </Field>
      {type === "fund" && (
        <Field label="基金淨值網址（可選）" hint="若 Yahoo 查不到淨值，可另外手動更新">
          <input
            value={fundNavUrl}
            onChange={(e) => setFundNavUrl(e.target.value)}
            className="input"
            placeholder="https://..."
          />
        </Field>
      )}
      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm"
          >
            取消
          </button>
        )}
        <button
          type="submit"
          className="rounded-lg bg-line px-4 py-2 text-sm font-semibold text-white"
        >
          儲存
        </button>
      </div>
      <style jsx>{`
        :global(.input) {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.9rem;
        }
        :global(.input:focus) {
          outline: none;
          border-color: #06c755;
          box-shadow: 0 0 0 2px rgba(6, 199, 85, 0.2);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
    </label>
  );
}
