import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { requireUser } from "../../../../lib/auth";
import { formatDate, formatDateOnly } from "../../../../lib/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { user, error } = requireUser(request as any);
  if (error) {
    return error;
  }

  const body = await request.json();
  const sessionId = String(body.sessionId || "");
  const bytesDown = Number(body.bytesDown || 0);
  const bytesUp = Number(body.bytesUp || 0);
  const duration = Number(body.duration || 0);

  if (!sessionId) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Session ID required" },
      { status: 400 }
    );
  }

  const db = getDb();
  const endedAt = formatDate(new Date());

  db.prepare(
    "UPDATE vpn_sessions SET ended_at = ?, duration_seconds = ?, bytes_down = ?, bytes_up = ? WHERE id = ? AND user_id = ?"
  ).run(endedAt, duration, bytesDown, bytesUp, sessionId, user?.id);

  const today = formatDateOnly(new Date());
  const quota = db
    .prepare("SELECT * FROM usage_quotas WHERE user_id = ? AND date = ?")
    .get(user?.id, today) as Record<string, unknown> | undefined;

  if (quota) {
    const updated = Number(quota.bytes_used ?? 0) + bytesDown + bytesUp;
    db.prepare(
      "UPDATE usage_quotas SET bytes_used = ?, updated_at = ? WHERE id = ?"
    ).run(updated, endedAt, quota.id);
  } else {
    const limit = user?.plan === "free" || Number(user?.is_guest) === 1 ? 524288000 : null;
    db.prepare(
      "INSERT INTO usage_quotas (user_id, date, bytes_used, quota_limit) VALUES (?, ?, ?, ?)"
    ).run(user?.id, today, bytesDown + bytesUp, limit);
  }

  return NextResponse.json({
    success: true,
    session: {
      id: sessionId,
      duration,
      bytesDown,
      bytesUp,
    },
  });
}
