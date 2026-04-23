"use client";

import { useMemo, useState } from "react";
import RecurringForm from "@/components/RecurringForm";
import { usePortfolio } from "@/hooks/usePortfolio";
import { formatMoney } from "@/lib/calculations";
import { frequencyLabel, nextRecurringDate } from "@/lib/recurring";
import { uid } from "@/lib/storage";

export default function RecurringPage() {
  const {
    portfolio,
    loaded,
    upsertRecurringPlan,
    removeRecurringPlan,
  } = usePortfolio();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const assetMap = useMemo(
    () => new Map(portfolio.assets.map((a) => [a.id, a])),
    [portfolio.assets],
  );

  if (!loaded) return <div className="py-20 text-center text-gray-400">載入中…</div>;

  const editingPlan = editingId
    ? portfolio.recurringPlans.find((p) => p.id === editingId)
    : undefined;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">定期定額</h1>
        {!adding && !editingId && portfolio.assets.length > 0 && (
          <button
            onClick={() => setAdding(true)}
            className="rounded-lg bg-line px-3 py-1.5 text-sm font-semibold text-white"
          >
            ＋ 新增
          </button>
        )}
      </header>

      {adding && (
        <RecurringForm
          assets={portfolio.assets}
          onSubmit={(data) => {
            upsertRecurringPlan({ id: uid(), createdAt: Date.now(), ...data });
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {editingPlan && (
        <RecurringForm
          assets={portfolio.assets}
          initial={editingPlan}
          onSubmit={(data) => {
            upsertRecurringPlan({ ...editingPlan, ...data });
            setEditingId(null);
          }}
          onCancel={() => setEditingId(null)}
        />
      )}

      {portfolio.recurringPlans.length === 0 && !adding ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          尚未設定任何定期定額計畫
        </div>
      ) : (
        <ul className="space-y-2">
          {portfolio.recurringPlans.map((plan) => {
            const asset = assetMap.get(plan.assetId);
            const next = nextRecurringDate(plan);
            return (
              <li key={plan.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">
                      {asset ? asset.symbol : "(已刪除)"}{" "}
                      <span className="text-xs text-gray-400">
                        {asset?.name}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {frequencyLabel(plan.frequency)}·{" "}
                      {formatMoney(plan.amount, asset?.currency ?? "TWD", 0)}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      下次扣款：{next ? next.toISOString().slice(0, 10) : "—"}
                      {!plan.active && " · 已暫停"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs">
                    <button
                      onClick={() =>
                        upsertRecurringPlan({ ...plan, active: !plan.active })
                      }
                      className="rounded bg-gray-100 px-2 py-1"
                    >
                      {plan.active ? "暫停" : "恢復"}
                    </button>
                    <button
                      onClick={() => setEditingId(plan.id)}
                      className="rounded bg-gray-100 px-2 py-1"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("刪除此定期定額計畫？")) {
                          removeRecurringPlan(plan.id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="px-1 text-xs text-gray-400">
        提示：定期定額會顯示下次預計扣款日，實際成交後再到「交易紀錄」補上一筆買入即可累計到持倉。
      </p>
    </div>
  );
}
