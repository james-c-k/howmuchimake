import type { Metadata, Viewport } from "next";
import "./globals.css";
import LiffBootstrap from "@/components/LiffBootstrap";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "How Much I Make — 投資損益總管",
  description: "在 LINE 上追蹤你所有台股、美股、基金、外幣、加密貨幣投資的即時損益",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#06C755",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body>
        <LiffBootstrap />
        <div className="mx-auto flex min-h-screen max-w-xl flex-col pb-24">
          <main className="flex-1 px-4 pt-4">{children}</main>
          <Navigation />
        </div>
      </body>
    </html>
  );
}
