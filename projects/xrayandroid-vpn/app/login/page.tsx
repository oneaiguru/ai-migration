"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const quickAccounts = [
  {
    label: "Admin",
    email: "admin@freegate.local",
    password: "password123",
    note: "Full admin console access",
  },
  {
    label: "Premium",
    email: "premium@freegate.local",
    password: "password123",
    note: "Active subscription with usage history",
  },
  {
    label: "Free",
    email: "free@freegate.local",
    password: "password123",
    note: "Free tier quota limits",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(quickAccounts[1].email);
  const [password, setPassword] = useState(quickAccounts[1].password);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || "Unable to log in.");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Unable to log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient px-6 py-20">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="chip">Welcome back</div>
          <h1 className="mt-6 text-4xl font-semibold text-white">Log in to FreeGate VPN</h1>
          <p className="mt-4 text-sm text-white/70">
            Use one of the seeded demo accounts to explore authenticated flows with
            real usage data and server metrics.
          </p>
          <div className="mt-8 space-y-4">
            {quickAccounts.map((account) => (
              <button
                key={account.label}
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
                className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-white/30"
              >
                <div className="text-sm font-semibold text-white">{account.label}</div>
                <div className="mt-1 text-xs text-white/60">{account.note}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/60">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input-field mt-2"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/60">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="input-field mt-2"
                required
              />
            </div>
            <button
              type="button"
              className="toggle"
              data-on={rememberMe ? "true" : "false"}
              onClick={() => setRememberMe((prev) => !prev)}
            >
              <span />
            </button>
            <span className="ml-3 text-sm text-white/70">Remember me for 7 days</span>
            {error ? <div className="text-sm text-rose">{error}</div> : null}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>
            <div className="flex items-center justify-between text-xs text-white/60">
              <Link href="/forgot-password" className="hover:text-white">
                Forgot password
              </Link>
              <Link href="/signup" className="hover:text-white">
                Create account
              </Link>
            </div>
            <Link href="/guest" className="btn-outline w-full">
              Continue as guest
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
