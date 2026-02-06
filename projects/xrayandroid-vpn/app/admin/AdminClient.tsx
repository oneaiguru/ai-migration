"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatBytes, formatCurrency, formatDateLabel } from "../../lib/format";

type Stats = {
  users: {
    total: number;
    active: number;
    premium: number;
    ultimate: number;
    growth: number;
  };
  revenue: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  servers: {
    total: number;
    online: number;
    load: number;
  };
  connections: {
    active: number;
    peak24h: number;
  };
};

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  status: string;
  createdAt: string;
  lastActive: string;
  usage: { thisMonth: number };
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

type Revenue = {
  total: number;
  breakdown: Record<string, number>;
  chart: { date: string; amount: number }[];
  metrics: {
    arpu: number;
    churn: number;
    ltv: number;
  };
};

type ServerRow = {
  id: string;
  name: string;
  country: string;
  ip: string;
  status: string;
  load: number;
  users: number;
  bandwidth: { in: number; out: number };
  uptime: number;
};

export default function AdminClient() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [revenue, setRevenue] = useState<Revenue | null>(null);
  const [servers, setServers] = useState<ServerRow[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userPlan, setUserPlan] = useState("");
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/stats", { credentials: "include" });
        if (response.status === 403 || response.status === 401) {
          setAuthError(true);
          return;
        }
        if (!response.ok) {
          setMessage("Unable to load admin stats.");
          return;
        }
        setStats(await response.json());
      } catch (err) {
        setMessage("Unable to load admin stats.");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  useEffect(() => {
    async function loadUsers() {
      if (tab !== "users") {
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (userSearch) {
          params.set("search", userSearch);
        }
        if (userPlan) {
          params.set("plan", userPlan);
        }
        const response = await fetch(`/api/admin/users?${params.toString()}`, {
          credentials: "include",
        });
        if (response.status === 403 || response.status === 401) {
          setAuthError(true);
          return;
        }
        if (!response.ok) {
          setMessage("Unable to load users.");
          return;
        }
        const data = await response.json();
        setUsers(data.users || []);
        setPagination(data.pagination || null);
      } catch (err) {
        setMessage("Unable to load users.");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [tab, userSearch, userPlan]);

  useEffect(() => {
    async function loadRevenue() {
      if (tab !== "analytics" && tab !== "subscriptions") {
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/revenue?period=${period}`, {
          credentials: "include",
        });
        if (response.status === 403 || response.status === 401) {
          setAuthError(true);
          return;
        }
        if (!response.ok) {
          setMessage("Unable to load revenue metrics.");
          return;
        }
        setRevenue(await response.json());
      } catch (err) {
        setMessage("Unable to load revenue metrics.");
      } finally {
        setLoading(false);
      }
    }

    loadRevenue();
  }, [tab, period]);

  useEffect(() => {
    async function loadServers() {
      if (tab !== "servers" && tab !== "settings") {
        return;
      }
      setLoading(true);
      try {
        const response = await fetch("/api/admin/servers", { credentials: "include" });
        if (response.status === 403 || response.status === 401) {
          setAuthError(true);
          return;
        }
        if (!response.ok) {
          setMessage("Unable to load servers.");
          return;
        }
        const data = await response.json();
        setServers(data.servers || []);
      } catch (err) {
        setMessage("Unable to load servers.");
      } finally {
        setLoading(false);
      }
    }

    loadServers();
  }, [tab]);

  if (authError) {
    return (
      <div className="card">
        <div className="text-lg font-semibold text-white">Admin access required</div>
        <p className="mt-3 text-sm text-white/70">
          Log in with the admin account to view operational telemetry.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className="btn-primary">
            Log in as admin
          </Link>
          <Link href="/dashboard" className="btn-outline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !stats) {
    return <div className="text-sm text-white/70">Loading admin console...</div>;
  }

  return (
    <div className="space-y-8">
      {message ? <div className="text-sm text-sun">{message}</div> : null}

      {tab === "dashboard" ? (
        <div className="space-y-6">
          <div>
            <div className="text-sm text-white/60">Admin overview</div>
            <div className="text-3xl font-semibold text-white">Operations dashboard</div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="card">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Users</div>
              <div className="mt-3 text-2xl font-semibold text-white">{stats?.users.total}</div>
              <div className="text-xs text-white/60">Active {stats?.users.active}</div>
            </div>
            <div className="card">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Revenue</div>
              <div className="mt-3 text-2xl font-semibold text-white">
                {formatCurrency(stats?.revenue.thisMonth || 0)}
              </div>
              <div className="text-xs text-white/60">Growth {stats?.revenue.growth}%</div>
            </div>
            <div className="card">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Servers online</div>
              <div className="mt-3 text-2xl font-semibold text-white">
                {stats?.servers.online}/{stats?.servers.total}
              </div>
              <div className="text-xs text-white/60">Load {stats?.servers.load}%</div>
            </div>
            <div className="card">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Connections</div>
              <div className="mt-3 text-2xl font-semibold text-white">
                {stats?.connections.active}
              </div>
              <div className="text-xs text-white/60">Peak 24h {stats?.connections.peak24h}</div>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "users" ? (
        <div className="space-y-6">
          <div>
            <div className="text-sm text-white/60">User directory</div>
            <div className="text-3xl font-semibold text-white">Customer accounts</div>
          </div>
          <div className="card grid gap-4 md:grid-cols-[2fr_1fr]">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Search</label>
              <input
                className="input-field mt-2"
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Email address"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Plan</label>
              <select
                className="input-field mt-2"
                value={userPlan}
                onChange={(event) => setUserPlan(event.target.value)}
              >
                <option value="">All plans</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="ultimate">Ultimate</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4">
            {users.map((user) => (
              <div key={user.id} className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-white">{user.email}</div>
                  <div className="text-xs text-white/60">
                    {user.plan} - {user.status}
                  </div>
                </div>
                <div className="text-xs text-white/60">
                  Joined {formatDateLabel(user.createdAt)}
                </div>
                <div className="text-xs text-white/60">
                  Last active {formatDateLabel(user.lastActive)}
                </div>
                <div className="text-xs text-white/60">
                  Usage {formatBytes(user.usage.thisMonth)}
                </div>
              </div>
            ))}
          </div>
          {pagination ? (
            <div className="text-xs text-white/60">
              Page {pagination.page} of {pagination.pages} ({pagination.total} users)
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "servers" ? (
        <div className="space-y-6">
          <div>
            <div className="text-sm text-white/60">Infrastructure</div>
            <div className="text-3xl font-semibold text-white">Server fleet</div>
          </div>
          <div className="grid gap-4">
            {servers.map((server) => (
              <div key={server.id} className="card grid gap-3 md:grid-cols-[1.2fr_1fr_1fr]">
                <div>
                  <div className="text-white">{server.name}</div>
                  <div className="text-xs text-white/60">
                    {server.country} - {server.status}
                  </div>
                  <div className="text-xs text-white/60">{server.ip}</div>
                </div>
                <div className="text-xs text-white/60">
                  Load {server.load}% - Users {server.users}
                </div>
                <div className="text-xs text-white/60">
                  Bandwidth {formatBytes(server.bandwidth.in)} in / {formatBytes(server.bandwidth.out)} out
                </div>
                <div className="text-xs text-white/60">Uptime {server.uptime}%</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "subscriptions" || tab === "analytics" ? (
        <div className="space-y-6">
          <div>
            <div className="text-sm text-white/60">Revenue</div>
            <div className="text-3xl font-semibold text-white">Subscription analytics</div>
          </div>
          <div className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-white/60">Period</div>
            <select
              className="input-field md:max-w-xs"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
          {revenue ? (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
              <div className="card">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Total</div>
                <div className="mt-3 text-3xl font-semibold text-white">
                  {formatCurrency(revenue.total)}
                </div>
                <div className="mt-4 grid gap-2 text-sm text-white/70">
                  {Object.entries(revenue.breakdown).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span>{key.replace("_", " ")}</span>
                      <span>{formatCurrency(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Metrics</div>
                <div className="mt-4 space-y-3 text-sm text-white/70">
                  <div className="flex items-center justify-between">
                    <span>ARPU</span>
                    <span>${revenue.metrics.arpu}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Churn</span>
                    <span>{revenue.metrics.churn}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>LTV</span>
                    <span>${revenue.metrics.ltv}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {revenue ? (
            <div className="card">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Trend</div>
              <div className="mt-4 grid gap-3 md:grid-cols-6">
                {revenue.chart.map((point) => (
                  <div key={point.date} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/60">
                    <div>{point.date}</div>
                    <div className="mt-2 text-white">{formatCurrency(point.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "settings" ? (
        <div className="space-y-6">
          <div>
            <div className="text-sm text-white/60">Admin settings</div>
            <div className="text-3xl font-semibold text-white">Operational controls</div>
          </div>
          <div className="card space-y-4">
            <div className="text-sm text-white/70">
              The localhost demo runs in read-only mode for billing and server inventory. Use
              the API endpoints to simulate changes.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Fleet snapshot</div>
              <div className="mt-3">Servers available: {servers.length}</div>
              <div>Average load: {stats?.servers.load}%</div>
              <div>Online ratio: {stats?.servers.online}/{stats?.servers.total}</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
