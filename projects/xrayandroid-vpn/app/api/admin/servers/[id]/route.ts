import { NextResponse } from "next/server";
import { getDb } from "../../../../../lib/db";
import { requireAdmin } from "../../../../../lib/auth";

export const runtime = "nodejs";

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const { error } = requireAdmin(request as any);
  if (error) {
    return error;
  }

  const body = await request.json();
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM servers WHERE id = ?")
    .get(context.params.id) as Record<string, unknown> | undefined;

  if (!existing) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Server not found" },
      { status: 404 }
    );
  }

  const updated = {
    name: String(body.name ?? existing.name),
    country: String(body.country ?? existing.country),
    country_code: String(body.countryCode ?? existing.country_code),
    city: String(body.city ?? existing.city),
    ip_address: String(body.ip ?? existing.ip_address),
    port: Number(body.port ?? existing.port),
    protocol: String(body.protocol ?? existing.protocol),
    config_json: JSON.stringify(body.config ?? JSON.parse(String(existing.config_json))),
    load_percent: Number(body.load ?? existing.load_percent),
    max_users: Number(body.maxUsers ?? existing.max_users),
    current_users: Number(body.currentUsers ?? existing.current_users),
    bandwidth_limit_gbps: Number(body.bandwidthLimitGbps ?? existing.bandwidth_limit_gbps),
    is_premium: body.premium === undefined ? existing.is_premium : body.premium ? 1 : 0,
    tags: JSON.stringify(body.tags ?? JSON.parse(String(existing.tags ?? "[]"))),
    status: String(body.status ?? existing.status),
    uptime_percent: Number(body.uptime ?? existing.uptime_percent),
  };

  db.prepare(
    `UPDATE servers
     SET name = ?, country = ?, country_code = ?, city = ?, ip_address = ?, port = ?,
         protocol = ?, config_json = ?, load_percent = ?, max_users = ?, current_users = ?,
         bandwidth_limit_gbps = ?, is_premium = ?, tags = ?, status = ?, uptime_percent = ?,
         updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    updated.name,
    updated.country,
    updated.country_code,
    updated.city,
    updated.ip_address,
    updated.port,
    updated.protocol,
    updated.config_json,
    updated.load_percent,
    updated.max_users,
    updated.current_users,
    updated.bandwidth_limit_gbps,
    updated.is_premium,
    updated.tags,
    updated.status,
    updated.uptime_percent,
    context.params.id
  );

  return NextResponse.json({
    success: true,
    server: {
      id: context.params.id,
      name: updated.name,
      country: updated.country,
      ip: updated.ip_address,
      status: updated.status,
      load: updated.load_percent,
      users: updated.current_users,
      bandwidth: {
        in: Math.round(updated.bandwidth_limit_gbps * 1e9 * 0.4),
        out: Math.round(updated.bandwidth_limit_gbps * 1e9 * 0.6),
      },
      uptime: updated.uptime_percent,
    },
  });
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const { error } = requireAdmin(request as any);
  if (error) {
    return error;
  }

  const db = getDb();
  const result = db
    .prepare("DELETE FROM servers WHERE id = ?")
    .run(context.params.id);

  if (result.changes === 0) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Server not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, message: "Server removed" });
}
