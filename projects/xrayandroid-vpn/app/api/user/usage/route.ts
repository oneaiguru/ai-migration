import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { requireUser } from "../../../../lib/auth";
import { addDays, formatDateOnly } from "../../../../lib/utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { user, error } = requireUser(request as any);
  if (error) {
    return error;
  }

  const db = getDb();
  const now = new Date();
  const today = formatDateOnly(now);
  const monthPrefix = today.slice(0, 7);

  const todayQuota = db
    .prepare("SELECT * FROM usage_quotas WHERE user_id = ? AND date = ?")
    .get(user?.id, today) as Record<string, unknown> | undefined;

  const monthUsage = db
    .prepare(
      "SELECT SUM(bytes_used) as total FROM usage_quotas WHERE user_id = ? AND date LIKE ?"
    )
    .get(user?.id, `${monthPrefix}%`) as { total: number | null };

  const sessions = db
    .prepare(
      "SELECT SUM(duration_seconds) as duration, COUNT(*) as count FROM vpn_sessions WHERE user_id = ? AND started_at >= ?"
    )
    .get(user?.id, `${monthPrefix}-01`) as { duration: number | null; count: number | null };

  const history = db
    .prepare(
      "SELECT date, bytes_used FROM usage_quotas WHERE user_id = ? ORDER BY date DESC LIMIT 7"
    )
    .all(user?.id) as Record<string, unknown>[];

  const todayBytes = Number(todayQuota?.bytes_used ?? 0);
  const monthBytes = Number(monthUsage.total ?? 0);
  const connectionTime = Number(sessions.duration ?? 0);

  const response: Record<string, unknown> = {
    today: {
      bytesDown: todayBytes,
      bytesUp: Math.floor(todayBytes * 0.2),
      connectionTime: Math.floor(connectionTime * 0.3),
    },
    thisMonth: {
      bytesDown: monthBytes,
      bytesUp: Math.floor(monthBytes * 0.25),
      connectionTime,
      sessions: Number(sessions.count ?? 0),
    },
    quota: {
      daily: null,
      used: monthBytes,
      remaining: null,
    },
    history: history.map((row) => ({
      date: row.date,
      bytesDown: row.bytes_used,
      bytesUp: Math.floor(Number(row.bytes_used ?? 0) * 0.25),
    })),
  };

  if (user?.plan === "free" || Number(user?.is_guest) === 1) {
    const limit = Number(todayQuota?.quota_limit ?? 524288000);
    const remaining = Math.max(limit - todayBytes, 0);
    response.quota = {
      daily: limit,
      used: todayBytes,
      remaining,
      resetsAt: addDays(new Date(today), 1).toISOString(),
    };
  }

  return NextResponse.json(response);
}
