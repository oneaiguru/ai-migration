"use client";

import Link from "next/link";

const navItems = [
  { label: "Home", href: "/dashboard" },
  { label: "Servers", href: "/servers" },
  { label: "Settings", href: "/settings" },
  { label: "Account", href: "/account" },
];

export default function AppShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-lg font-semibold">
            FreeGate VPN
          </Link>
          <div className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`transition ${
                  active === item.label ? "text-white" : "hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Link href="/pricing" className="btn-outline hidden md:inline-flex">
            Upgrade
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 md:pb-16">
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/90 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-around px-4 py-3 text-xs text-white/70">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 ${
                active === item.label ? "text-white" : ""}
              `}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
