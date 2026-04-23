"use client";

import { formatMoney, formatPct } from "@/lib/calculations";

export interface SummaryProps {
  cost: number;
  market: number | null;
  unrealized: number | null;
  realized: number;
  totalPnl: number | null;
  returnPct: number | null;
  refreshedAt: number | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function PortfolioSummary(props: SummaryProps) {
  const updatedLabel = props.refreshedAt
    ? new Date(props.refreshedAt).toLocaleTimeString("zh-TW", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "尚未更新";

  return (
    <section className="rounded-2xl bg-gradient-to-br from-line to-line-dark p-5 text-white shadow-md">
      <div className="flex items-center justify-between text-sm text-white/80">
        <span>目前總資產（TWD）</span>
        <button
          onClick={props.onRefresh}
          className="rounded-full bg-white/15 px-3 py-1 text-xs"
          disabled={props.loading}
        >
          {props.loading ? "更新中…" : "重新整理"}
        </button>
      </div>
      <div className="mt-2 text-3xl font-semibold">
        {formatMoney(props.market ?? props.cost)}
      </div>
      <div className="mt-1 text-xs text-white/80">
        更新時間 {updatedLabel}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="投入成本" value={formatMoney(props.cost)} />
        <Stat
          label="未實現損益"
          value={formatMoney(props.unrealized)}
          accent={pnlAccentClass(props.unrealized)}
        />
        <Stat
          label="已實現損益"
          value={formatMoney(props.realized)}
          accent={pnlAccentClass(props.realized)}
        />
        <Stat
          label="總報酬率"
          value={formatPct(props.returnPct)}
          accent={pnlAccentClass(props.returnPct)}
        />
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <div className="text-xs text-white/70">{label}</div>
      <div className={`mt-1 text-base font-semibold ${accent ?? ""}`}>{value}</div>
    </div>
  );
}

function pnlAccentClass(v: number | null): string {
  if (v === null || v === 0) return "text-white";
  return v > 0 ? "text-red-100" : "text-green-100";
}
