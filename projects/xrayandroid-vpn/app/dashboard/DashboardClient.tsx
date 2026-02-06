"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatBytes, formatDateLabel, formatDuration } from "../../lib/format";

type Profile = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  planExpiresAt: string | null;
  settings: {
    theme: string;
    language: string;
    notifications: boolean;
  };
};

type Usage = {
  today: {
    bytesDown: number;
    bytesUp: number;
    connectionTime: number;
  };
  thisMonth: {
    bytesDown: number;
    bytesUp: number;
    connectionTime: number;
    sessions: number;
  };
  quota: {
    daily: number | null;
    used: number;
    remaining: number | null;
    resetsAt?: string;
  };
  history: { date: string; bytesDown: number; bytesUp: number }[];
};

type Status = {
  connected: boolean;
  session: {
    id: string;
    serverId: string;
    serverName: string;
    startTime: string;
    duration: number;
    bytesDown: number;
    bytesUp: number;
  } | null;
};

type Server = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  city: string;
  ip: string;
  port: number;
  protocol: string;
  load: number;
  ping: number | null;
  tags: string[];
  premium: boolean;
  status: string;
};

export default function DashboardClient() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const recommended = useMemo(() => {
    return servers.filter((server) => server.tags.includes("recommended")).slice(0, 3);
  }, [servers]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setAuthError(false);
      setMessage(null);

      try {
        const [profileRes, usageRes, statusRes, serverRes] = await Promise.all([
          fetch("/api/user/profile", { credentials: "include" }),
          fetch("/api/user/usage", { credentials: "include" }),
          fetch("/api/vpn/status", { credentials: "include" }),
          fetch("/api/servers"),
        ]);

        if (profileRes.status === 401) {
          setAuthError(true);
          return;
        }

        const profileData = await profileRes.json();
        const usageData = await usageRes.json();
        const statusData = await statusRes.json();
        const serverData = await serverRes.json();

        setProfile(profileData);
        setUsage(usageData);
        setStatus(statusData);
        setServers(serverData.servers || []);
      } catch (err) {
        setMessage("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (!selectedServer && servers.length > 0) {
      const recommendedServer = servers.find((server) =>
        server.tags.includes("recommended")
      );
      setSelectedServer(recommendedServer?.id || servers[0].id);
    }
  }, [servers, selectedServer]);

  async function refreshStatus() {
    const [usageRes, statusRes] = await Promise.all([
      fetch("/api/user/usage", { credentials: "include" }),
      fetch("/api/vpn/status", { credentials: "include" }),
    ]);
    if (usageRes.ok) {
      setUsage(await usageRes.json());
    }
    if (statusRes.ok) {
      setStatus(await statusRes.json());
    }
  }

  async function handleConnect() {
    if (!selectedServer) {
      return;
    }
    setActionLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/vpn/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ serverId: selectedServer, protocol: "vless" }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.message || "Unable to connect.");
        return;
      }
      setMessage("Connection established.");
      await refreshStatus();
    } catch (err) {
      setMessage("Unable to connect.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDisconnect() {
    if (!status?.session?.id) {
      return;
    }
    setActionLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/vpn/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sessionId: status.session.id,
          bytesDown: Math.floor(Math.random() * 90000000 + 10000000),
          bytesUp: Math.floor(Math.random() * 20000000 + 2000000),
          duration: Math.floor(Math.random() * 1800 + 600),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setMessage(data?.message || "Unable to disconnect.");
        return;
      }
      setMessage("Session ended.");
      await refreshStatus();
    } catch (err) {
      setMessage("Unable to disconnect.");
    } finally {
      setActionLoading(false);
    }
  }

  if (authError) {
    return (
      <div className="card">
        <div className="text-lg font-semibold text-white">Sign in required</div>
        <p className="mt-3 text-sm text-white/70">
          Log in or start a guest session to view dashboard metrics.
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

  if (loading) {
    return <div className="text-sm text-white/70">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm text-white/60">Welcome</div>
          <div className="text-3xl font-semibold text-white">
            {profile?.name || profile?.email}
          </div>
          <div className="mt-1 text-sm text-white/60">
            Plan: {profile?.plan} {profile?.planExpiresAt ? `- renews ${formatDateLabel(profile?.planExpiresAt)}` : ""}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/pricing" className="btn-outline">
            Manage plan
          </Link>
          <Link href="/servers" className="btn-primary">
            Browse servers
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/60">VPN status</div>
              <div className="mt-2 text-xl font-semibold text-white">
                {status?.connected ? "Connected" : "Not connected"}
              </div>
              <div className="text-sm text-white/60">
                {status?.connected
                  ? status?.session?.serverName
                  : "Select a server to connect"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Session time</div>
              <div className="mt-2 text-lg font-semibold text-white">
                {status?.connected && status.session
                  ? formatDuration(status.session.duration)
                  : "0s"}
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Server</label>
              <select
                className="input-field mt-2"
                value={selectedServer}
                onChange={(event) => setSelectedServer(event.target.value)}
              >
                {servers.map((server) => (
                  <option key={server.id} value={server.id}>
                    {server.country} - {server.city} ({server.load}% load)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-3">
              {status?.connected ? (
                <button
                  type="button"
                  className="btn-outline w-full"
                  onClick={handleDisconnect}
                  disabled={actionLoading}
                >
                  Disconnect
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary w-full"
                  onClick={handleConnect}
                  disabled={actionLoading}
                >
                  Connect now
                </button>
              )}
            </div>
          </div>
          {message ? <div className="mt-4 text-sm text-sun">{message}</div> : null}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Download</div>
              <div className="mt-2 text-lg font-semibold text-white">
                {formatBytes(usage?.today.bytesDown || 0)}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Upload</div>
              <div className="mt-2 text-lg font-semibold text-white">
                {formatBytes(usage?.today.bytesUp || 0)}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Quota left</div>
              <div className="mt-2 text-lg font-semibold text-white">
                {usage?.quota?.remaining !== null && usage?.quota?.remaining !== undefined
                  ? formatBytes(usage.quota.remaining)
                  : "Unlimited"}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="text-sm text-white/60">This month</div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {formatBytes(usage?.thisMonth.bytesDown || 0)}
            </div>
            <div className="mt-2 text-sm text-white/60">
              {usage?.thisMonth.sessions || 0} sessions - {formatDuration(usage?.thisMonth.connectionTime || 0)}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-white/70">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Upload</div>
                <div className="mt-2 text-white">{formatBytes(usage?.thisMonth.bytesUp || 0)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Protocol</div>
                <div className="mt-2 text-white">VLESS default</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="text-sm text-white/60">Recommended routes</div>
            <div className="mt-4 space-y-3">
              {(recommended.length ? recommended : servers.slice(0, 3)).map((server) => (
                <div
                  key={server.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <div>
                    <div className="font-semibold text-white">{server.city}</div>
                    <div className="text-xs text-white/60">
                      {server.country} - {server.status}
                    </div>
                  </div>
                  <div className="text-xs text-white/60">Load {server.load}%</div>
                </div>
              ))}
            </div>
            <Link href="/servers" className="btn-outline mt-4 w-full">
              View all servers
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="text-sm text-white/60">Usage history (last 7 days)</div>
        <div className="mt-4 grid gap-3 md:grid-cols-7">
          {(usage?.history || []).map((day) => (
            <div key={day.date} className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-white/50">{day.date.slice(5)}</div>
              <div className="mt-2 text-sm text-white">{formatBytes(day.bytesDown)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
