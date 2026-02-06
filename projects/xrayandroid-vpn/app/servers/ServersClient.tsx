"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

const tagFilters = ["all", "recommended", "streaming", "gaming", "p2p"];

export default function ServersClient() {
  const [servers, setServers] = useState<Server[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [tag, setTag] = useState("all");
  const [pings, setPings] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    async function load() {
      setMessage(null);

      try {
        const [serverRes, favRes] = await Promise.all([
          fetch("/api/servers"),
          fetch("/api/user/favorites", { credentials: "include" }),
        ]);

        const serverData = await serverRes.json();
        setServers(serverData.servers || []);

        if (favRes.status === 401) {
          setAuthError(true);
          setFavorites([]);
        } else {
          const favData = await favRes.json();
          setFavorites(favData.favorites || []);
        }
      } catch (err) {
        setMessage("Unable to load server list.");
      }
    }

    load();
  }, []);

  const filteredServers = useMemo(() => {
    const query = search.toLowerCase();
    return servers.filter((server) => {
      if (premiumOnly && !server.premium) {
        return false;
      }
      if (tag !== "all" && !server.tags.includes(tag)) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        server.country.toLowerCase().includes(query) ||
        server.city.toLowerCase().includes(query) ||
        server.countryCode.toLowerCase().includes(query)
      );
    });
  }, [servers, premiumOnly, tag, search]);

  useEffect(() => {
    async function loadPings() {
      if (filteredServers.length === 0) {
        return;
      }

      const ids = filteredServers.slice(0, 16).map((server) => server.id);
      try {
        const response = await fetch("/api/servers/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serverIds: ids }),
        });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setPings(data.pings || {});
      } catch (err) {
        setPings({});
      }
    }

    loadPings();
  }, [filteredServers]);

  async function toggleFavorite(serverId: string) {
    if (authError) {
      setMessage("Log in to save favorites.");
      return;
    }

    const isFavorite = favorites.includes(serverId);
    try {
      const response = await fetch(
        isFavorite ? `/api/user/favorites/${serverId}` : "/api/user/favorites",
        {
          method: isFavorite ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: isFavorite ? undefined : JSON.stringify({ serverId }),
        }
      );

      if (!response.ok) {
        setMessage("Unable to update favorites.");
        return;
      }

      setFavorites((prev) =>
        isFavorite ? prev.filter((id) => id !== serverId) : [...prev, serverId]
      );
    } catch (err) {
      setMessage("Unable to update favorites.");
    }
  }

  async function handleConnect(serverId: string) {
    setMessage(null);
    try {
      const response = await fetch("/api/vpn/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ serverId, protocol: "vless" }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.message || "Unable to connect.");
        return;
      }
      setMessage("Connection started. Check dashboard for status.");
    } catch (err) {
      setMessage("Unable to connect.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm text-white/60">Server directory</div>
          <div className="text-3xl font-semibold text-white">Pick your route</div>
        </div>
        <Link href="/pricing" className="btn-outline">
          Upgrade for premium nodes
        </Link>
      </div>

      <div className="card">
        <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">Search</label>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input-field mt-2"
              placeholder="Country, city, or code"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">Tag</label>
            <select
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              className="input-field mt-2"
            >
              {tagFilters.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All tags" : item}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-3">
            <button
              type="button"
              className="toggle"
              data-on={premiumOnly ? "true" : "false"}
              onClick={() => setPremiumOnly((prev) => !prev)}
            >
              <span />
            </button>
            <span className="text-sm text-white/70">Premium only</span>
          </div>
        </div>
        {message ? <div className="mt-4 text-sm text-sun">{message}</div> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {filteredServers.map((server) => (
          <div key={server.id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-white">
                  {server.country} - {server.city}
                </div>
                <div className="text-sm text-white/60">
                  {server.protocol.toUpperCase()} | {server.status}
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => toggleFavorite(server.id)}
              >
                {favorites.includes(server.id) ? "Favorited" : "Favorite"}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {server.tags.map((tagItem) => (
                <span key={tagItem} className="tag">
                  {tagItem}
                </span>
              ))}
              {server.premium ? <span className="tag">Premium</span> : null}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-white/70">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Load</div>
                <div className="mt-2 text-white">{server.load}%</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Ping</div>
                <div className="mt-2 text-white">
                  {pings[server.id] ? `${pings[server.id]}ms` : "--"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Port</div>
                <div className="mt-2 text-white">{server.port}</div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleConnect(server.id)}
              >
                Connect
              </button>
              <Link href={`/api/servers/${server.id}/config`} className="btn-outline">
                View config
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
