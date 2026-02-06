import Link from "next/link";

const cards = [
  {
    title: "Guest access",
    copy: "Launch a limited session with 500MB daily quota and server shortlist.",
    action: "Continue as guest",
    href: "/guest",
  },
  {
    title: "Full account",
    copy: "Unlock usage history, premium routing, and multi-device control.",
    action: "Create account",
    href: "/signup",
  },
  {
    title: "Return session",
    copy: "Log in with a seeded demo account to explore real data instantly.",
    action: "Log in",
    href: "/login",
  },
];

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-hero-gradient px-6 pb-16 pt-20">
      <div className="mx-auto max-w-5xl">
        <div className="chip">Onboarding</div>
        <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">
          Choose your FreeGate entry point.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-white/70">
          Every path loads real data from the mock API and SQLite seed. Pick the flow
          that matches your evaluation needs.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title} className="card flex h-full flex-col">
              <div className="text-lg font-semibold text-white">{card.title}</div>
              <p className="mt-3 text-sm text-white/70">{card.copy}</p>
              <Link href={card.href} className="btn-primary mt-auto">
                {card.action}
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          <div className="text-xs uppercase tracking-[0.2em] text-white/50">Demo tips</div>
          <ul className="mt-4 space-y-2">
            <li>Premium account: premium@freegate.local / password123</li>
            <li>Admin account: admin@freegate.local / password123</li>
            <li>Guest sessions reset daily at midnight UTC.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
