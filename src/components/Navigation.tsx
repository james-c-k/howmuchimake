"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "總覽", icon: "📊" },
  { href: "/transactions", label: "交易", icon: "📝" },
  { href: "/assets", label: "標的", icon: "💼" },
  { href: "/recurring", label: "定期定額", icon: "⏰" },
  { href: "/settings", label: "設定", icon: "⚙️" },
];

export default function Navigation() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-xl items-stretch">
        {tabs.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center py-2 text-xs ${
                active ? "text-line" : "text-gray-500"
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
