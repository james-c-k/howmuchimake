"use client";

import type { Liff } from "@line/liff";

let liffInstance: Liff | null = null;
let initPromise: Promise<Liff | null> | null = null;

export async function initLiff(): Promise<Liff | null> {
  if (typeof window === "undefined") return null;
  if (liffInstance) return liffInstance;
  if (initPromise) return initPromise;

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  if (!liffId) return null;

  initPromise = (async () => {
    const { default: liff } = await import("@line/liff");
    await liff.init({ liffId });
    liffInstance = liff;
    return liff;
  })();

  return initPromise;
}

export function getLiff(): Liff | null {
  return liffInstance;
}
