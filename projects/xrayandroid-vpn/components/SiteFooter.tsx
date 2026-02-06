const columns = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Download", "API"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Press"],
  },
  {
    title: "Support",
    links: ["Help Center", "Contact", "Status"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service"],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink/90 px-6 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_repeat(4,1fr)]">
        <div>
          <div className="font-display text-lg font-semibold">FreeGate VPN</div>
          <p className="mt-3 text-sm text-white/70">
            Break through restrictions with stealth protocols, lightning-fast
            servers, and privacy-first design.
          </p>
          <div className="mt-6 flex gap-3 text-xs text-white/50">
            <span>English</span>
            <span>Telegram</span>
            <span>Twitter</span>
            <span>GitHub</span>
          </div>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              {column.title}
            </div>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {column.links.map((link) => (
                <li key={link}>{link}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs text-white/50">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <span>2024 FreeGate VPN. All rights reserved.</span>
          <span>Localhost demo. No external services used.</span>
        </div>
      </div>
    </footer>
  );
}
