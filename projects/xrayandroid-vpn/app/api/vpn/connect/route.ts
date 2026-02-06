import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { requireUser } from "../../../../lib/auth";
import { formatDate, formatDateOnly, addDays } from "../../../../lib/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { user, error } = requireUser(request as any);
  if (error) {
    return error;
  }

  const body = await request.json();
  const serverId = String(body.serverId || "");
  const protocol = String(body.protocol || "vless");
  const deviceId = body.deviceId ? String(body.deviceId) : null;

  const db = getDb();
  const today = formatDateOnly(new Date());
  const quotaRow = db
    .prepare("SELECT * FROM usage_quotas WHERE user_id = ? AND date = ?")
    .get(user?.id, today) as Record<string, unknown> | undefined;

  if ((user?.plan === "free" || Number(user?.is_guest) === 1) && quotaRow) {
    const limit = Number(quotaRow.quota_limit ?? 524288000);
    const used = Number(quotaRow.bytes_used ?? 0);
    if (limit && used >= limit) {
      return NextResponse.json(
        {
          error: "QUOTA_EXCEEDED",
          message: "Daily limit reached",
          quotaResetAt: formatDate(addDays(new Date(today), 1)),
          upgradeUrl: "/pricing",
        },
        { status: 403 }
      );
    }
  }

  const activeSession = db
    .prepare(
      "SELECT * FROM vpn_sessions WHERE user_id = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1"
    )
    .get(user?.id) as Record<string, unknown> | undefined;

  if (activeSession) {
    const server = db
      .prepare("SELECT * FROM servers WHERE id = ?")
      .get(activeSession.server_id) as Record<string, unknown> | undefined;

    return NextResponse.json({
      success: true,
      session: {
        id: activeSession.id,
        serverId: activeSession.server_id,
        startTime: activeSession.started_at,
        quotaRemaining: null,
      },
      config: server ? JSON.parse(String(server.config_json)) : null,
    });
  }

  const server = serverId
    ? db.prepare("SELECT * FROM servers WHERE id = ?").get(serverId)
    : db
        .prepare("SELECT * FROM servers ORDER BY load_percent ASC LIMIT 1")
        .get();

  if (!server) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Server not found" },
      { status: 404 }
    );
  }

  const sessionId = `sess_${Math.random().toString(36).slice(2, 10)}`;
  const startedAt = formatDate(new Date());

  db.prepare(
    `INSERT INTO vpn_sessions (
      id, user_id, device_id, server_id, protocol, started_at, bytes_down, bytes_up
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(sessionId, user?.id, deviceId, server.id, protocol, startedAt, 0, 0);

  const quotaRemaining = quotaRow
    ? Math.max(Number(quotaRow.quota_limit ?? 0) - Number(quotaRow.bytes_used ?? 0), 0)
    : null;

  return NextResponse.json({
    success: true,
    session: {
      id: sessionId,
      serverId: server.id,
      startTime: startedAt,
      quotaRemaining:
        user?.plan === "free" || Number(user?.is_guest) === 1
          ? quotaRemaining
          : null,
    },
    config: JSON.parse(String(server.config_json)),
  });
}
