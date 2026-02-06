"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const protocols = ["vless", "vmess", "trojan", "shadowsocks"];

type Settings = {
  autoConnect: boolean;
  autoConnectWifi: boolean;
  killSwitch: boolean;
  protocol: string;
  splitTunneling: {
    enabled: boolean;
    mode: "include" | "exclude";
    apps: string[];
  };
  dns: {
    mode: "auto" | "cloudflare" | "google" | "custom";
    primary: string;
    secondary: string;
  };
  ipv6: boolean;
  lanBypass: boolean;
  mtu: number;
  socksPort: number;
  udpEnabled: boolean;
};

export default function SettingsClient() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [apps, setApps] = useState<string[]>([]);
  const [newApp, setNewApp] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [settingsRes, appsRes] = await Promise.all([
          fetch("/api/user/settings", { credentials: "include" }),
          fetch("/api/user/apps", { credentials: "include" }),
        ]);

        if (settingsRes.status === 401) {
          setAuthError(true);
          return;
        }

        const settingsData = await settingsRes.json();
        const appsData = await appsRes.json();
        setSettings(settingsData);
        setApps(appsData.apps || []);
      } catch (err) {
        setMessage("Unable to load settings.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function saveSettings() {
    if (!settings) {
      return;
    }
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...settings,
          splitTunneling: {
            ...settings.splitTunneling,
            apps,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.message || "Unable to save settings.");
        return;
      }
      setSettings(data.settings);
      setMessage("Settings updated.");
    } catch (err) {
      setMessage("Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  async function updateApps(nextApps: string[]) {
    setApps(nextApps);
    try {
      const response = await fetch("/api/user/apps", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ apps: nextApps }),
      });
      if (!response.ok) {
        setMessage("Unable to save app list.");
      }
    } catch (err) {
      setMessage("Unable to save app list.");
    }
  }

  if (authError) {
    return (
      <div className="card">
        <div className="text-lg font-semibold text-white">Sign in required</div>
        <p className="mt-3 text-sm text-white/70">
          Log in to manage VPN settings and split tunneling rules.
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

  if (loading || !settings) {
    return <div className="text-sm text-white/70">Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-white/60">VPN preferences</div>
          <div className="text-3xl font-semibold text-white">Connection settings</div>
        </div>
        <button type="button" className="btn-primary" onClick={saveSettings} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <div className="text-sm text-white/60">Quick toggles</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white">Auto-connect</div>
              <div className="text-xs text-white/60">Connect when the app opens.</div>
            </div>
            <button
              type="button"
              className="toggle"
              data-on={settings.autoConnect ? "true" : "false"}
              onClick={() =>
                setSettings({
                  ...settings,
                  autoConnect: !settings.autoConnect,
                })
              }
            >
              <span />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white">Auto-connect on WiFi</div>
              <div className="text-xs text-white/60">Enable safe networks only.</div>
            </div>
            <button
              type="button"
              className="toggle"
              data-on={settings.autoConnectWifi ? "true" : "false"}
              onClick={() =>
                setSettings({
                  ...settings,
                  autoConnectWifi: !settings.autoConnectWifi,
                })
              }
            >
              <span />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white">Kill switch</div>
              <div className="text-xs text-white/60">Block traffic if the tunnel drops.</div>
            </div>
            <button
              type="button"
              className="toggle"
              data-on={settings.killSwitch ? "true" : "false"}
              onClick={() => setSettings({ ...settings, killSwitch: !settings.killSwitch })}
            >
              <span />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white">IPv6</div>
              <div className="text-xs text-white/60">Enable IPv6 tunneling.</div>
            </div>
            <button
              type="button"
              className="toggle"
              data-on={settings.ipv6 ? "true" : "false"}
              onClick={() => setSettings({ ...settings, ipv6: !settings.ipv6 })}
            >
              <span />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white">LAN bypass</div>
              <div className="text-xs text-white/60">Allow local device discovery.</div>
            </div>
            <button
              type="button"
              className="toggle"
              data-on={settings.lanBypass ? "true" : "false"}
              onClick={() => setSettings({ ...settings, lanBypass: !settings.lanBypass })}
            >
              <span />
            </button>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="text-sm text-white/60">Protocol & DNS</div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">Protocol</label>
            <select
              className="input-field mt-2"
              value={settings.protocol}
              onChange={(event) => setSettings({ ...settings, protocol: event.target.value })}
            >
              {protocols.map((protocol) => (
                <option key={protocol} value={protocol}>
                  {protocol.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">DNS mode</label>
            <select
              className="input-field mt-2"
              value={settings.dns.mode}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  dns: { ...settings.dns, mode: event.target.value as Settings["dns"]["mode"] },
                })
              }
            >
              <option value="auto">Auto</option>
              <option value="cloudflare">Cloudflare</option>
              <option value="google">Google</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Primary DNS</label>
              <input
                type="text"
                className="input-field mt-2"
                value={settings.dns.primary}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    dns: { ...settings.dns, primary: event.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Secondary DNS</label>
              <input
                type="text"
                className="input-field mt-2"
                value={settings.dns.secondary}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    dns: { ...settings.dns, secondary: event.target.value },
                  })
                }
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">MTU</label>
              <input
                type="number"
                className="input-field mt-2"
                value={settings.mtu}
                onChange={(event) =>
                  setSettings({ ...settings, mtu: Number(event.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">SOCKS port</label>
              <input
                type="number"
                className="input-field mt-2"
                value={settings.socksPort}
                onChange={(event) =>
                  setSettings({ ...settings, socksPort: Number(event.target.value) })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="card space-y-4">
          <div className="text-sm text-white/60">Split tunneling</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white">Split tunneling</div>
              <div className="text-xs text-white/60">Route select apps outside the tunnel.</div>
            </div>
            <button
              type="button"
              className="toggle"
              data-on={settings.splitTunneling.enabled ? "true" : "false"}
              onClick={() =>
                setSettings({
                  ...settings,
                  splitTunneling: {
                    ...settings.splitTunneling,
                    enabled: !settings.splitTunneling.enabled,
                  },
                })
              }
            >
              <span />
            </button>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">Mode</label>
            <select
              className="input-field mt-2"
              value={settings.splitTunneling.mode}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  splitTunneling: {
                    ...settings.splitTunneling,
                    mode: event.target.value as Settings["splitTunneling"]["mode"],
                  },
                })
              }
            >
              <option value="exclude">Exclude apps from VPN</option>
              <option value="include">Only tunnel listed apps</option>
            </select>
          </div>
          <div className="grid gap-3">
            {apps.length === 0 ? (
              <div className="text-sm text-white/60">No apps added yet.</div>
            ) : (
              apps.map((app) => (
                <div
                  key={app}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <span className="text-white">{app}</span>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => updateApps(apps.filter((item) => item !== app))}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="text"
              value={newApp}
              onChange={(event) => setNewApp(event.target.value)}
              className="input-field"
              placeholder="com.example.app"
            />
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                if (!newApp.trim()) {
                  return;
                }
                updateApps([...apps, newApp.trim()]);
                setNewApp("");
              }}
            >
              Add app
            </button>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="text-sm text-white/60">Transport</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white">UDP enabled</div>
              <div className="text-xs text-white/60">Allow UDP transport for streaming.</div>
            </div>
            <button
              type="button"
              className="toggle"
              data-on={settings.udpEnabled ? "true" : "false"}
              onClick={() => setSettings({ ...settings, udpEnabled: !settings.udpEnabled })}
            >
              <span />
            </button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <div className="text-xs uppercase tracking-[0.2em] text-white/50">Split tunneling notes</div>
            <p className="mt-3">
              Apps list is synced to the mock API. Android packages should match the
              installed app identifiers used by the VPN client.
            </p>
          </div>
          {message ? <div className="text-sm text-sun">{message}</div> : null}
        </div>
      </div>
    </div>
  );
}
