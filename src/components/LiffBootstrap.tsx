"use client";

import { useEffect } from "react";
import { initLiff } from "@/lib/liff";

export default function LiffBootstrap() {
  useEffect(() => {
    initLiff().catch((err) => {
      console.warn("LIFF init failed — 可能在一般瀏覽器上執行", err);
    });
  }, []);
  return null;
}
