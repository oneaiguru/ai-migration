import Link from "next/link";

const navItems = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Download", href: "/#download" },
  { label: "Support", href: "/#support" },
];

export default function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-ink/70 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold tracking-wide">
          FreeGate VPN
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="btn-ghost">
            Log In
          </Link>
          <Link href="/signup" className="btn-primary">
            Get Started
          </Link>
        </div>
        <details className="group md:hidden">
          <summary className="cursor-pointer list-none rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/70">
            Menu
          </summary>
          <div className="mt-3 rounded-2xl border border-white/10 bg-ink/90 p-4 shadow-lg">
            <div className="flex flex-col gap-3 text-sm text-white/80">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  {item.label}
                </Link>
              ))}
              <Link href="/login" className="mt-2 text-white">
                Log In
              </Link>
              <Link href="/signup" className="btn-primary mt-2">
                Get Started
              </Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
