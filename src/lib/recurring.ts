import type { RecurringPlan } from "./types";

export function expandRecurring(plan: RecurringPlan, until: Date): Date[] {
  if (!plan.active) return [];
  const start = new Date(plan.startDate + "T00:00:00");
  const end = plan.endDate ? new Date(plan.endDate + "T00:00:00") : until;
  const stop = end < until ? end : until;
  const dates: Date[] = [];

  if (plan.frequency === "monthly") {
    const cursor = new Date(start.getFullYear(), start.getMonth(), plan.dayOfPeriod);
    if (cursor < start) cursor.setMonth(cursor.getMonth() + 1);
    while (cursor <= stop) {
      dates.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else {
    const stepDays = plan.frequency === "weekly" ? 7 : 14;
    const cursor = new Date(start);
    const targetWeekday = plan.dayOfPeriod % 7;
    while (cursor.getDay() !== targetWeekday) {
      cursor.setDate(cursor.getDate() + 1);
    }
    while (cursor <= stop) {
      dates.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + stepDays);
    }
  }
  return dates;
}

export function nextRecurringDate(plan: RecurringPlan, from: Date = new Date()): Date | null {
  const horizon = new Date(from);
  horizon.setFullYear(horizon.getFullYear() + 1);
  const dates = expandRecurring(plan, horizon);
  return dates.find((d) => d >= from) ?? null;
}

export function frequencyLabel(f: RecurringPlan["frequency"]): string {
  switch (f) {
    case "weekly":
      return "每週";
    case "biweekly":
      return "每兩週";
    case "monthly":
      return "每月";
  }
}
