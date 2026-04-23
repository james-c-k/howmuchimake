"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addTransaction as addTx,
  loadPortfolio,
  removeAsset as removeAssetStore,
  removeRecurringPlan as removePlanStore,
  removeTransaction as removeTxStore,
  savePortfolio,
  upsertAsset as upsertAssetStore,
  upsertRecurringPlan as upsertPlanStore,
} from "@/lib/storage";
import type { Asset, Portfolio, RecurringPlan, Transaction } from "@/lib/types";

const emptyPortfolio: Portfolio = {
  assets: [],
  transactions: [],
  recurringPlans: [],
};

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<Portfolio>(emptyPortfolio);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPortfolio(loadPortfolio());
    setLoaded(true);
  }, []);

  const commit = useCallback((next: Portfolio) => {
    setPortfolio(next);
    savePortfolio(next);
  }, []);

  return {
    portfolio,
    loaded,
    replace: (p: Portfolio) => commit(p),
    upsertAsset: (asset: Asset) => commit(upsertAssetStore(portfolio, asset)),
    removeAsset: (id: string) => commit(removeAssetStore(portfolio, id)),
    addTransaction: (tx: Transaction) => commit(addTx(portfolio, tx)),
    removeTransaction: (id: string) => commit(removeTxStore(portfolio, id)),
    upsertRecurringPlan: (plan: RecurringPlan) =>
      commit(upsertPlanStore(portfolio, plan)),
    removeRecurringPlan: (id: string) =>
      commit(removePlanStore(portfolio, id)),
  };
}
