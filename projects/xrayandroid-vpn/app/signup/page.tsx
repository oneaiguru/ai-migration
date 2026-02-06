"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          confirmPassword,
          acceptTerms,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || "Unable to sign up.");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Unable to sign up.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient px-6 py-20">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="chip">Create account</div>
          <h1 className="mt-6 text-4xl font-semibold text-white">Start your FreeGate trial</h1>
          <p className="mt-4 text-sm text-white/70">
            Sign up to unlock premium routing previews, usage history, and device
            management in the localhost demo.
          </p>
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            <div className="text-xs uppercase tracking-[0.2em] text-white/50">Password rules</div>
            <ul className="mt-4 space-y-2">
              <li>At least 8 characters.</li>
              <li>Include a number and an uppercase letter.</li>
              <li>Use the same password for confirm.</li>
            </ul>
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
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/60">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="input-field mt-2"
                required
              />
            </div>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <button
                type="button"
                className="toggle"
                data-on={acceptTerms ? "true" : "false"}
                onClick={() => setAcceptTerms((prev) => !prev)}
              >
                <span />
              </button>
              <span>I agree to the FreeGate demo terms.</span>
            </div>
            {error ? <div className="text-sm text-rose">{error}</div> : null}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
            <div className="flex items-center justify-between text-xs text-white/60">
              <Link href="/login" className="hover:text-white">
                Already have an account?
              </Link>
              <Link href="/guest" className="hover:text-white">
                Try guest access
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
