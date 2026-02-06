"use client";

import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Users", href: "/admin?tab=users" },
  { label: "Servers", href: "/admin?tab=servers" },
  { label: "Subscriptions", href: "/admin?tab=subscriptions" },
  { label: "Analytics", href: "/admin?tab=analytics" },
  { label: "Settings", href: "/admin?tab=settings" },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink/95">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 pb-16 pt-10 md:grid-cols-[220px_1fr]">
        <aside className="card h-fit">
          <div className="font-display text-lg font-semibold">FreeGate Admin</div>
          <div className="mt-6 flex flex-col gap-3 text-sm text-white/70">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}
