# How Much I Make — LINE LIFF 投資損益總管

在 LINE 裡打開的個人投資追蹤 app，一眼看清楚你所有台股、美股、基金、外幣、加密貨幣的**投入成本 / 市值 / 已實現 + 未實現損益 / 報酬率**。

## 功能

- 多資產類別：台股、美股、基金、外幣、加密貨幣、自訂項目
- 自動抓 Yahoo Finance 即時報價，匯率換算成 TWD
- 交易紀錄（買/賣、手續費、稅），平均成本法算損益
- 定期定額計畫（每週/每兩週/每月）
- 資料存 localStorage，可匯出/匯入 JSON
- LINE LIFF 整合

## 快速開始

```bash
npm install
cp .env.example .env.local  # 填入 NEXT_PUBLIC_LIFF_ID
npm run dev
```

## 部署到 Vercel + LINE LIFF

1. 把 repo 連到 Vercel，設環境變數 `NEXT_PUBLIC_LIFF_ID`
2. 部署後拿到網址，回 LINE Developer Console 把 LIFF Endpoint URL 改成該網址
3. 用 LINE 打開 `https://liff.line.me/<LIFF_ID>` 即可使用

## 技術

Next.js 14 App Router + TypeScript + Tailwind + `@line/liff`
