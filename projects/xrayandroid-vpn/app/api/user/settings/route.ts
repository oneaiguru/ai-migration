import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { requireUser } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { user, error } = requireUser(request as any);
  if (error) {
    return error;
  }

  const db = getDb();
  const settings = db
    .prepare("SELECT * FROM user_settings WHERE user_id = ?")
    .get(user?.id) as Record<string, unknown> | undefined;

  return NextResponse.json({
    autoConnect: Boolean(settings?.auto_connect),
    autoConnectWifi: Boolean(settings?.auto_connect_wifi),
    killSwitch: Boolean(settings?.kill_switch),
    protocol: settings?.protocol ?? "vless",
    splitTunneling: {
      enabled: Boolean(settings?.split_tunneling_enabled),
      mode: settings?.split_tunneling_mode ?? "exclude",
      apps: JSON.parse(String(settings?.split_tunneling_apps ?? "[]")),
    },
    dns: {
      mode: settings?.dns_mode ?? "auto",
      primary: settings?.dns_primary ?? "1.1.1.1",
      secondary: settings?.dns_secondary ?? "1.0.0.1",
    },
    ipv6: Boolean(settings?.ipv6_enabled),
    lanBypass: Boolean(settings?.lan_bypass),
    mtu: settings?.mtu ?? 1500,
    socksPort: settings?.socks_port ?? 10808,
    udpEnabled: Boolean(settings?.udp_enabled),
  });
}

export async function PUT(request: Request) {
  const { user, error } = requireUser(request as any);
  if (error) {
    return error;
  }

  const body = await request.json();

  const db = getDb();
  const current = db
    .prepare("SELECT * FROM user_settings WHERE user_id = ?")
    .get(user?.id) as Record<string, unknown> | undefined;

  const updated = {
    auto_connect: body.autoConnect ?? current?.auto_connect ?? 0,
    auto_connect_wifi: body.autoConnectWifi ?? current?.auto_connect_wifi ?? 0,
    kill_switch: body.killSwitch ?? current?.kill_switch ?? 1,
    protocol: body.protocol ?? current?.protocol ?? "vless",
    split_tunneling_enabled:
      body.splitTunneling?.enabled ?? current?.split_tunneling_enabled ?? 0,
    split_tunneling_mode:
      body.splitTunneling?.mode ?? current?.split_tunneling_mode ?? "exclude",
    split_tunneling_apps: JSON.stringify(
      body.splitTunneling?.apps ?? JSON.parse(String(current?.split_tunneling_apps ?? "[]"))
    ),
    dns_mode: body.dns?.mode ?? current?.dns_mode ?? "auto",
    dns_primary: body.dns?.primary ?? current?.dns_primary ?? "1.1.1.1",
    dns_secondary: body.dns?.secondary ?? current?.dns_secondary ?? "1.0.0.1",
    ipv6_enabled: body.ipv6 ?? current?.ipv6_enabled ?? 0,
    lan_bypass: body.lanBypass ?? current?.lan_bypass ?? 1,
    mtu: body.mtu ?? current?.mtu ?? 1500,
    socks_port: body.socksPort ?? current?.socks_port ?? 10808,
    udp_enabled: body.udpEnabled ?? current?.udp_enabled ?? 1,
    user_id: user?.id,
  };

  db.prepare(
    `UPDATE user_settings
     SET auto_connect = @auto_connect,
         auto_connect_wifi = @auto_connect_wifi,
         kill_switch = @kill_switch,
         protocol = @protocol,
         split_tunneling_enabled = @split_tunneling_enabled,
         split_tunneling_mode = @split_tunneling_mode,
         split_tunneling_apps = @split_tunneling_apps,
         dns_mode = @dns_mode,
         dns_primary = @dns_primary,
         dns_secondary = @dns_secondary,
         ipv6_enabled = @ipv6_enabled,
         lan_bypass = @lan_bypass,
         mtu = @mtu,
         socks_port = @socks_port,
         udp_enabled = @udp_enabled
     WHERE user_id = @user_id`
  ).run(updated);

  return NextResponse.json({
    success: true,
    settings: {
      autoConnect: Boolean(updated.auto_connect),
      autoConnectWifi: Boolean(updated.auto_connect_wifi),
      killSwitch: Boolean(updated.kill_switch),
      protocol: updated.protocol,
      splitTunneling: {
        enabled: Boolean(updated.split_tunneling_enabled),
        mode: updated.split_tunneling_mode,
        apps: JSON.parse(updated.split_tunneling_apps),
      },
      dns: {
        mode: updated.dns_mode,
        primary: updated.dns_primary,
        secondary: updated.dns_secondary,
      },
      ipv6: Boolean(updated.ipv6_enabled),
      lanBypass: Boolean(updated.lan_bypass),
      mtu: updated.mtu,
      socksPort: updated.socks_port,
      udpEnabled: Boolean(updated.udp_enabled),
    },
  });
}
