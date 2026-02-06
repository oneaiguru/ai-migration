"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatBytes, formatCurrency, formatDateLabel } from "../../lib/format";

type Profile = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  plan: string;
  planExpiresAt: string | null;
  createdAt: string;
  settings: {
    theme: string;
    language: string;
    notifications: boolean;
  };
};

type Subscription = {
  plan: string;
  status: string;
  startDate: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  paymentMethod: {
    type: string;
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  } | null;
  invoices: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    date: string;
  }[];
};

type Device = {
  id: string;
  name: string;
  type: string;
  lastActive: string;
  current: boolean;
};

type Usage = {
  today: { bytesDown: number; bytesUp: number; connectionTime: number };
  thisMonth: { bytesDown: number; bytesUp: number; connectionTime: number; sessions: number };
  quota: { daily: number | null; used: number; remaining: number | null; resetsAt?: string };
  history: { date: string; bytesDown: number; bytesUp: number }[];
};

export default function AccountClient() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [profileRes, subscriptionRes, devicesRes, usageRes] = await Promise.all([
          fetch("/api/user/profile", { credentials: "include" }),
          fetch("/api/user/subscription", { credentials: "include" }),
          fetch("/api/user/devices", { credentials: "include" }),
          fetch("/api/user/usage", { credentials: "include" }),
        ]);

        if (profileRes.status === 401) {
          setAuthError(true);
          return;
        }

        const profileData = await profileRes.json();
        const subscriptionData = await subscriptionRes.json();
        const devicesData = await devicesRes.json();
        const usageData = await usageRes.json();

        setProfile(profileData);
        setSubscription(subscriptionData);
        setDevices(devicesData.devices || []);
        setUsage(usageData);
        setName(profileData.name || "");
        setAvatar(profileData.avatar || "");
      } catch (err) {
        setMessage("Unable to load account data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function saveProfile() {
    setMessage(null);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, avatar: avatar || null }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.message || "Unable to update profile.");
        return;
      }
      setProfile((prev) => (prev ? { ...prev, ...data.user } : prev));
      setMessage("Profile updated.");
    } catch (err) {
      setMessage("Unable to update profile.");
    }
  }

  async function cancelSubscription() {
    setMessage(null);
    try {
      const response = await fetch("/api/payments/cancel", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.message || "Unable to cancel subscription.");
        return;
      }
      setSubscription((prev) =>
        prev
          ? {
              ...prev,
              cancelAtPeriodEnd: true,
              currentPeriodEnd: data.subscription?.currentPeriodEnd || prev.currentPeriodEnd,
            }
          : prev
      );
      setMessage(data?.message || "Subscription canceled.");
    } catch (err) {
      setMessage("Unable to cancel subscription.");
    }
  }

  async function removeDevice(deviceId: string) {
    setMessage(null);
    try {
      const response = await fetch(`/api/user/devices/${deviceId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        setMessage("Unable to remove device.");
        return;
      }
      setDevices((prev) => prev.filter((device) => device.id !== deviceId));
    } catch (err) {
      setMessage("Unable to remove device.");
    }
  }

  async function deleteAccount() {
    if (!window.confirm("Delete your account? This cannot be undone.")) {
      return;
    }
    setMessage(null);
    try {
      const response = await fetch("/api/user", {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        setMessage("Unable to delete account.");
        return;
      }
      router.push("/");
    } catch (err) {
      setMessage("Unable to delete account.");
    }
  }

  if (authError) {
    return (
      <div className="card">
        <div className="text-lg font-semibold text-white">Sign in required</div>
        <p className="mt-3 text-sm text-white/70">
          Log in to manage profile, billing, and devices.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className="btn-primary">
            Log in
          </Link>
          <Link href="/guest" className="btn-outline">
            Continue as guest
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !profile || !subscription || !usage) {
    return <div className="text-sm text-white/70">Loading account...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm text-white/60">Account overview</div>
          <div className="text-3xl font-semibold text-white">{profile.email}</div>
          <div className="mt-1 text-sm text-white/60">
            Member since {formatDateLabel(profile.createdAt)}
          </div>
        </div>
        <Link href="/dashboard" className="btn-outline">
          Back to dashboard
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="card space-y-4">
          <div className="text-sm text-white/60">Profile</div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">Name</label>
            <input
              type="text"
              className="input-field mt-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">Avatar URL</label>
            <input
              type="text"
              className="input-field mt-2"
              value={avatar}
              onChange={(event) => setAvatar(event.target.value)}
            />
          </div>
          <button type="button" className="btn-primary" onClick={saveProfile}>
            Save profile
          </button>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <div className="text-xs uppercase tracking-[0.2em] text-white/50">Preferences</div>
            <div className="mt-3">Theme: {profile.settings.theme}</div>
            <div>Language: {profile.settings.language}</div>
            <div>Notifications: {profile.settings.notifications ? "On" : "Off"}</div>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="text-sm text-white/60">Subscription</div>
          <div className="text-2xl font-semibold text-white">{subscription.plan}</div>
          <div className="text-sm text-white/60">Status: {subscription.status}</div>
          <div className="text-sm text-white/60">
            Renews: {formatDateLabel(subscription.currentPeriodEnd)}
          </div>
          {subscription.paymentMethod ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <div>Card ending {subscription.paymentMethod.last4}</div>
              <div>
                {subscription.paymentMethod.brand.toUpperCase()} - expires {subscription.paymentMethod.expiryMonth}/
                {subscription.paymentMethod.expiryYear}
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Link href="/pricing" className="btn-outline">
              Change plan
            </Link>
            {!subscription.cancelAtPeriodEnd && subscription.plan !== "free" ? (
              <button type="button" className="btn-ghost" onClick={cancelSubscription}>
                Cancel subscription
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="text-sm text-white/60">Devices</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {devices.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
            >
              <div>
                <div className="font-semibold text-white">{device.name}</div>
                <div className="text-xs text-white/60">
                  {device.type} - last active {formatDateLabel(device.lastActive)}
                </div>
              </div>
              {device.current ? (
                <span className="tag">Current</span>
              ) : (
                <button type="button" className="btn-ghost" onClick={() => removeDevice(device.id)}>
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="text-sm text-white/60">Usage summary</div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">This month</div>
              <div className="mt-2 text-lg text-white">{formatBytes(usage.thisMonth.bytesDown)}</div>
              <div className="text-xs text-white/50">{usage.thisMonth.sessions} sessions</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Daily quota</div>
              <div className="mt-2 text-lg text-white">
                {usage.quota.daily ? formatBytes(usage.quota.daily) : "Unlimited"}
              </div>
              <div className="text-xs text-white/50">
                {usage.quota.remaining !== null ? formatBytes(usage.quota.remaining) : "No cap"}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-white/60">Recent invoices</div>
          <div className="mt-4 space-y-3">
            {subscription.invoices.length === 0 ? (
              <div className="text-sm text-white/60">No invoices yet.</div>
            ) : (
              subscription.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <div>
                    <div className="text-white">{formatCurrency(invoice.amount)}</div>
                    <div className="text-xs text-white/60">{formatDateLabel(invoice.date)}</div>
                  </div>
                  <span className="tag">{invoice.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card border border-rose/40">
        <div className="text-sm text-rose">Danger zone</div>
        <div className="mt-3 text-sm text-white/70">
          Deleting the account clears saved devices and favorites.
        </div>
        <button type="button" className="btn-outline mt-4" onClick={deleteAccount}>
          Delete account
        </button>
      </div>

      {message ? <div className="text-sm text-sun">{message}</div> : null}
    </div>
  );
}
