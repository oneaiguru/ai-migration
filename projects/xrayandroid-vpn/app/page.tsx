import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { testimonials, faqs } from "../lib/marketing";

const highlights = [
  {
    title: "Stealth protocols",
    description: "Rotate VLESS, VMess, and Trojan profiles with auto-obfuscation to stay reachable in restrictive networks.",
  },
  {
    title: "Smart routing",
    description: "Pick the lowest-latency path from 50+ metro nodes and auto-switch before congestion spikes.",
  },
  {
    title: "Zero-trust defaults",
    description: "Kill switch, DNS lockdown, and split-tunneling presets ship with every session.",
  },
  {
    title: "Privacy-first",
    description: "No external services. All mock data stays on localhost for this demo.",
  },
];

const stats = [
  { label: "Metro locations", value: "52" },
  { label: "Peak uptime", value: "99.97%" },
  { label: "Avg connect", value: "1.8s" },
  { label: "Protocols", value: "4" },
];

const steps = [
  {
    title: "Create or join as guest",
    detail: "Sign up in seconds or spin a guest session with a daily 500MB quota.",
  },
  {
    title: "Choose a route",
    detail: "Filter by country, tags, or premium routing and save favorites.",
  },
  {
    title: "Connect and monitor",
    detail: "Track usage, session uptime, and device coverage in real time.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-hero-gradient">
      <SiteHeader />
      <main className="pt-28">
        <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-20 pt-12 md:flex-row md:items-center">
          <div className="flex-1 animate-rise">
            <div className="chip">Localhost demo</div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white md:text-5xl">
              FreeGate VPN keeps you online when networks push back.
            </h1>
            <p className="mt-6 text-base text-white/70">
              A full-stack VPN SaaS prototype with realtime dashboards, mock payments, and
              seeded infrastructure data. Everything runs on localhost with SQLite.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/onboarding" className="btn-primary">
                Start the demo
              </Link>
              <Link href="/pricing" className="btn-outline">
                View plans
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-white/60 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="glass rounded-2xl px-4 py-3">
                  <div className="text-lg font-semibold text-white">{stat.value}</div>
                  <div className="text-xs uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex-1">
            <div className="absolute -left-8 -top-6 h-24 w-24 rounded-full bg-tide/40 blur-2xl" />
            <div className="absolute -bottom-10 right-6 h-32 w-32 rounded-full bg-sun/30 blur-3xl" />
            <div className="card animate-float">
              <div className="flex items-center justify-between text-sm text-white/60">
                <span>Active session</span>
                <span className="text-lime">Secure</span>
              </div>
              <div className="mt-6 text-2xl font-semibold text-white">
                Netherlands - Amsterdam
              </div>
              <div className="mt-2 text-sm text-white/60">Protocol: VLESS | Ping: 48ms</div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/60">Usage today</div>
                  <div className="mt-3 text-lg font-semibold text-white">412 MB</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/60">Sessions</div>
                  <div className="mt-3 text-lg font-semibold text-white">3 active</div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                <span>Threat shield</span>
                <span className="text-white">Enabled</span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="flex flex-col gap-3">
            <div className="chip">Why FreeGate</div>
            <h2 className="text-3xl font-semibold text-white">Built for resilience and speed.</h2>
            <p className="text-white/70">
              Every surface in the demo maps directly to the production spec so you can
              evaluate the full experience without external dependencies.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {highlights.map((item) => (
              <div key={item.title} className="card">
                <div className="text-lg font-semibold text-white">{item.title}</div>
                <p className="mt-3 text-sm text-white/70">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-8 md:grid-cols-[1fr_1.2fr]">
            <div className="card">
              <div className="chip">Onboarding</div>
              <h3 className="mt-4 text-2xl font-semibold text-white">A guided, three-step flow.</h3>
              <p className="mt-4 text-sm text-white/70">
                From the first launch to an active tunnel, the demo covers every key journey
                in the FreeGate spec.
              </p>
              <div className="mt-6 flex flex-col gap-4">
                {steps.map((step, index) => (
                  <div key={step.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/50">Step {index + 1}</div>
                    <div className="mt-2 text-base font-semibold text-white">{step.title}</div>
                    <div className="mt-2 text-sm text-white/70">{step.detail}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_50%),linear-gradient(140deg,rgba(15,23,42,0.9),rgba(8,17,27,0.98))]">
              <div className="chip">Admin view</div>
              <h3 className="mt-4 text-2xl font-semibold text-white">
                Real-time operational telemetry.
              </h3>
              <p className="mt-4 text-sm text-white/70">
                Watch usage spikes, revenue trends, and server health from the admin cockpit.
              </p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50">Active users</div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-white">8,234</span>
                    <span className="text-xs text-lime">+5.2%</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50">Revenue</div>
                  <div className="mt-3 text-3xl font-semibold text-white">$45,230</div>
                  <div className="mt-1 text-xs text-white/60">Month to date</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50">Server load</div>
                  <div className="mt-3 text-3xl font-semibold text-white">45%</div>
                  <div className="mt-1 text-xs text-white/60">Across 52 nodes</div>
                </div>
              </div>
              <Link href="/admin" className="btn-outline mt-6 w-full">
                Open admin dashboard
              </Link>
            </div>
          </div>
        </section>

        <section id="download" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="card">
            <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
              <div>
                <div className="chip">Download</div>
                <h3 className="mt-4 text-2xl font-semibold text-white">Android package, ready for wiring.</h3>
                <p className="mt-4 text-sm text-white/70">
                  The Android assets in this repo include the VPN service, JNI bridge, and
                  XML resources needed to integrate with your host app. Use the localhost demo
                  to validate API flows before binding the mobile runtime.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/60">
                  <span className="tag">android/activity</span>
                  <span className="tag">android/jni</span>
                  <span className="tag">android/layout</span>
                  <span className="tag">android/res</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 font-mono text-xs text-white/70">
                <div className="text-white/50">Key paths</div>
                <div className="mt-3 space-y-2">
                  <div>android/activity/TProxyService.kt</div>
                  <div>android/jni/hev_socks5_tunnel.cpp</div>
                  <div>android/config/tunnel_config_template.yaml</div>
                  <div>docs/INTEGRATION_GUIDE.md</div>
                </div>
                <div className="mt-6 text-xs text-white/60">
                  See docs/INTEGRATION_GUIDE.md for wiring details.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="support" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-8 md:grid-cols-[1fr_1.1fr]">
            <div>
              <div className="chip">Support</div>
              <h3 className="mt-4 text-2xl font-semibold text-white">
                Answers for the most common questions.
              </h3>
              <p className="mt-4 text-sm text-white/70">
                Need deeper help? The demo ships with detailed integration notes and
                realistic API workflows for testing edge cases.
              </p>
              <div className="mt-6 flex gap-4">
                <Link href="/pricing" className="btn-primary">
                  Upgrade options
                </Link>
                <Link href="/onboarding" className="btn-outline">
                  Start onboarding
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="card">
                  <div className="text-base font-semibold text-white">{faq.question}</div>
                  <p className="mt-3 text-sm text-white/70">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="card">
                <div className="text-sm text-white/50">Rating: {testimonial.rating}/5</div>
                <p className="mt-4 text-base text-white">"{testimonial.quote}"</p>
                <div className="mt-6 text-sm text-white/70">
                  {testimonial.name} - {testimonial.location}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="card flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="chip">Ready to explore?</div>
              <h3 className="mt-4 text-2xl font-semibold text-white">
                Launch the full FreeGate localhost experience.
              </h3>
              <p className="mt-2 text-sm text-white/70">
                Preview every flow in the spec, from guest onboarding to admin analytics.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/onboarding" className="btn-primary">
                Start onboarding
              </Link>
              <Link href="/dashboard" className="btn-outline">
                Open dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
