"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data?.message || "Reset request sent.");
      } else {
        setMessage(data?.message || "Unable to process request.");
      }
    } catch (err) {
      setMessage("Unable to process request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient px-6 py-20">
      <div className="mx-auto max-w-lg">
        <div className="chip">Password reset</div>
        <h1 className="mt-6 text-3xl font-semibold text-white">Recover your account</h1>
        <p className="mt-3 text-sm text-white/70">
          Submit your email and the mock API will log a reset request for review.
        </p>
        <form onSubmit={handleSubmit} className="card mt-8 space-y-4">
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
          {message ? <div className="text-sm text-white/70">{message}</div> : null}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
          <Link href="/login" className="btn-outline w-full">
            Back to login
          </Link>
        </form>
      </div>
    </div>
  );
}
