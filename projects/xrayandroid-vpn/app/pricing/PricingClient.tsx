"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "../../lib/format";

type Plan = {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year" | "lifetime";
  popular?: boolean;
  savings?: number;
  features: string[];
  limits: {
    dailyQuota: number | null;
    servers: number | null;
    devices: number | null;
    dedicatedIp?: boolean;
  };
};

type Profile = {
  id: string;
  email: string;
  plan: string;
};

export default function PricingClient() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cardNumber, setCardNumber] = useState("4242424242424242");
  const [expMonth, setExpMonth] = useState("12");
  const [expYear, setExpYear] = useState("2025");
  const [cvc, setCvc] = useState("123");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [plansRes, profileRes] = await Promise.all([
          fetch("/api/plans"),
          fetch("/api/user/profile", { credentials: "include" }),
        ]);
        const plansData = await plansRes.json();
        setPlans(plansData.plans || []);
        if (profileRes.ok) {
          setProfile(await profileRes.json());
        }
      } catch (err) {
        setMessage("Unable to load pricing data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (!selectedPlanId && plans.length > 0) {
      const preferred = plans.find((plan) => plan.popular) || plans[0];
      setSelectedPlanId(preferred.id);
    }
  }, [plans, selectedPlanId]);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) || null,
    [plans, selectedPlanId]
  );

  async function handleCheckout() {
    if (!selectedPlan) {
      return;
    }
    setMessage(null);
    setCheckoutLoading(true);

    if (!profile) {
      setMessage("Log in or create an account to start a subscription.");
      setCheckoutLoading(false);
      return;
    }

    try {
      const checkoutRes = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId: selectedPlan.id, paymentMethod: "card" }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        setMessage(checkoutData?.message || "Unable to start checkout.");
        return;
      }

      const confirmRes = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          checkoutId: checkoutData.checkoutId,
          paymentDetails: {
            cardNumber,
            expMonth: Number(expMonth),
            expYear: Number(expYear),
            cvc,
          },
        }),
      });

      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) {
        setMessage(confirmData?.message || "Payment failed.");
        return;
      }

      setMessage(
        `Subscription active. Plan: ${confirmData.subscription.plan}. Receipt ${confirmData.receipt.id}.`
      );
    } catch (err) {
      setMessage("Payment failed.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return <div className="mt-8 text-sm text-white/70">Loading plans...</div>;
  }

  return (
    <div className="mt-10 space-y-10">
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => setSelectedPlanId(plan.id)}
            className={`card text-left transition ${
              selectedPlanId === plan.id ? "border-tide/60" : "border-white/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-white">{plan.name}</div>
              {plan.popular ? <span className="chip">Popular</span> : null}
            </div>
            <div className="mt-4 text-3xl font-semibold text-white">
              {plan.price === 0 ? "Free" : formatCurrency(plan.price)}
            </div>
            <div className="text-sm text-white/60">per {plan.interval}</div>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {plan.features.map((feature) => (
                <li key={feature}>- {feature}</li>
              ))}
            </ul>
            {plan.savings ? (
              <div className="mt-4 text-xs text-lime">Save {plan.savings}% vs monthly</div>
            ) : null}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="card">
          <div className="text-sm text-white/60">Selected plan</div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {selectedPlan?.name || "Choose a plan"}
          </div>
          <div className="mt-2 text-sm text-white/60">
            {selectedPlan?.price === 0
              ? "No cost. Limited data and server access."
              : `${formatCurrency(selectedPlan?.price || 0)} billed per ${selectedPlan?.interval}.`}
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <div className="text-xs uppercase tracking-[0.2em] text-white/50">Sandbox cards</div>
            <div className="mt-3">
              Success: 4242 4242 4242 4242 | Decline: 4000 0000 0000 0002
            </div>
          </div>
          {message ? <div className="mt-4 text-sm text-sun">{message}</div> : null}
        </div>
        <div className="card space-y-4">
          <div className="text-sm text-white/60">Checkout</div>
          {profile ? (
            <div className="text-xs text-white/60">Logged in as {profile.email}</div>
          ) : (
            <div className="text-xs text-white/60">
              <Link href="/login" className="text-white underline">
                Log in
              </Link>{" "}
              or{
              " "}
              <Link href="/signup" className="text-white underline">
                create an account
              </Link>
              .
            </div>
          )}
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">Card number</label>
            <input
              className="input-field mt-2"
              value={cardNumber}
              onChange={(event) => setCardNumber(event.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Exp month</label>
              <input
                className="input-field mt-2"
                value={expMonth}
                onChange={(event) => setExpMonth(event.target.value)}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Exp year</label>
              <input
                className="input-field mt-2"
                value={expYear}
                onChange={(event) => setExpYear(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">CVC</label>
            <input
              className="input-field mt-2"
              value={cvc}
              onChange={(event) => setCvc(event.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={handleCheckout}
            disabled={checkoutLoading || !selectedPlan}
          >
            {checkoutLoading ? "Processing..." : "Start subscription"}
          </button>
        </div>
      </div>
    </div>
  );
}
