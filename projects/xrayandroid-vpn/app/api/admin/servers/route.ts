import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/auth";

export const runtime = "nodejs";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export async function GET(request: Request) {
  const { error } = requireAdmin(request as any);
  if (error) {
    return error;
  }

  const db = getDb();
  const servers = db
    .prepare(
      "SELECT id, name, country, country_code, city, ip_address, status, load_percent, current_users, bandwidth_limit_gbps, uptime_percent FROM servers ORDER BY country, city"
    )
    .all() as Record<string, unknown>[];

  return NextResponse.json({
    servers: servers.map((server) => {
      const load = Number(server.load_percent ?? 0);
      const bandwidth = Number(server.bandwidth_limit_gbps ?? 10) * 1e9;
      const usageFactor = Math.min(Math.max(load / 100, 0.1), 0.95);
      const inbound = Math.round(bandwidth * usageFactor * 0.45);
      const outbound = Math.round(bandwidth * usageFactor * 0.65);

      return {
        id: server.id,
        name: server.name,
        country: server.country,
        ip: server.ip_address,
        status: server.status,
        load,
        users: Number(server.current_users ?? 0),
        bandwidth: {
          in: inbound,
          out: outbound,
        },
        uptime: Number(server.uptime_percent ?? 99.5),
      };
    }),
  });
}

export async function POST(request: Request) {
  const { error } = requireAdmin(request as any);
  if (error) {
    return error;
  }

  const body = await request.json();
  const country = String(body.country || "").trim();
  const countryCode = String(body.countryCode || "").trim().toUpperCase();
  const city = String(body.city || "").trim();

  if (!country || !countryCode || !city) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Country, country code, and city are required" },
      { status: 400 }
    );
  }

  const name = String(body.name || `${city} ${countryCode}`);
  const ip = String(body.ip || "185.200.10.10");
  const port = Number(body.port || 443);
  const protocol = String(body.protocol || "vless");
  const load = Number(body.load || 35);
  const maxUsers = Number(body.maxUsers || 1000);
  const currentUsers = Number(body.currentUsers || Math.round(maxUsers * load * 0.01));
  const bandwidthLimit = Number(body.bandwidthLimitGbps || 10);
  const premium = body.premium ? 1 : 0;
  const tags = Array.isArray(body.tags) ? body.tags : [];
  const status = String(body.status || "online");
  const uptime = Number(body.uptime || 99.7);

  const id = String(
    body.id || `srv_${countryCode.toLowerCase()}_${slugify(city)}_${Math.floor(Math.random() * 90 + 10)}`
  );

  const config = body.config ?? {
    address: ip,
    port,
    id: randomUUID(),
    encryption: "none",
    flow: "xtls-rprx-vision",
    network: "tcp",
    security: "tls",
    sni: "freegate.local",
  };

  const db = getDb();
  db.prepare(
    `INSERT INTO servers (
      id, name, country, country_code, city, ip_address, port, protocol,
      config_json, load_percent, max_users, current_users, bandwidth_limit_gbps,
      is_premium, tags, status, uptime_percent, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
  ).run(
    id,
    name,
    country,
    countryCode,
    city,
    ip,
    port,
    protocol,
    JSON.stringify(config),
    load,
    maxUsers,
    currentUsers,
    bandwidthLimit,
    premium,
    JSON.stringify(tags),
    status,
    uptime
  );

  return NextResponse.json({
    success: true,
    server: {
      id,
      name,
      country,
      ip,
      status,
      load,
      users: currentUsers,
      bandwidth: {
        in: Math.round(bandwidthLimit * 1e9 * 0.4),
        out: Math.round(bandwidthLimit * 1e9 * 0.6),
      },
      uptime,
    },
  });
}
