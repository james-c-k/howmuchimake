"use client";

import { useState } from "react";
import type { Asset, RecurringFrequency, RecurringPlan } from "@/lib/types";

export default function RecurringForm({
  assets,
  initial,
  onSubmit,
  onCancel,
}: {
  assets: Asset[];
  initial?: RecurringPlan;
  onSubmit: (p: Omit<RecurringPlan, "id" | "createdAt">) => void;
  onCancel?: () => void;
}) {
  const [assetId, setAssetId] = useState(initial?.assetId ?? assets[0]?.id ?? "");
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? "");
  const [frequency, setFrequency] = useState<RecurringFrequency>(
    initial?.frequency ?? "monthly",
  );
  const [dayOfPeriod, setDayOfPeriod] = useState(
    initial?.dayOfPeriod?.toString() ?? "1",
  );
  const [startDate, setStartDate] = useState(
    initial?.startDate ?? new Date().toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [active, setActive] = useState(initial?.active ?? true);

  if (assets.length === 0) {
    return (
      <div className="rounded-xl bg-white p-4 text-center text-sm text-gray-500">
        請先到「標的」頁新增至少一檔投資
      </div>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    const day = Number(dayOfPeriod);
    if (!Number.isFinite(amt) || amt <= 0) return;
    if (!Number.isInteger(day)) return;
    onSubmit({
      assetId,
      amount: amt,
      frequency,
      dayOfPeriod: day,
      startDate,
      endDate: endDate || undefined,
      active,
    });
  }

  const weekdayLabels = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
      <Field label="標的">
        <select
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          className="input"
        >
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.symbol} — {a.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="每次投入金額">
        <input
          type="number"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input"
          required
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="頻率">
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
            className="input"
          >
            <option value="weekly">每週</option>
            <option value="biweekly">每兩週</option>
            <option value="monthly">每月</option>
          </select>
        </Field>
        <Field label={frequency === "monthly" ? "扣款日" : "星期"}>
          {frequency === "monthly" ? (
            <input
              type="number"
              min={1}
              max={28}
              value={dayOfPeriod}
              onChange={(e) => setDayOfPeriod(e.target.value)}
              className="input"
              required
            />
          ) : (
            <select
              value={dayOfPeriod}
              onChange={(e) => setDayOfPeriod(e.target.value)}
              className="input"
            >
              {weekdayLabels.map((w, i) => (
                <option key={i} value={i}>
                  {w}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="開始日">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input"
            required
          />
        </Field>
        <Field label="結束日（可選）">
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input"
          />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        啟用中
      </label>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      {children}
    </label>
  );
}
