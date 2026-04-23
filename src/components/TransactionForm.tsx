"use client";

import { useState } from "react";
import type { Asset, Transaction, TransactionSide } from "@/lib/types";

export default function TransactionForm({
  assets,
  initialAssetId,
  onSubmit,
  onCancel,
}: {
  assets: Asset[];
  initialAssetId?: string;
  onSubmit: (tx: Omit<Transaction, "id" | "createdAt">) => void;
  onCancel?: () => void;
}) {
  const [assetId, setAssetId] = useState(initialAssetId ?? assets[0]?.id ?? "");
  const [side, setSide] = useState<TransactionSide>("buy");
  const [price, setPrice] = useState("");
  const [units, setUnits] = useState("");
  const [fee, setFee] = useState("");
  const [tax, setTax] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  const asset = assets.find((a) => a.id === assetId);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!assetId) return;
    const p = Number(price);
    const u = Number(units);
    if (!Number.isFinite(p) || p <= 0) return;
    if (!Number.isFinite(u) || u <= 0) return;
    onSubmit({
      assetId,
      side,
      price: p,
      units: u,
      fee: Number(fee) || 0,
      tax: Number(tax) || 0,
      date,
      note: note.trim() || undefined,
    });
  }

  if (assets.length === 0) {
    return (
      <div className="rounded-xl bg-white p-4 text-center text-sm text-gray-500">
        請先到「標的」頁新增至少一檔投資
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={`rounded-lg py-2 text-sm font-semibold ${
            side === "buy"
              ? "bg-profit text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          買入
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={`rounded-lg py-2 text-sm font-semibold ${
            side === "sell"
              ? "bg-loss text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          賣出
        </button>
      </div>
      <Field label="標的">
        <select value={assetId} onChange={(e) => setAssetId(e.target.value)} className="input">
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.symbol} — {a.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label={`單價（${asset?.currency ?? "TWD"}）`}>
          <input
            type="number"
            step="0.0001"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input"
            required
          />
        </Field>
        <Field label="股數 / 單位">
          <input
            type="number"
            step="0.0001"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            className="input"
            required
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="手續費">
          <input
            type="number"
            step="0.01"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="input"
            placeholder="0"
          />
        </Field>
        <Field label="交易稅">
          <input
            type="number"
            step="0.01"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            className="input"
            placeholder="0"
          />
        </Field>
      </div>
      <Field label="日期">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
          required
        />
      </Field>
      <Field label="備註（可選）">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input"
          placeholder="例：加碼"
        />
      </Field>
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
          儲存交易
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      {children}
    </label>
  );
}
